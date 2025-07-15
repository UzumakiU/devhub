"""
Auth API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import Dict, Any
from datetime import timedelta

from ...core import get_db
from ...models import User, Tenant
from ...services.auth_service import AuthService

router = APIRouter()

@router.post("/login")
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
        
        # Use auth service
        auth_service = AuthService(db)
        access_token = auth_service.authenticate_user(email, password)
        
        if not access_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        
        # Get user info
        user = db.query(User).filter(User.email == email).first()
        
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
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )

@router.post("/register")
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
        
        # Use auth service to create user
        auth_service = AuthService(db)
        user = auth_service.create_user(email, password, full_name)
        
        # Create access token
        access_token = auth_service.authenticate_user(email, password)
        
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
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )

@router.get("/health")
async def auth_health():
    """Auth module health check"""
    return {"status": "healthy", "module": "auth"}
