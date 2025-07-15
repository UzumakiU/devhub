"""
Authentication System for DevHub
JWT-based authentication with founder account support
"""
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import os
from .database import get_db
from .models import User
from .id_system import create_founder_account, create_user


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
        """Create a JWT access token"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        
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


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)) -> User:
    """Get the current authenticated user"""
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


def require_founder(current_user: User = Depends(get_current_user)) -> User:
    """Require founder privileges"""
    if not current_user.is_founder:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Founder privileges required"
        )
    return current_user


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
    def __init__(self, user: User):
        self.system_id = user.system_id
        self.display_id = user.display_id
        self.email = user.email
        self.full_name = user.full_name
        self.is_active = user.is_active
        self.is_founder = user.is_founder
        self.created_at = user.created_at.isoformat() if user.created_at else None
