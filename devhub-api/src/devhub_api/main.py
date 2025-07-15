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
from typing import List, Dict, Any, Optional
import logging
from datetime import datetime, timedelta
import os
import datetime
from dotenv import load_dotenv

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import all modules
from .database import get_db, engine
from .models import User, Project, Customer, Invoice, PasswordVault
from .id_system import create_founder_account, create_user, IDGenerator
from .database_manager import DatabaseValidator, DatabaseManager
from .auth import (
    AuthManager, 
    get_current_user, 
    require_founder, 
    require_active_user
)

# Load environment variables
load_dotenv()

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
async def health_check(db: Session = Depends(get_db)):
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
async def test_tenant():
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

@app.get("/api/database/test")
async def test_database(db: Session = Depends(get_db)):
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
async def get_database_schema(db: Session = Depends(get_db)):
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
        }
        
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

@app.get("/api/database/validate")
async def validate_database(db: Session = Depends(get_db)):
    """Validate database integrity and relationships"""
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
            "timestamp": datetime.datetime.utcnow().isoformat()
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
async def create_table_record(table_name: str, data: dict, db: Session = Depends(get_db)):
    """Create a new record in the specified table"""
    try:
        result = DatabaseManager.create_record(db, table_name, data)
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["error"])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create record: {str(e)}")

@app.put("/api/database/table/{table_name}/{system_id}")
async def update_table_record(table_name: str, system_id: str, data: dict, db: Session = Depends(get_db)):
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
async def repair_database(db: Session = Depends(get_db)):
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
            "repairs_made": len(repairs),
            "repairs": repairs,
            "message": f"Applied {len(repairs)} automatic repairs"
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Repair failed: {str(e)}")

# Authentication Endpoints
@app.post("/api/auth/login", response_model=dict)
async def login(request: Request, db: Session = Depends(get_db)):
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
                "tenant_name": user.tenant_name,
                "user_role": user.user_role,
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
async def register(request: Request, db: Session = Depends(get_db)):
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
async def create_founder(request: Request, db: Session = Depends(get_db)):
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

# Admin/Founder Management Endpoints
@app.get("/api/admin/users", response_model=dict)
async def list_all_users(current_user: User = Depends(require_founder), db: Session = Depends(get_db)):
    """List all users (founder only)"""
    try:
        users = db.query(User).all()
        user_list = []
        for user in users:
            user_list.append({
                "system_id": user.system_id,
                "display_id": user.display_id,
                "email": user.email,
                "full_name": user.full_name,
                "tenant_id": user.tenant_id,
                "tenant_name": user.tenant_name,
                "user_role": user.user_role,
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

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8005"))
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=port, 
        reload=True,
        log_level="info"
    )
