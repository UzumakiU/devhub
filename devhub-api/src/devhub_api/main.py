"""
DevHub Backend - Main Application
FastAPI application with database integration and ID system
"""
from fastapi import FastAPI, Depends, HTTPException, status, Request, Body
from fastapi.security import HTTPBearer
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import inspect, text
from typing import List, Dict, Any, Optional, Union
import logging
from datetime import datetime, timedelta, timezone
import os
from dotenv import load_dotenv

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import all modules
from .database import get_db, engine
from .models import User, Project, Customer, Invoice, PasswordVault, CustomerInteraction, Lead, LeadInteraction, CustomerNote, Tenant
from .id_system import create_founder_account, create_user, IDGenerator
from .database_manager import DatabaseValidator, DatabaseManager
from .auth import (
    AuthManager, 
    get_current_user, 
    get_current_user_with_tenant,
    require_founder, 
    require_business_owner,
    require_manager_or_above,
    require_tenant_user,
    require_active_user,
    get_tenant_filter
)

# Load environment variables
load_dotenv()

# Feature flags - easily toggle modules on/off
FEATURE_FLAGS = {
    # Core modules (always enabled)
    "crm": True,
    "dashboard": True,
    "admin": True,
    "database": True,
    "auth": True,
    
    # Temporarily disabled modules (focusing on CRM first)
    "projects": False,
    "customers": False,  # Use CRM instead
    "invoices": False,
    
    # Future modules
    "reports": False,
    "analytics": False,
    "integrations": False,
}

def check_feature_enabled(feature_name: str):
    """Check if a feature is enabled, raise 503 if disabled"""
    if not FEATURE_FLAGS.get(feature_name, False):
        raise HTTPException(
            status_code=503, 
            detail=f"{feature_name.title()} module is temporarily disabled. Focus is on CRM completion."
        )

# Create FastAPI app
app = FastAPI(
    title="DevHub API",
    description="Business Management Hub - Single Tenant Smart Architecture",
    version="1.0.0"
)

# Configure CORS
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3005").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "DevHub API is running!",
        "tenant_id": os.getenv("TENANT_ID", "your_business"),
        "environment": os.getenv("ENVIRONMENT", "development"),
        "version": "1.0.0"
    }

