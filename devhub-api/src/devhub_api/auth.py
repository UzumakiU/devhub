"""
Authentication System for DevHub
JWT-based authentication with multi-tenant support and founder account
"""
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import os
from .database import get_db
from .models import User, Tenant
from .id_system import create_founder_account, create_user, create_tenant, create_tenant_user


# Security configuration
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production-this-should-be-very-long-and-random")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Bearer token security
security = HTTPBearer()


class AuthManager:
    """Manages authentication operations"""
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash"""
        return pwd_context.verify(plain_password, hashed_password)
    
    @staticmethod
    def get_password_hash(password: str) -> str:
        """Hash a password"""
        return pwd_context.hash(password)
    
    @staticmethod
    def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
        """Create a JWT access token with tenant information"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.now(timezone.utc) + expires_delta
        else:
            expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
    
    @staticmethod
    def verify_token(token: str) -> Dict[str, Any]:
        """Verify and decode a JWT token"""
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            return payload
        except JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
    
    @staticmethod
    def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
        """Authenticate a user with email and password"""
        user = db.query(User).filter(User.email == email).first()
        if not user:
            return None
        if not AuthManager.verify_password(password, user.hashed_password):
            return None
        return user
    
    @staticmethod
    def create_founder_with_password(db: Session, email: str, password: str, full_name: str) -> User:
        """Create the founder account with a real password"""
        # Hash the password
        hashed_password = AuthManager.get_password_hash(password)
        
        # Create founder account
        founder = create_founder_account(db, email, hashed_password, full_name)
        
        return founder
    
    @staticmethod
    def create_user_with_password(db: Session, email: str, password: str, full_name: str) -> User:
        """Create a regular user with a real password"""
        # Hash the password
        hashed_password = AuthManager.get_password_hash(password)
        
        # Create user account
        user = create_user(db, email, hashed_password, full_name)
        
        return user
    
    @staticmethod
    def create_tenant_with_business_owner(db: Session, business_name: str, business_type: str, 
                                        owner_email: str, owner_password: str, owner_name: str) -> tuple[Tenant, User]:
        """Create a new tenant with its business owner"""
        # Hash the password
        hashed_password = AuthManager.get_password_hash(owner_password)
        
        # Create tenant and business owner
        tenant, business_owner = create_tenant(db, business_name, business_type, 
                                             owner_email, hashed_password, owner_name)
        
        return tenant, business_owner
    
    @staticmethod  
    def create_tenant_user_with_password(db: Session, tenant_id: str, email: str, password: str, 
                                       full_name: str, role: str) -> User:
        """Create a user for a specific tenant"""
        # Hash the password
        hashed_password = AuthManager.get_password_hash(password)
        
        # Create tenant user
        user = create_tenant_user(db, tenant_id, email, hashed_password, full_name, role)
        
        return user
    
    @staticmethod
    def get_user_context(user: User, db: Session) -> Dict[str, Any]:
        """Get full user context including tenant information"""
        context = {
            "user_id": user.system_id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.user_role,
            "is_founder": user.is_founder,
            "tenant_id": user.tenant_id
        }
        
        # Add tenant information if user belongs to a tenant
        if user.tenant_id:
            tenant = db.query(Tenant).filter(Tenant.system_id == user.tenant_id).first()
            if tenant:
                context["tenant_name"] = tenant.business_name
                context["tenant_type"] = tenant.business_type
        
        return context


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)) -> User:
    """Get the current authenticated user with tenant context"""
    token = credentials.credentials
    
    # Verify token
    payload = AuthManager.verify_token(token)
    
    # Get user from database
    user_email = payload.get("sub")
    if user_email is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = db.query(User).filter(User.email == user_email).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user


def get_current_user_with_tenant(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Get current user with full tenant context"""
    return AuthManager.get_user_context(current_user, db)


def require_founder(current_user: User = Depends(get_current_user)) -> User:
    """Require founder privileges (platform-wide access)"""
    if not current_user.is_founder:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Platform founder privileges required"
        )
    return current_user


def require_business_owner(current_user: User = Depends(get_current_user)) -> User:
    """Require business owner role within a tenant"""
    if current_user.user_role != "BUSINESS_OWNER" and not current_user.is_founder:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Business owner privileges required"
        )
    return current_user


def require_manager_or_above(current_user: User = Depends(get_current_user)) -> User:
    """Require manager role or above within a tenant"""
    allowed_roles = ["BUSINESS_OWNER", "MANAGER"]
    if current_user.user_role not in allowed_roles and not current_user.is_founder:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Manager privileges or above required"
        )
    return current_user


def require_tenant_user(current_user: User = Depends(get_current_user)) -> User:
    """Require user to belong to a tenant (not platform founder accessing without tenant context)"""
    if current_user.tenant_id is None and not current_user.is_founder:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tenant access required"
        )
    return current_user


def get_tenant_filter(current_user: User = Depends(get_current_user)) -> Optional[str]:
    """Get tenant filter for data isolation"""
    # Platform founder can see all data if no specific tenant context
    if current_user.is_founder:
        return None
    
    # Regular users can only see their tenant's data
    return current_user.tenant_id


def require_active_user(current_user: User = Depends(get_current_user)) -> User:
    """Require active user account"""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user account"
        )
    return current_user


# Data models for API
class LoginRequest:
    def __init__(self, email: str, password: str):
        self.email = email
        self.password = password


class RegisterRequest:
    def __init__(self, email: str, password: str, full_name: str):
        self.email = email
        self.password = password
        self.full_name = full_name


class TokenResponse:
    def __init__(self, access_token: str, token_type: str = "bearer"):
        self.access_token = access_token
        self.token_type = token_type


class UserResponse:
    def __init__(self, user: User, tenant: Optional[Tenant] = None):
        self.system_id = user.system_id
        self.display_id = user.display_id
        self.email = user.email
        self.full_name = user.full_name
        self.role = user.user_role
        self.is_active = user.is_active
        self.is_founder = user.is_founder
        self.tenant_id = user.tenant_id
        self.created_at = user.created_at.isoformat() if user.created_at else None
        
        # Add tenant information if available
        if tenant:
            self.tenant_name = tenant.business_name
            self.tenant_type = tenant.business_type
        else:
            self.tenant_name = None
            self.tenant_type = None


class TenantResponse:
    def __init__(self, tenant: Tenant):
        self.system_id = tenant.system_id
        self.display_id = tenant.display_id
        self.business_name = tenant.business_name
        self.business_type = tenant.business_type
        self.is_active = tenant.is_active
        self.created_at = tenant.created_at.isoformat() if tenant.created_at else None


class CreateTenantRequest:
    def __init__(self, business_name: str, business_type: str, owner_email: str, owner_password: str, owner_name: str):
        self.business_name = business_name
        self.business_type = business_type
        self.owner_email = owner_email
        self.owner_password = owner_password
        self.owner_name = owner_name


class CreateTenantUserRequest:
    def __init__(self, email: str, password: str, full_name: str, role: str):
        self.email = email
        self.password = password
        self.full_name = full_name
        self.role = role
