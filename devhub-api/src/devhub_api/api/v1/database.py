"""
Database API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text, inspect
from typing import Dict, Any, List
from ...database import get_db, engine
from datetime import datetime, timezone
import time

router = APIRouter()

@router.get("/health")
async def database_health() -> Dict[str, str]:
    """Database module health check"""
    return {"status": "healthy", "module": "database"}

@router.get("/stats")
async def get_database_stats(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Get database statistics"""
    try:
        # Get inspector for database metadata - use the same session
        inspector = inspect(db.bind)
        table_names = inspector.get_table_names()
        
        total_tables = len(table_names)
        total_records = 0
        table_stats = []
        
        # Get record counts for each table
        for table_name in table_names:
            try:
                result = db.execute(text(f"SELECT COUNT(*) FROM {table_name}"))
                count = result.scalar()
                total_records += count
                table_stats.append({
                    "table_name": table_name,
                    "record_count": count
                })
            except Exception as e:
                print(f"Error counting records for table {table_name}: {e}")
                table_stats.append({
                    "table_name": table_name,
                    "record_count": 0
                })
        
        # Get database size
        try:
            size_result = db.execute(text("SELECT pg_size_pretty(pg_database_size(current_database()))"))
            database_size = size_result.scalar()
        except Exception:
            database_size = "Unknown"
            
        return {
            "total_tables": total_tables,
            "total_records": total_records,
            "database_size": database_size,
            "last_backup": None,  # TODO: Implement backup tracking
            "active_connections": 0,  # TODO: Get actual connection count
            "table_stats": table_stats
        }
    except Exception as e:
        print(f"Error getting database stats: {e}")
        return {
            "total_tables": 0,
            "total_records": 0,
            "database_size": "0 MB",
            "last_backup": None,
            "active_connections": 0,
            "table_stats": []
        }