@app.get("/api/health")
async def health_check(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Detailed health check with configuration and database connectivity"""
    
    # Test database connectivity
    try:
        # Simple database query to test connection
        from sqlalchemy import text
        result = db.execute(text("SELECT 1 as test"))
        db_connected = result.fetchone() is not None
    except Exception as e:
        db_connected = False
        db_error = str(e)
    else:
        db_error = None
    
    return {
        "status": "healthy" if db_connected else "degraded",
        "tenant_id": os.getenv("TENANT_ID"),
        "database_configured": bool(os.getenv("DATABASE_URL")),
        "database_connected": db_connected,
        "database_error": db_error,
        "redis_configured": bool(os.getenv("REDIS_URL")),
        "port": os.getenv("PORT", "8005"),
        "debug": os.getenv("DEBUG", "false").lower() == "true"
    }

@app.get("/api/tenant")
async def test_tenant() -> Dict[str, Any]:
    """Get tenant information"""
    tenant_id = os.getenv("TENANT_ID", "your_business")
    return {
        "message": f"Hello from {tenant_id}!",
        "tenant_data": {
            "id": tenant_id,
            "name": "Your Business Name",
            "system": "single-tenant-smart"
        }
    }

@app.get("/api/features")
async def get_feature_flags() -> Dict[str, Any]:
    """Get current feature flags status"""
    return {
        "features": FEATURE_FLAGS,
        "message": "Feature flags for module availability"
    }

@app.get("/api/database/test")
async def test_database(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Test database operations and ID generation"""
    try:
        # Test ID generation
        next_user_id = IDGenerator.generate_id("user", db)
        next_project_id = IDGenerator.generate_id("project", db)
        next_customer_id = IDGenerator.generate_id("customer", db)
        
        # Count existing records
        from .models import User, Project, Customer
        user_count = db.query(User).count()
        project_count = db.query(Project).count()
        customer_count = db.query(Customer).count()
        
        return {
            "status": "success",
            "database_tables": ["users", "projects", "customers", "invoices"],
            "record_counts": {
                "users": user_count,
                "projects": project_count, 
                "customers": customer_count
            },
            "next_ids": {
                "user": next_user_id,
                "project": next_project_id,
                "customer": next_customer_id
            },
            "id_system": "Prefixed Sequential (USR-000, PRJ-001, etc.)"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database test failed: {str(e)}")

@app.get("/api/database/schema")
async def get_database_schema(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Get complete database schema with relationships"""
    try:
        from sqlalchemy import text, inspect
        
        # Get all tables
        inspector = inspect(db.bind)
        tables = inspector.get_table_names()
        
        schema_info = {
            "database": "devhub_your_business",
            "tables": {},
            "relationships": []
        };
        
        # Get detailed info for each table
        for table_name in tables:
            columns = inspector.get_columns(table_name)
            foreign_keys = inspector.get_foreign_keys(table_name)
            indexes = inspector.get_indexes(table_name)
            
            # Count records
            count_result = db.execute(text(f"SELECT COUNT(*) FROM {table_name}"))
            record_count = count_result.scalar()
            
            schema_info["tables"][table_name] = {
                "columns": [
                    {
                        "name": col["name"],
                        "type": str(col["type"]),
                        "nullable": col["nullable"],
                        "primary_key": col.get("primary_key", False)
                    }
                    for col in columns
                ],
                "foreign_keys": [
                    {
                        "column": fk["constrained_columns"][0],
                        "references_table": fk["referred_table"],
                        "references_column": fk["referred_columns"][0]
                    }
                    for fk in foreign_keys
                ],
                "indexes": [idx["name"] for idx in indexes],
                "record_count": record_count
            }
            
            # Add relationships for visualization
            for fk in foreign_keys:
                schema_info["relationships"].append({
                    "from_table": table_name,
                    "from_column": fk["constrained_columns"][0],
                    "to_table": fk["referred_table"],
                    "to_column": fk["referred_columns"][0]
                })
        
        return schema_info
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Schema fetch failed: {str(e)}")

@app.get("/api/database/overview")
async def get_database_overview(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Get database overview with table statistics - format expected by frontend"""
    try:
        from sqlalchemy import text, inspect
        
        # Get all tables
        inspector = inspect(db.bind)
        tables = inspector.get_table_names()
        
        # Exclude internal tables for cleaner overview
        excluded_tables = {'alembic_version'}
        filtered_tables = [t for t in tables if t not in excluded_tables]
        
        total_records = 0
        table_stats = []
        
        # Get record count for each table
        for table_name in filtered_tables:
            count_result = db.execute(text(f"SELECT COUNT(*) FROM {table_name}"))
            record_count = count_result.scalar()
            total_records += record_count
            
            table_stats.append({
                "table_name": table_name,
                "record_count": record_count
            })
        
        # Sort by record count (highest first)
        table_stats.sort(key=lambda x: x["record_count"], reverse=True)
        
        return {
            "total_tables": len(filtered_tables),
            "total_records": total_records,
            "table_stats": table_stats
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Overview fetch failed: {str(e)}")

@app.get("/api/database/validate")
async def validate_database_get(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Validate database integrity and relationships (GET method for silent checks)"""
    try:
        issues = DatabaseValidator.validate_schema(db)
        
        # Calculate severity
        total_issues = (
            len(issues["errors"]) + 
            len(issues["warnings"]) + 
            len(issues["relationship_issues"]) + 
            len(issues["id_system_issues"])
        )
        
        severity = "healthy"
        if total_issues > 0:
            severity = "warning" if len(issues["errors"]) == 0 else "error"
        
        return {
            "status": "success",
            "severity": severity,
            "total_issues": total_issues,
            "issues": issues,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Validation failed: {str(e)}")

@app.post("/api/database/validate")
async def validate_database_post(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Validate database integrity and relationships (POST method for manual validation)"""
    try:
        issues = DatabaseValidator.validate_schema(db)
        
        # Calculate severity
        total_issues = (
            len(issues["errors"]) + 
            len(issues["warnings"]) + 
            len(issues["relationship_issues"]) + 
            len(issues["id_system_issues"])
        )
        
        severity = "healthy"
        if total_issues > 0:
            severity = "warning" if len(issues["errors"]) == 0 else "error"
        
        return {
            "status": "success",
            "severity": severity,
            "total_issues": total_issues,
            "issues": issues,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Validation failed: {str(e)}")

@app.get("/api/database/table/{table_name}")
async def get_table_data(table_name: str, limit: int = 100, db: Session = Depends(get_db)):
    """Get data from a specific table"""
    try:
        result = DatabaseManager.get_table_data(db, table_name, limit)
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["error"])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch table data: {str(e)}")

@app.post("/api/database/table/{table_name}")
async def create_table_record(table_name: str, data: Dict[str, Any], db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Create a new record in the specified table"""
    try:
        result = DatabaseManager.create_record(db, table_name, data)
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["error"])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create record: {str(e)}")

@app.put("/api/database/table/{table_name}/{system_id}")
async def update_table_record(table_name: str, system_id: str, data: Dict[str, Any], db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Update an existing record"""
    try:
        # Special handling for user password updates
        if table_name == "users" and "hashed_password" in data:
            # Find the user
            user = db.query(User).filter(User.system_id == system_id).first()
            if not user:
                raise HTTPException(status_code=404, detail="User not found")
            
            # Get the raw password from the data
            raw_password = data["hashed_password"]
            
            # Hash the password properly
            hashed_password = AuthManager.get_password_hash(raw_password)
            
            # Update the data with the properly hashed password
            data["hashed_password"] = hashed_password
            
            # Save original password to vault automatically
            save_password_to_vault_helper(db, system_id, raw_password)
            
            # Update the record using the DatabaseManager
            result = DatabaseManager.update_record(db, table_name, system_id, data)
            
            if result["success"]:
                result["vault_saved"] = True
                result["message"] = f"Password updated and saved to vault for user {system_id}"
            
            return result
        
        # For all other updates, use the standard flow
        result = DatabaseManager.update_record(db, table_name, system_id, data)
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["error"])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update record: {str(e)}")

@app.delete("/api/database/table/{table_name}/{system_id}")
async def delete_table_record(table_name: str, system_id: str, db: Session = Depends(get_db)):
    """Delete a record"""
    try:
        result = DatabaseManager.delete_record(db, table_name, system_id)
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["error"])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete record: {str(e)}")

@app.post("/api/database/repair")
async def repair_database(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Attempt to repair common database issues"""
    try:
        issues = DatabaseValidator.validate_schema(db)
        repairs = []
        
        # Auto-fix missing system_ids
        models = [
            (User, "user"),
            (Project, "project"),
            (Customer, "customer"),
            (Invoice, "invoice")
        ]
        
        for model, entity_type in models:
            records_without_id = db.query(model).filter(model.system_id.is_(None)).all()
            for record in records_without_id:
                new_id = IDGenerator.generate_id(entity_type, db)
                record.system_id = new_id
                if hasattr(record, 'display_id'):
                    record.display_id = new_id
                repairs.append(f"Generated {new_id} for {model.__tablename__} record")
        
        if repairs:
            db.commit()
        
        return {
            "status": "success",
            "fixed_issues": len(repairs),
            "repairs": repairs,
            "message": f"Applied {len(repairs)} automatic repairs"
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Repair failed: {str(e)}")

@app.get("/api/database/health")
async def get_database_health(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Get comprehensive database health metrics"""
    try:
        from sqlalchemy import text, inspect
        
        # Get table health metrics
        inspector = inspect(db.bind)
        tables = inspector.get_table_names()
        excluded_tables = {'alembic_version'}
        filtered_tables = [t for t in tables if t not in excluded_tables]
        
        table_health = []
        
        for table_name in filtered_tables:
            # Get record count
            count_result = db.execute(text(f"SELECT COUNT(*) FROM {table_name}"))
            record_count = count_result.scalar()
            
            # Calculate health score based on various factors
            health_score = 100
            issues = []
            recommendations = []
            
            # Check for empty tables
            if record_count == 0:
                issues.append("Table is empty")
                health_score -= 20
            
            # Check for very large tables
            if record_count > 100000:
                recommendations.append("Consider partitioning or archiving old data")
                health_score -= 10
            
            # Check for foreign key constraints
            foreign_keys = inspector.get_foreign_keys(table_name)
            if len(foreign_keys) == 0 and table_name not in ['users', 'tenants']:
                recommendations.append("Consider adding foreign key relationships")
                health_score -= 5
            
            # Check for indexes
            indexes = inspector.get_indexes(table_name)
            if len(indexes) <= 1:  # Only primary key
                recommendations.append("Consider adding indexes for better performance")
                health_score -= 5
            
            table_health.append({
                "table_name": table_name,
                "record_count": record_count,
                "health_score": max(0, health_score),
                "issues": issues,
                "recommendations": recommendations,
                "foreign_keys": len(foreign_keys),
                "indexes": len(indexes)
            })
        
        # Overall database health
        avg_health = sum(th["health_score"] for th in table_health) / len(table_health) if table_health else 100
        
        return {
            "status": "success",
            "overall_health": round(avg_health, 1),
            "health_status": "healthy" if avg_health >= 90 else "warning" if avg_health >= 70 else "critical",
            "table_health": table_health,
            "total_tables": len(filtered_tables),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")

@app.get("/api/database/monitoring/status")
async def get_monitoring_status(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Get current database monitoring status and metrics"""
    try:
        from sqlalchemy import text
        
        # Test database connectivity
        db.execute(text("SELECT 1"))
        
        # Get current connection info
        connection_info = {
            "status": "connected",
            "database_name": db.bind.url.database,
            "host": db.bind.url.host,
            "port": db.bind.url.port,
            "driver": str(db.bind.url.drivername)
        }
        
        # Get performance metrics (basic)
        performance_metrics = {
            "active_connections": 1,  # Basic placeholder
            "query_time_avg": "< 100ms",  # Placeholder
            "uptime": "Available"  # Placeholder
        }
        
        return {
            "status": "success",
            "connection": connection_info,
            "performance": performance_metrics,
            "monitoring_active": True,
            "last_check": datetime.now(timezone.utc).isoformat()
        }
        
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "connection": {"status": "disconnected"},
            "monitoring_active": False,
            "last_check": datetime.now(timezone.utc).isoformat()
        }

@app.post("/api/database/monitoring/alert")
async def create_monitoring_alert(alert_data: Dict[str, Any], db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Create a monitoring alert (for future implementation with notification system)"""
    try:
        # For now, just validate the alert structure
        required_fields = ["type", "title", "message", "severity"]
        
        for field in required_fields:
            if field not in alert_data:
                raise ValueError(f"Missing required field: {field}")
        
        # In a full implementation, this would save to a notifications table
        # and potentially send emails/webhooks
        
        return {
            "status": "success",
            "alert_id": f"alert_{int(datetime.now().timestamp())}",
            "message": "Alert created successfully",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to create alert: {str(e)}")

@app.get("/api/database/relationships")
async def get_database_relationships(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Get database relationship information for visualization"""
    try:
        from sqlalchemy import inspect
        
        inspector = inspect(db.bind)
        tables = inspector.get_table_names()
        excluded_tables = {'alembic_version'}
        filtered_tables = [t for t in tables if t not in excluded_tables]
        
        relationships = []
        table_info = {}
        
        for table_name in filtered_tables:
            foreign_keys = inspector.get_foreign_keys(table_name)
            columns = inspector.get_columns(table_name)
            
            # Store table information
            table_info[table_name] = {
                "columns": len(columns),
                "foreign_keys": len(foreign_keys),
                "primary_keys": [col["name"] for col in columns if col.get("primary_key")]
            }
            
            # Add relationships
            for fk in foreign_keys:
                relationships.append({
                    "from_table": table_name,
                    "from_column": fk["constrained_columns"][0] if fk["constrained_columns"] else None,
                    "to_table": fk["referred_table"],
                    "to_column": fk["referred_columns"][0] if fk["referred_columns"] else None,
                    "constraint_name": fk.get("name", "")
                })
        
        return {
            "status": "success",
            "relationships": relationships,
            "tables": table_info,
            "relationship_count": len(relationships),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get relationships: {str(e)}")

# Authentication Endpoints
@app.post("/api/auth/login", response_model=dict)
async def login(request: Request, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Login endpoint"""
    try:
        # Get the raw JSON body
        body = await request.json()
        email = body.get("email")
        password = body.get("password")
        
        if not email or not password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email and password are required"
            )
        
        # Authenticate user
        user = AuthManager.authenticate_user(db, email, password)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        
        # Create access token
        access_token_expires = timedelta(minutes=30)
        access_token = AuthManager.create_access_token(
            data={"sub": user.email},
            expires_delta=access_token_expires
        )
        
        # Get tenant information if user belongs to a tenant
        tenant_name = None
        if user.tenant_id:
            tenant = db.query(Tenant).filter(Tenant.system_id == user.tenant_id).first()
            if tenant:
                tenant_name = tenant.business_name
        
        # Return token and user info
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "system_id": user.system_id,
                "display_id": user.display_id,
                "email": user.email,
                "full_name": user.full_name,
                "tenant_id": user.tenant_id,
                "tenant_name": tenant_name,
                "role": user.user_role,
                "is_active": user.is_active,
                "is_founder": user.is_founder,
                "created_at": user.created_at.isoformat() if user.created_at else None
            }
        }
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )


@app.post("/api/auth/register", response_model=dict)
async def register(request: Request, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Register new user endpoint"""
    try:
        # Get the raw JSON body
        body = await request.json()
        email = body.get("email")
        password = body.get("password")
        full_name = body.get("full_name")
        
        if not email or not password or not full_name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email, password, and full name are required"
            )
        
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create new user
        user = AuthManager.create_user_with_password(db, email, password, full_name)
        
        # Save original password to vault automatically
        save_password_to_vault_helper(db, user.system_id, password)
        
        # Create access token
        access_token_expires = timedelta(minutes=30)
        access_token = AuthManager.create_access_token(
            data={"sub": user.email},
            expires_delta=access_token_expires
        )
        
        # Return token and user info
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "system_id": user.system_id,
                "display_id": user.display_id,
                "email": user.email,
                "full_name": user.full_name,
                "is_active": user.is_active,
                "is_founder": user.is_founder,
                "created_at": user.created_at.isoformat() if user.created_at else None
            }
        }
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )


@app.post("/api/auth/create-founder", response_model=dict)
async def create_founder(request: Request, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Create founder account endpoint (only if no founder exists)"""
    try:
        # Check if founder already exists
        existing_founder = db.query(User).filter(User.is_founder == True).first()
        if existing_founder:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Founder account already exists"
            )
        
        # Get the raw JSON body
        body = await request.json()
        email = body.get("email")
        password = body.get("password")
        full_name = body.get("full_name")
        
        if not email or not password or not full_name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email, password, and full name are required"
            )
        
        # Create founder account
        founder = AuthManager.create_founder_with_password(db, email, password, full_name)
        
        # Create access token
        access_token_expires = timedelta(minutes=30)
        access_token = AuthManager.create_access_token(
            data={"sub": founder.email},
            expires_delta=access_token_expires
        )
        
        # Return token and user info
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "system_id": founder.system_id,
                "display_id": founder.display_id,
                "email": founder.email,
                "full_name": founder.full_name,
                "is_active": founder.is_active,
                "is_founder": founder.is_founder,
                "created_at": founder.created_at.isoformat() if founder.created_at else None
            }
        }
    except Exception as e:
        logger.error(f"Founder creation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Founder creation failed"
        )


@app.get("/api/auth/me", response_model=dict)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return {
        "system_id": current_user.system_id,
        "display_id": current_user.display_id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "is_active": current_user.is_active,
        "is_founder": current_user.is_founder,
        "created_at": current_user.created_at.isoformat() if current_user.created_at else None
    }


@app.post("/api/auth/logout", response_model=dict)
async def logout():
    """Logout endpoint (client should discard the token)"""
    return {"message": "Logged out successfully"}


# Protected endpoint examples
@app.get("/api/protected/founder-only")
async def founder_only_endpoint(current_user: User = Depends(require_founder)):
    """Example founder-only endpoint"""
    return {
        "message": "This is a founder-only endpoint",
        "user": current_user.display_id
    }


@app.get("/api/protected/user-only")
async def user_only_endpoint(current_user: User = Depends(require_active_user)):
    """Example user-only endpoint"""
    return {
        "message": "This is a protected user endpoint",
        "user": current_user.display_id
    }

# ===== TENANT MANAGEMENT ENDPOINTS =====

@app.post("/api/tenants", response_model=dict)
async def create_tenant(
    business_name: str = Body(...),
    business_type: str = Body(...),
    owner_email: str = Body(...),
    owner_password: str = Body(...),
    owner_name: str = Body(...),
    current_user: User = Depends(require_founder),
    db: Session = Depends(get_db)
):
    """Create a new tenant with business owner (founder only)"""
    try:
        # Check if tenant with same business name exists
        existing_tenant = db.query(Tenant).filter(Tenant.business_name == business_name).first()
        if existing_tenant:
            raise HTTPException(
                status_code=400,
                detail=f"Tenant with business name '{business_name}' already exists"
            )
        
        # Check if user with email exists
        existing_user = db.query(User).filter(User.email == owner_email).first()
        if existing_user:
            raise HTTPException(
                status_code=400,
                detail=f"User with email '{owner_email}' already exists"
            )
        
        # Create tenant and business owner
        tenant, business_owner = AuthManager.create_tenant_with_business_owner(
            db, business_name, business_type, owner_email, owner_password, owner_name
        )
        
        return {
            "message": "Tenant created successfully",
            "tenant": {
                "system_id": tenant.system_id,
                "display_id": tenant.display_id,
                "business_name": tenant.business_name,
                "business_type": tenant.business_type,
                "is_active": tenant.is_active
            },
            "business_owner": {
                "system_id": business_owner.system_id,
                "display_id": business_owner.display_id,
                "email": business_owner.email,
                "full_name": business_owner.full_name,
                "role": business_owner.role
            }
        }
        
    except Exception as e:
        logger.error(f"Error creating tenant: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error creating tenant: {str(e)}")


@app.get("/api/tenants", response_model=dict)
async def list_tenants(
    current_user: User = Depends(require_founder),
    db: Session = Depends(get_db)
):
    """List all tenants (founder only)"""
    try:
        tenants = db.query(Tenant).all()
        tenant_list = []
        
        for tenant in tenants:
            # Get user count for this tenant
            user_count = db.query(User).filter(User.tenant_id == tenant.system_id).count()
            customer_count = db.query(Customer).filter(Customer.tenant_id == tenant.system_id).count()
            
            tenant_list.append({
                "system_id": tenant.system_id,
                "display_id": tenant.display_id,
                "business_name": tenant.business_name,
                "business_type": tenant.business_type,
                "is_active": tenant.is_active,
                "user_count": user_count,
                "customer_count": customer_count,
                "created_at": tenant.created_at.isoformat() if tenant.created_at else None
            })
        
        return {
            "tenants": tenant_list,
            "total_count": len(tenant_list)
        }
        
    except Exception as e:
        logger.error(f"Error listing tenants: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error listing tenants: {str(e)}")


@app.post("/api/tenants/{tenant_id}/users", response_model=dict)
async def create_tenant_user(
    tenant_id: str,
    email: str = Body(...),
    password: str = Body(...),
    full_name: str = Body(...),
    role: str = Body(..., regex="^(BUSINESS_OWNER|MANAGER|EMPLOYEE)$"),
    current_user: User = Depends(require_founder),
    db: Session = Depends(get_db)
):
    """Create a user for a specific tenant (founder only)"""
    try:
        # Verify tenant exists
        tenant = db.query(Tenant).filter(Tenant.system_id == tenant_id).first()
        if not tenant:
            raise HTTPException(status_code=404, detail="Tenant not found")
        
        # Check if user with email exists
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            raise HTTPException(
                status_code=400,
                detail=f"User with email '{email}' already exists"
            )
        
        # Create tenant user
        user = AuthManager.create_tenant_user_with_password(
            db, tenant_id, email, password, full_name, role
        )
        
        return {
            "message": "Tenant user created successfully",
            "user": {
                "system_id": user.system_id,
                "display_id": user.display_id,
                "email": user.email,
                "full_name": user.full_name,
                "role": user.role,
                "tenant_id": user.tenant_id,
                "tenant_name": tenant.business_name
            }
        }
        
    except Exception as e:
        logger.error(f"Error creating tenant user: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error creating tenant user: {str(e)}")


@app.get("/api/tenants/{tenant_id}/users", response_model=dict)
async def list_tenant_users(
    tenant_id: str,
    current_user: User = Depends(require_founder),
    db: Session = Depends(get_db)
):
    """List users for a specific tenant (founder only)"""
    try:
        # Verify tenant exists
        tenant = db.query(Tenant).filter(Tenant.system_id == tenant_id).first()
        if not tenant:
            raise HTTPException(status_code=404, detail="Tenant not found")
        
        # Get tenant users
        users = db.query(User).filter(User.tenant_id == tenant_id).all()
        user_list = []
        
        for user in users:
            user_list.append({
                "system_id": user.system_id,
                "display_id": user.display_id,
                "email": user.email,
                "full_name": user.full_name,
                "role": user.role,
                "is_active": user.is_active,
                "created_at": user.created_at.isoformat() if user.created_at else None
            })
        
        return {
            "tenant": {
                "system_id": tenant.system_id,
                "business_name": tenant.business_name,
                "business_type": tenant.business_type
            },
            "users": user_list,
            "total_count": len(user_list)
        }
        
    except Exception as e:
        logger.error(f"Error listing tenant users: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error listing tenant users: {str(e)}")


@app.get("/api/me/context", response_model=dict)
async def get_user_context(
    user_context: Dict[str, Any] = Depends(get_current_user_with_tenant)
):
    """Get current user's context including tenant information"""
    return {
        "user_context": user_context,
        "permissions": {
            "is_founder": user_context.get("is_founder", False),
            "can_manage_tenants": user_context.get("is_founder", False),
            "can_manage_tenant_users": user_context.get("role") in ["BUSINESS_OWNER", "MANAGER"] or user_context.get("is_founder", False),
            "can_access_crm": user_context.get("tenant_id") is not None or user_context.get("is_founder", False)
        }
    }

# ===== ADMIN/FOUNDER MANAGEMENT ENDPOINTS =====
@app.get("/api/admin/users", response_model=dict)
async def list_all_users(current_user: User = Depends(require_founder), db: Session = Depends(get_db)):
    """List all users (founder only)"""
    try:
        users = db.query(User).all()
        user_list = []
        for user in users:
            # Get tenant information if user belongs to a tenant
            tenant_name = None
            if user.tenant_id:
                tenant = db.query(Tenant).filter(Tenant.system_id == user.tenant_id).first()
                if tenant:
                    tenant_name = tenant.business_name
            
            user_list.append({
                "system_id": user.system_id,
                "display_id": user.display_id,
                "email": user.email,
                "full_name": user.full_name,
                "tenant_id": user.tenant_id,
                "tenant_name": tenant_name,
                "role": user.user_role,
                "is_active": user.is_active,
                "is_founder": user.is_founder,
                "created_at": user.created_at.isoformat() if user.created_at else None,
                "password_hint": user.hashed_password[:20] + "..." if user.hashed_password else "No password set"
            })
        
        return {
            "users": user_list,
            "total_count": len(user_list)
        }
    except Exception as e:
        logger.error(f"Error listing users: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list users"
        )


@app.post("/api/admin/reset-password", response_model=dict)
async def reset_user_password(
    request: Request, 
    current_user: User = Depends(require_founder), 
    db: Session = Depends(get_db)
):
    """Reset a user's password (founder only)"""
    try:
        body = await request.json()
        user_id = body.get("user_id")  # Can be system_id or display_id
        new_password = body.get("new_password")
        
        if not user_id or not new_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User ID and new password are required"
            )
        
        # Find user by system_id or display_id
        user = db.query(User).filter(
            (User.system_id == user_id) | (User.display_id == user_id)
        ).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Hash the new password
        hashed_password = AuthManager.get_password_hash(new_password)
        
        # Update the password
        user.hashed_password = hashed_password
        
        # Save original password to vault automatically
        save_password_to_vault_helper(db, user.system_id, new_password)
        
        db.commit()
        
        return {
            "message": f"Password reset successfully for {user.display_id}",
            "user": user.display_id,
            "email": user.email,
            "vault_saved": True
        }
        
    except Exception as e:
        logger.error(f"Password reset error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Password reset failed"
        )


@app.post("/api/admin/create-temp-password", response_model=dict)
async def create_temp_password(
    request: Request,
    current_user: User = Depends(require_founder),
    db: Session = Depends(get_db)
):
    """Create a temporary password for a user (founder only)"""
    try:
        body = await request.json()
        user_id = body.get("user_id")
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User ID is required"
            )
        
        # Find user
        user = db.query(User).filter(
            (User.system_id == user_id) | (User.display_id == user_id)
        ).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Generate temporary password
        import secrets
        import string
        temp_password = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(12))
        
        # Hash and update
        hashed_password = AuthManager.get_password_hash(temp_password)
        user.hashed_password = hashed_password
        
        # Save original password to vault automatically
        save_password_to_vault_helper(db, user.system_id, temp_password)
        
        db.commit()
        
        return {
            "message": f"Temporary password created for {user.display_id}",
            "user": user.display_id,
            "email": user.email,
            "temporary_password": temp_password,
            "vault_saved": True,
            "note": "Please share this password securely and ask user to change it immediately"
        }
        
    except Exception as e:
        logger.error(f"Temp password creation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Temporary password creation failed"
        )


