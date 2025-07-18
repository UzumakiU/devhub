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
        # Get inspector for database metadata
        inspector = inspect(engine)
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
        
        inspector = inspect(engine)
        table_names = inspector.get_table_names()
        
        total_issues = 0
        severity = "healthy"
        
        # Check for tables without primary keys
        for table_name in table_names:
            pk_constraint = inspector.get_pk_constraint(table_name)
            if not pk_constraint or not pk_constraint['constrained_columns']:
                issues["warnings"].append(f"Table '{table_name}' has no primary key")
                total_issues += 1
                severity = "warning"
        
        # Check for empty tables (except alembic_version)
        for table_name in table_names:
            if table_name == 'alembic_version':
                continue
            try:
                result = db.execute(text(f"SELECT COUNT(*) FROM {table_name}"))
                count = result.scalar() or 0
                if count == 0:
                    issues["suggestions"].append(f"Table '{table_name}' is empty")
            except Exception:
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
        inspector = inspect(engine)
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