@router.get("/validate")
async def validate_database(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Validate database integrity"""
    try:
        issues = {
            "errors": [],
            "warnings": [],
            "suggestions": [],
            "relationship_issues": [],
            "id_system_issues": []
        }
        
        # Use the same database session to avoid connection issues
        inspector = inspect(db.bind)
        table_names = inspector.get_table_names()
        
        total_issues = 0
        severity = "healthy"
        
        # Check for tables without primary keys
        for table_name in table_names:
            try:
                pk_constraint = inspector.get_pk_constraint(table_name)
                if not pk_constraint or not pk_constraint['constrained_columns']:
                    issues["warnings"].append(f"Table '{table_name}' has no primary key")
                    total_issues += 1
                    severity = "warning"
            except Exception as e:
                print(f"Error checking primary key for table {table_name}: {e}")
                continue
        
        # Check for empty tables (except alembic_version)
        for table_name in table_names:
            if table_name == 'alembic_version':
                continue
            try:
                result = db.execute(text(f"SELECT COUNT(*) FROM {table_name}"))
                count = result.scalar() or 0
                if count == 0:
                    issues["suggestions"].append(f"Table '{table_name}' is empty")
            except Exception as e:
                print(f"Error checking table count for {table_name}: {e}")
                continue
        
        # Determine overall status
        status = "valid" if total_issues == 0 else "issues_found"
        if severity == "healthy" and total_issues == 0:
            severity = "healthy"
        
        return {
            "status": status,
            "severity": severity,
            "total_issues": total_issues,
            "issues": issues,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        
    except Exception as e:
        print(f"Error validating database: {e}")
        return {
            "status": "error",
            "severity": "critical",
            "total_issues": 1,
            "issues": {
                "errors": [f"Failed to validate database: {str(e)}"],
                "warnings": [],
                "suggestions": [],
                "relationship_issues": [],
                "id_system_issues": []
            },
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

@router.get("/tables")
async def get_database_tables(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Get list of database tables"""
    try:
        # Use the same database session to avoid connection issues
        inspector = inspect(db.bind)
        table_names = inspector.get_table_names()
        tables = []
        
        for table_name in table_names:
            try:
                # Get column information
                columns = inspector.get_columns(table_name)
                
                # Get row count
                result = db.execute(text(f"SELECT COUNT(*) FROM {table_name}"))
                row_count = result.scalar() or 0
                
                # Get foreign key relationships
                foreign_keys = inspector.get_foreign_keys(table_name)
                relationships = []
                for fk in foreign_keys:
                    relationships.append({
                        "foreign_table_name": fk['referred_table'],
                        "foreign_column_name": fk['referred_columns'][0] if fk['referred_columns'] else None
                    })
                
                table_data = {
                    "table_name": table_name,
                    "columns": [
                        {
                            "column_name": col['name'],
                            "data_type": str(col['type']),
                            "is_nullable": "YES" if col['nullable'] else "NO",
                            "column_default": str(col['default']) if col['default'] is not None else None
                        }
                        for col in columns
                    ],
                    "row_count": row_count,
                    "relationships": relationships
                }
                tables.append(table_data)
                
            except Exception as e:
                print(f"Error processing table {table_name}: {e}")
                continue
        
        return {"tables": tables}
        
    except Exception as e:
        print(f"Error getting database tables: {e}")
        return {"tables": []}

@router.post("/query")
async def execute_database_query(query_data: Dict[str, Any], db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Execute a database query"""
    try:
        query = query_data.get("query", "").strip()
        if not query:
            raise HTTPException(status_code=400, detail="Query is required")
        
        # Basic security check - only allow SELECT statements for now
        if not query.upper().startswith("SELECT"):
            raise HTTPException(status_code=400, detail="Only SELECT statements are allowed")
        
        start_time = time.time()
        result = db.execute(text(query))
        execution_time = int((time.time() - start_time) * 1000)  # Convert to milliseconds
        
        # Get column names
        columns = list(result.keys()) if result.keys() else []
        
        # Get rows
        rows = []
        for row in result:
            row_dict = {}
            for i, column in enumerate(columns):
                row_dict[column] = row[i]
            rows.append(row_dict)
        
        return {
            "success": True,
            "columns": columns,
            "rows": rows,
            "row_count": len(rows),
            "execution_time": execution_time
        }
        
    except HTTPException:
        raise
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "columns": [],
            "rows": [],
            "row_count": 0,
            "execution_time": 0
        }

@router.get("/table/{table_name}")
async def get_table_data(table_name: str, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Get data from a specific table"""
    try:
        # Validate table name exists
        inspector = inspect(engine)
        table_names = inspector.get_table_names()
        
        if table_name not in table_names:
            raise HTTPException(status_code=404, detail=f"Table '{table_name}' not found")
        
        # Get column information
        columns = inspector.get_columns(table_name)
        column_info = [
            {
                "column_name": col['name'],
                "data_type": str(col['type']),
                "is_nullable": "YES" if col['nullable'] else "NO",
                "column_default": str(col['default']) if col['default'] is not None else None
            }
            for col in columns
        ]
        
        # Get total row count
        count_result = db.execute(text(f"SELECT COUNT(*) FROM {table_name}"))
        total_rows = count_result.scalar() or 0
        
        # Get sample data (limit to 100 rows)
        data_result = db.execute(text(f"SELECT * FROM {table_name} LIMIT 100"))
        column_names = list(data_result.keys()) if data_result.keys() else []
        
        data = []
        for row in data_result:
            row_dict = {}
            for i, col_name in enumerate(column_names):
                row_dict[col_name] = row[i]
            data.append(row_dict)
        
        return {
            "table": table_name,
            "columns": column_info,
            "data": data,
            "total_rows": total_rows,
            "displayed_rows": len(data)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting table data for {table_name}: {e}")
        return {
            "table": table_name,
            "columns": [],
            "data": [],
            "total_rows": 0,
            "displayed_rows": 0
        }

@router.post("/table/{table_name}/column")
async def add_column(table_name: str, column_data: Dict[str, Any], db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Add a new column to a table"""
    try:
        # Validate table name exists
        inspector = inspect(engine)
        table_names = inspector.get_table_names()
        
        if table_name not in table_names:
            raise HTTPException(status_code=404, detail=f"Table '{table_name}' not found")
        
        # Get column information
        column_name = column_data.get("column_name")
        data_type = column_data.get("data_type", "VARCHAR(255)")
        is_nullable = column_data.get("is_nullable", "YES")
        column_default = column_data.get("column_default")
        
        if not column_name:
            raise HTTPException(status_code=400, detail="Column name is required")
        
        # Check if column already exists
        existing_columns = inspector.get_columns(table_name)
        existing_column_names = [col['name'] for col in existing_columns]
        
        if column_name in existing_column_names:
            raise HTTPException(status_code=400, detail=f"Column '{column_name}' already exists in table '{table_name}'")
        
        # Build ALTER TABLE statement
        nullable_clause = "NULL" if is_nullable == "YES" else "NOT NULL"
        default_clause = f"DEFAULT {column_default}" if column_default else ""
        
        alter_query = f"ALTER TABLE {table_name} ADD COLUMN {column_name} {data_type} {nullable_clause} {default_clause}"
        
        # Execute the ALTER TABLE statement
        db.execute(text(alter_query))
        db.commit()
        
        return {
            "success": True,
            "message": f"Column '{column_name}' added to table '{table_name}' successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Error adding column to table {table_name}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to add column: {str(e)}")

@router.put("/table/{table_name}/column/{column_name}")
async def update_column(table_name: str, column_name: str, column_data: Dict[str, Any], db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Update an existing column in a table"""
    try:
        # Validate table name exists
        inspector = inspect(engine)
        table_names = inspector.get_table_names()
        
        if table_name not in table_names:
            raise HTTPException(status_code=404, detail=f"Table '{table_name}' not found")
        
        # Check if column exists
        columns = inspector.get_columns(table_name)
        column_exists = any(col['name'] == column_name for col in columns)
        
        if not column_exists:
            raise HTTPException(status_code=404, detail=f"Column '{column_name}' not found in table '{table_name}'")
        
        # Get update parameters
        new_data_type = column_data.get("data_type")
        new_nullable = column_data.get("is_nullable")
        new_default = column_data.get("column_default")
        
        # Build ALTER TABLE statements
        alter_statements = []
        
        if new_data_type:
            alter_statements.append(f"ALTER TABLE {table_name} ALTER COLUMN {column_name} TYPE {new_data_type}")
        
        if new_nullable is not None:
            if new_nullable == "YES":
                alter_statements.append(f"ALTER TABLE {table_name} ALTER COLUMN {column_name} DROP NOT NULL")
            else:
                alter_statements.append(f"ALTER TABLE {table_name} ALTER COLUMN {column_name} SET NOT NULL")
        
        if new_default is not None:
            if new_default:
                alter_statements.append(f"ALTER TABLE {table_name} ALTER COLUMN {column_name} SET DEFAULT {new_default}")
            else:
                alter_statements.append(f"ALTER TABLE {table_name} ALTER COLUMN {column_name} DROP DEFAULT")
        
        # Execute the ALTER TABLE statements
        for statement in alter_statements:
            db.execute(text(statement))
        
        db.commit()
        
        return {
            "success": True,
            "message": f"Column '{column_name}' updated successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Error updating column {column_name} in table {table_name}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to update column: {str(e)}")

@router.delete("/table/{table_name}/column/{column_name}")
async def delete_column(table_name: str, column_name: str, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Delete a column from a table"""
    try:
        # Validate table name exists
        inspector = inspect(engine)
        table_names = inspector.get_table_names()
        
        if table_name not in table_names:
            raise HTTPException(status_code=404, detail=f"Table '{table_name}' not found")
        
        # Check if column exists
        columns = inspector.get_columns(table_name)
        column_exists = any(col['name'] == column_name for col in columns)
        
        if not column_exists:
            raise HTTPException(status_code=404, detail=f"Column '{column_name}' not found in table '{table_name}'")
        
        # Build ALTER TABLE statement
        alter_query = f"ALTER TABLE {table_name} DROP COLUMN {column_name}"
        
        # Execute the ALTER TABLE statement
        db.execute(text(alter_query))
        db.commit()
        
        return {
            "success": True,
            "message": f"Column '{column_name}' deleted from table '{table_name}' successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Error deleting column {column_name} from table {table_name}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to delete column: {str(e)}")

@router.put("/table/{table_name}/data")
async def update_table_data(table_name: str, data: Dict[str, Any], db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Update table data (bulk update)"""
    try:
        # Validate table name exists
        inspector = inspect(engine)
        table_names = inspector.get_table_names()
        
        if table_name not in table_names:
            raise HTTPException(status_code=404, detail=f"Table '{table_name}' not found")
        
        updated_data = data.get("data", [])
        if not updated_data:
            raise HTTPException(status_code=400, detail="No data provided for update")
        
        # Get table columns to validate structure
        columns = inspector.get_columns(table_name)
        column_names = [col['name'] for col in columns]
        
        # Find primary key column
        pk_constraint = inspector.get_pk_constraint(table_name)
        primary_key_columns = pk_constraint.get('constrained_columns', [])
        
        if not primary_key_columns:
            raise HTTPException(status_code=400, detail=f"Table '{table_name}' has no primary key defined")
        
        # Update each row
        updated_count = 0
        for row_data in updated_data:
            # Build WHERE clause using primary key
            where_conditions = []
            for pk_col in primary_key_columns:
                if pk_col in row_data:
                    where_conditions.append(f"{pk_col} = :{pk_col}")
            
            if not where_conditions:
                continue  # Skip rows without primary key values
            
            # Build SET clause
            set_clause = []
            for col_name, value in row_data.items():
                if col_name in column_names and col_name not in primary_key_columns:
                    set_clause.append(f"{col_name} = :{col_name}")
            
            if not set_clause:
                continue  # Skip rows with no updateable columns
            
            # Build and execute UPDATE statement
            update_query = f"""
                UPDATE {table_name} 
                SET {', '.join(set_clause)} 
                WHERE {' AND '.join(where_conditions)}
            """
            
            db.execute(text(update_query), row_data)
            updated_count += 1
        
        db.commit()
        
        return {
            "success": True,
            "message": f"Updated {updated_count} rows in table '{table_name}'"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Error updating table data for {table_name}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to update table data: {str(e)}")

@router.post("/table/{table_name}/row")
async def add_table_row(table_name: str, row_data: Dict[str, Any], db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Add a new row to a table"""
    try:
        # Validate table name exists
        inspector = inspect(engine)
        table_names = inspector.get_table_names()
        
        if table_name not in table_names:
            raise HTTPException(status_code=404, detail=f"Table '{table_name}' not found")
        
        # Get table columns to validate structure
        columns = inspector.get_columns(table_name)
        column_names = [col['name'] for col in columns]
        
        # Filter row data to only include valid columns
        filtered_data = {k: v for k, v in row_data.items() if k in column_names and v is not None and v != ''}
        
        if not filtered_data:
            raise HTTPException(status_code=400, detail="No valid data provided for insert")
        
        # Build INSERT statement
        column_list = ', '.join(filtered_data.keys())
        value_placeholders = ', '.join([f':{key}' for key in filtered_data.keys()])
        
        insert_query = f"INSERT INTO {table_name} ({column_list}) VALUES ({value_placeholders})"
        
        # Execute the INSERT statement
        result = db.execute(text(insert_query), filtered_data)
        db.commit()
        
        return {
            "success": True,
            "message": f"Row added to table '{table_name}' successfully",
            "data": filtered_data
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Error adding row to table {table_name}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to add row: {str(e)}")

@router.delete("/table/{table_name}/rows")
async def delete_table_rows(table_name: str, data: Dict[str, Any], db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Delete rows from a table"""
    try:
        # Validate table name exists
        inspector = inspect(engine)
        table_names = inspector.get_table_names()
        
        if table_name not in table_names:
            raise HTTPException(status_code=404, detail=f"Table '{table_name}' not found")
        
        rows_to_delete = data.get("rows", [])
        if not rows_to_delete:
            raise HTTPException(status_code=400, detail="No rows specified for deletion")
        
        # Find primary key column
        pk_constraint = inspector.get_pk_constraint(table_name)
        primary_key_columns = pk_constraint.get('constrained_columns', [])
        
        if not primary_key_columns:
            raise HTTPException(status_code=400, detail=f"Table '{table_name}' has no primary key defined")
        
        # Delete each row
        deleted_count = 0
        for row_data in rows_to_delete:
            # Build WHERE clause using primary key
            where_conditions = []
            params = {}
            for pk_col in primary_key_columns:
                if pk_col in row_data:
                    where_conditions.append(f"{pk_col} = :{pk_col}")
                    params[pk_col] = row_data[pk_col]
            
            if not where_conditions:
                continue  # Skip rows without primary key values
            
            # Build and execute DELETE statement
            delete_query = f"DELETE FROM {table_name} WHERE {' AND '.join(where_conditions)}"
            
            result = db.execute(text(delete_query), params)
            if result.rowcount > 0:
                deleted_count += 1
        
        db.commit()
        
        return {
            "success": True,
            "message": f"Deleted {deleted_count} rows from table '{table_name}'"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Error deleting rows from table {table_name}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to delete rows: {str(e)}")