# Password Vault Management (Founder Only)
@app.post("/api/admin/vault/save-password", response_model=dict)
async def save_password_to_vault(
    request: Request,
    current_user: User = Depends(require_founder),
    db: Session = Depends(get_db)
):
    """Save original password to vault (founder only)"""
    try:
        body = await request.json()
        user_id = body.get("user_id")
        original_password = body.get("original_password")
        vault_code = body.get("vault_access_code", "1212")
        
        if not user_id or not original_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User ID and password are required"
            )
        
        # Check if user exists
        user = db.query(User).filter(User.system_id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Save to vault (delete existing entry first)
        db.query(PasswordVault).filter(PasswordVault.user_system_id == user_id).delete()
        
        vault_entry = PasswordVault(
            user_system_id=user_id,
            original_password=original_password,  # Store as-is for now
            vault_access_code=vault_code,
            created_by=current_user.system_id
        )
        
        db.add(vault_entry)
        db.commit()
        
        return {
            "message": "Password saved to vault",
            "user_id": user_id,
            "vault_entry_id": vault_entry.id
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save password to vault: {str(e)}"
        )


@app.post("/api/admin/vault/view-password", response_model=dict)
async def view_password_from_vault(
    request: Request,
    current_user: User = Depends(require_founder),
    db: Session = Depends(get_db)
):
    """View original password from vault (founder only)"""
    try:
        body = await request.json()
        user_id = body.get("user_id")
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User ID is required"
            )
        
        # Find vault entry
        vault_entry = db.query(PasswordVault).filter(
            PasswordVault.user_system_id == user_id
        ).first()
        
        if not vault_entry:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Password not found in vault"
            )
        
        # Get user info
        user = db.query(User).filter(User.system_id == user_id).first()
        
        return {
            "user_id": user_id,
            "user_email": user.email if user else "Unknown",
            "user_name": user.full_name if user else "Unknown",
            "original_password": vault_entry.original_password,
            "created_at": vault_entry.created_at.isoformat() if vault_entry.created_at else None
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve password from vault: {str(e)}"
        )


@app.get("/api/admin/vault/list", response_model=dict)
async def list_vault_entries(
    current_user: User = Depends(require_founder),
    db: Session = Depends(get_db)
):
    """List all vault entries (founder only)"""
    try:
        # Get vault entries with user information
        vault_entries = db.query(PasswordVault).all()
        
        entries_list = []
        for entry in vault_entries:
            # Get user info separately to handle missing relationships
            user = db.query(User).filter(User.system_id == entry.user_system_id).first()
            
            entries_list.append({
                "vault_id": entry.id,
                "user_id": entry.user_system_id,
                "user_email": user.email if user else "Unknown",
                "user_name": user.full_name if user else "Unknown", 
                "has_password": bool(entry.original_password),
                "created_at": entry.created_at.isoformat() if entry.created_at else None,
                "access_code_hint": f"***{entry.vault_access_code[-1]}" if entry.vault_access_code else "****"
            })
        
        return {
            "vault_entries": entries_list,
            "total_count": len(entries_list)
        }
        
    except Exception as e:
        logger.error(f"Vault list error: {str(e)}")
        return {
            "vault_entries": [],
            "total_count": 0,
            "error": str(e)
        }

@app.post("/api/admin/vault/verify-access", response_model=dict)
async def verify_vault_access(
    request: Request,
    current_user: User = Depends(require_founder),
    db: Session = Depends(get_db)
):
    """Verify vault access code to unlock the vault page (founder only)"""
    try:
        body = await request.json()
        access_code = body.get("access_code")
        
        if not access_code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="4-digit access code is required"
            )
        
        # Check if any vault entry exists with this access code
        # Since all entries should have the same access code (1212), we just check one
        vault_entry = db.query(PasswordVault).first()
        
        if not vault_entry:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No vault entries found"
            )
        
        # Verify access code
        if vault_entry.vault_access_code != access_code:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid access code"
            )
        
        return {
            "access_granted": True,
            "message": "Vault access granted"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to verify vault access: {str(e)}"
        )


def save_password_to_vault_helper(db: Session, user_id: str, original_password: str, vault_code: str = "1212"):
    """Helper function to save password to vault"""
    try:
        # Delete existing entry
        db.query(PasswordVault).filter(PasswordVault.user_system_id == user_id).delete()
        
        # Create new entry
        vault_entry = PasswordVault(
            user_system_id=user_id,
            original_password=original_password,
            vault_access_code=vault_code,
            created_by="USR-000"  # Created by founder
        )
        
        db.add(vault_entry)
        db.commit()
        return True
    except Exception as e:
        print(f"Error saving to vault: {e}")
        return False

# =============================================================================
# 🎯 ADVANCED CRM MODULE - Customer Relationship Management
# =============================================================================

# -----------------------------------------------------------------------------
# Customer Interaction Management
# -----------------------------------------------------------------------------

@app.post("/api/crm/customers/{customer_id}/interactions", response_model=dict)
async def create_customer_interaction(
    customer_id: str,
    request: Request,
    current_user: User = Depends(require_tenant_user),
    tenant_filter: Optional[str] = Depends(get_tenant_filter),
    db: Session = Depends(get_db)
):
    """Create a new customer interaction (call, email, meeting, note)"""
    check_feature_enabled("crm")
    try:
        data = await request.json()
        
        # Build customer query with tenant filtering
        customer_query = db.query(Customer).filter(Customer.system_id == customer_id)
        if tenant_filter:
            customer_query = customer_query.filter(Customer.tenant_id == tenant_filter)
        
        customer = customer_query.first()
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found or access denied")
        
        # Generate system ID for interaction
        system_id = IDGenerator.generate_id("customer_interaction", db)
        
        # Create interaction
        interaction = CustomerInteraction(
            system_id=system_id,
            customer_id=customer_id,
            user_id=current_user.system_id,
            interaction_type=data.get("interaction_type", "note"),
            subject=data.get("subject", ""),
            description=data.get("description", ""),
            outcome=data.get("outcome", ""),
            priority=data.get("priority", "medium"),
            status=data.get("status", "completed"),
            is_billable=data.get("is_billable", False),
            billable_hours=data.get("billable_hours"),
            scheduled_at=datetime.fromisoformat(data["scheduled_at"]) if data.get("scheduled_at") else None,
            completed_at=datetime.fromisoformat(data["completed_at"]) if data.get("completed_at") else datetime.now(),
            follow_up_date=datetime.fromisoformat(data["follow_up_date"]) if data.get("follow_up_date") else None
        )
        
        db.add(interaction)
        db.commit()
        db.refresh(interaction)
        
        return {
            "status": "success",
            "message": "Customer interaction created successfully",
            "interaction": {
                "system_id": interaction.system_id,
                "customer_id": interaction.customer_id,
                "interaction_type": interaction.interaction_type,
                "subject": interaction.subject,
                "description": interaction.description,
                "outcome": interaction.outcome,
                "status": interaction.status,
                "created_at": interaction.created_at.isoformat()
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create customer interaction: {str(e)}"
        )

@app.get("/api/crm/customers/{customer_id}/interactions", response_model=dict)
async def get_customer_interactions(
    customer_id: str,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all interactions for a specific customer"""
    try:
        # Verify customer exists
        customer = db.query(Customer).filter(Customer.system_id == customer_id).first()
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")
        
        # Get interactions
        interactions = db.query(CustomerInteraction).filter(
            CustomerInteraction.customer_id == customer_id
        ).order_by(CustomerInteraction.created_at.desc()).limit(limit).all()
        
        interaction_list = []
        for interaction in interactions:
            user = db.query(User).filter(User.system_id == interaction.user_id).first()
            interaction_list.append({
                "system_id": interaction.system_id,
                "interaction_type": interaction.interaction_type,
                "subject": interaction.subject,
                "description": interaction.description,
                "outcome": interaction.outcome,
                "priority": interaction.priority,
                "status": interaction.status,
                "is_billable": interaction.is_billable,
                "billable_hours": interaction.billable_hours,
                "scheduled_at": interaction.scheduled_at.isoformat() if interaction.scheduled_at else None,
                "completed_at": interaction.completed_at.isoformat() if interaction.completed_at else None,
                "follow_up_date": interaction.follow_up_date.isoformat() if interaction.follow_up_date else None,
                "created_at": interaction.created_at.isoformat(),
                "created_by": {
                    "system_id": user.system_id if user else "Unknown",
                    "name": user.full_name if user else "Unknown User"
                }
            })
        
        return {
            "status": "success",
            "customer": {
                "system_id": customer.system_id,
                "name": customer.name,
                "email": customer.email
            },
            "interactions": interaction_list,
            "total_count": len(interaction_list)
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch customer interactions: {str(e)}"
        )

# -----------------------------------------------------------------------------
# Lead Management System
# -----------------------------------------------------------------------------

@app.post("/api/crm/leads", response_model=dict)
async def create_lead(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new lead"""
    try:
        data = await request.json()
        
        # Generate system ID for lead
        lead_count = db.query(Lead).count()
        system_id = IDGenerator.generate_system_id("leads", lead_count)
        
        # Create lead
        lead = Lead(
            system_id=system_id,
            name=data.get("name", ""),
            email=data.get("email", ""),
            phone=data.get("phone"),
            company=data.get("company"),
            job_title=data.get("job_title"),
            source=data.get("source", "unknown"),
            lead_score=data.get("lead_score", 0),
            qualification_status=data.get("qualification_status", "new"),
            stage=data.get("stage", "prospect"),
            estimated_value=data.get("estimated_value"),
            probability=data.get("probability", 10),
            expected_close_date=datetime.fromisoformat(data["expected_close_date"]) if data.get("expected_close_date") else None,
            assigned_to=data.get("assigned_to", current_user.system_id),
            address_line1=data.get("address_line1"),
            address_line2=data.get("address_line2"),
            city=data.get("city"),
            state=data.get("state"),
            postal_code=data.get("postal_code"),
            country=data.get("country", "US")
        )
        
        db.add(lead)
        db.commit()
        db.refresh(lead)
        
        return {
            "status": "success",
            "message": "Lead created successfully",
            "lead": {
                "system_id": lead.system_id,
                "name": lead.name,
                "email": lead.email,
                "company": lead.company,
                "stage": lead.stage,
                "qualification_status": lead.qualification_status,
                "lead_score": lead.lead_score,
                "created_at": lead.created_at.isoformat()
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create lead: {str(e)}"
        )

@app.get("/api/crm/leads", response_model=dict)
async def get_leads(
    stage: Optional[str] = None,
    assigned_to: Optional[str] = None,
    qualification_status: Optional[str] = None,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get leads with optional filtering"""
    try:
        query = db.query(Lead)
        
        # Apply filters
        if stage:
            query = query.filter(Lead.stage == stage)
        if assigned_to:
            query = query.filter(Lead.assigned_to == assigned_to)
        if qualification_status:
            query = query.filter(Lead.qualification_status == qualification_status)
        
        # Get active leads only
        query = query.filter(Lead.is_active == True)
        
        leads = query.order_by(Lead.created_at.desc()).limit(limit).all()
        
        lead_list = []
        for lead in leads:
            assigned_user = db.query(User).filter(User.system_id == lead.assigned_to).first()
            lead_list.append({
                "system_id": lead.system_id,
                "name": lead.name,
                "email": lead.email,
                "phone": lead.phone,
                "company": lead.company,
                "job_title": lead.job_title,
                "source": lead.source,
                "lead_score": lead.lead_score,
                "qualification_status": lead.qualification_status,
                "stage": lead.stage,
                "estimated_value": lead.estimated_value,
                "probability": lead.probability,
                "expected_close_date": lead.expected_close_date.isoformat() if lead.expected_close_date else None,
                "assigned_to": {
                    "system_id": assigned_user.system_id if assigned_user else "Unknown",
                    "name": assigned_user.full_name if assigned_user else "Unknown User"
                },
                "converted_to_customer": lead.converted_to_customer,
                "last_contacted": lead.last_contacted.isoformat() if lead.last_contacted else None,
                "created_at": lead.created_at.isoformat()
            })
        
        return {
            "status": "success",
            "leads": lead_list,
            "total_count": len(lead_list),
            "filters": {
                "stage": stage,
                "assigned_to": assigned_to,
                "qualification_status": qualification_status
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch leads: {str(e)}"
        )

@app.post("/api/crm/leads/{lead_id}/convert", response_model=dict)
async def convert_lead_to_customer(
    lead_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Convert a lead to a customer"""
    try:
        # Get the lead
        lead = db.query(Lead).filter(Lead.system_id == lead_id).first()
        if not lead:
            raise HTTPException(status_code=404, detail="Lead not found")
        
        if lead.converted_to_customer:
            raise HTTPException(status_code=400, detail="Lead already converted to customer")
        
        # Create customer from lead
        customer_count = db.query(Customer).count()
        customer_system_id = IDGenerator.generate_system_id("customers", customer_count)
        
        customer = Customer(
            system_id=customer_system_id,
            name=lead.name,
            email=lead.email,
            phone=lead.phone,
            company=lead.company,
            address_line1=lead.address_line1,
            address_line2=lead.address_line2,
            city=lead.city,
            state=lead.state,
            postal_code=lead.postal_code,
            country=lead.country
        )
        
        db.add(customer)
        
        # Update lead status
        lead.converted_to_customer = True
        lead.converted_customer_id = customer_system_id
        lead.stage = "closed_won"
        
        db.commit()
        db.refresh(customer)
        
        return {
            "status": "success",
            "message": "Lead converted to customer successfully",
            "customer": {
                "system_id": customer.system_id,
                "name": customer.name,
                "email": customer.email,
                "company": customer.company,
                "created_at": customer.created_at.isoformat()
            },
            "lead": {
                "system_id": lead.system_id,
                "stage": lead.stage,
                "converted_to_customer": lead.converted_to_customer
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to convert lead to customer: {str(e)}"
        )

# -----------------------------------------------------------------------------
# Customer Notes Management
# -----------------------------------------------------------------------------

@app.post("/api/crm/customers/{customer_id}/notes", response_model=dict)
async def create_customer_note(
    customer_id: str,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a note for a customer"""
    try:
        data = await request.json()
        
        # Verify customer exists
        customer = db.query(Customer).filter(Customer.system_id == customer_id).first()
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")
        
        # Generate system ID for note
        note_count = db.query(CustomerNote).count()
        system_id = IDGenerator.generate_system_id("customer_notes", note_count)
        
        # Create note
        note = CustomerNote(
            system_id=system_id,
            customer_id=customer_id,
            user_id=current_user.system_id,
            title=data.get("title", ""),
            content=data.get("content", ""),
            note_type=data.get("note_type", "general"),
            is_private=data.get("is_private", False)
        )
        
        db.add(note)
        db.commit()
        db.refresh(note)
        
        return {
            "status": "success",
            "message": "Customer note created successfully",
            "note": {
                "system_id": note.system_id,
                "title": note.title,
                "content": note.content,
                "note_type": note.note_type,
                "is_private": note.is_private,
                "created_at": note.created_at.isoformat()
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create customer note: {str(e)}"
        )

@app.get("/api/crm/customers/{customer_id}/notes", response_model=dict)
async def get_customer_notes(
    customer_id: str,
    include_private: bool = True,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all notes for a customer"""
    try:
        # Verify customer exists
        customer = db.query(Customer).filter(Customer.system_id == customer_id).first()
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")
        
        # Get notes
        query = db.query(CustomerNote).filter(CustomerNote.customer_id == customer_id)
        
        # Filter private notes if needed
        if not include_private:
            query = query.filter(CustomerNote.is_private == False)
        
        notes = query.order_by(CustomerNote.created_at.desc()).all()
        
        note_list = []
        for note in notes:
            user = db.query(User).filter(User.system_id == note.user_id).first()
            note_list.append({
                "system_id": note.system_id,
                "title": note.title,
                "content": note.content,
                "note_type": note.note_type,
                "is_private": note.is_private,
                "created_at": note.created_at.isoformat(),
                "updated_at": note.updated_at.isoformat(),
                "created_by": {
                    "system_id": user.system_id if user else "Unknown",
                    "name": user.full_name if user else "Unknown User"
                }
            })
        
        return {
            "status": "success",
            "customer": {
                "system_id": customer.system_id,
                "name": customer.name
            },
            "notes": note_list,
            "total_count": len(note_list)
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch customer notes: {str(e)}"
        )

# -----------------------------------------------------------------------------
# CRM Analytics & Reporting
# -----------------------------------------------------------------------------

@app.get("/api/crm/analytics/dashboard", response_model=dict)
async def get_crm_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get CRM dashboard analytics"""
    try:
        # Customer metrics
        total_customers = db.query(Customer).filter(Customer.is_active == True).count()
        new_customers_this_month = db.query(Customer).filter(
            Customer.created_at >= datetime.now().replace(day=1)
        ).count()
        
        # Lead metrics
        total_leads = db.query(Lead).filter(Lead.is_active == True).count()
        qualified_leads = db.query(Lead).filter(
            Lead.qualification_status == "qualified",
            Lead.is_active == True
        ).count()
        converted_leads = db.query(Lead).filter(Lead.converted_to_customer == True).count()
        
        # Interaction metrics
        total_interactions = db.query(CustomerInteraction).count()
        interactions_this_week = db.query(CustomerInteraction).filter(
            CustomerInteraction.created_at >= datetime.now() - timedelta(days=7)
        ).count()
        
        # Pipeline metrics by stage
        pipeline_stages = {}
        stages = ["prospect", "contacted", "qualified", "proposal", "negotiation", "closed_won", "closed_lost"]
        for stage in stages:
            count = db.query(Lead).filter(Lead.stage == stage, Lead.is_active == True).count()
            pipeline_stages[stage] = count
        
        # Lead sources
        lead_sources = {}
        sources = ["website", "referral", "cold_call", "social_media", "email", "event", "other"]
        for source in sources:
            count = db.query(Lead).filter(Lead.source == source, Lead.is_active == True).count()
            if count > 0:
                lead_sources[source] = count
        
        return {
            "status": "success",
            "customer_metrics": {
                "total_customers": total_customers,
                "new_customers_this_month": new_customers_this_month,
                "active_customers": total_customers
            },
            "lead_metrics": {
                "total_leads": total_leads,
                "qualified_leads": qualified_leads,
                "converted_leads": converted_leads,
                "conversion_rate": round((converted_leads / total_leads * 100) if total_leads > 0 else 0, 2)
            },
            "interaction_metrics": {
                "total_interactions": total_interactions,
                "interactions_this_week": interactions_this_week
            },
            "pipeline_stages": pipeline_stages,
            "lead_sources": lead_sources
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch CRM analytics: {str(e)}"
        )

# =============================================================================
# 🔧 Helper Functions
# =============================================================================
