"""
Authentication service
"""
from sqlalchemy.orm import Session
from typing import Optional
from ..models import User
from ..core import verify_password, create_access_token, hash_password

class AuthService:
    """Authentication service for user login/registration"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def authenticate_user(self, email: str, password: str) -> Optional[str]:
        """Authenticate user and return JWT token"""
        user = self.db.query(User).filter(User.email == email).first()
        
        if not user or not verify_password(password, user.hashed_password):
            return None
        
        if not user.is_active:
            return None
        
        # Create JWT token
        token_data = {
            "sub": user.system_id,
            "email": user.email,
            "tenant_id": user.tenant_id,
            "is_founder": user.is_founder
        }
        
        return create_access_token(token_data)
    
    def get_user_by_token(self, token: str) -> Optional[User]:
        """Get user from JWT token"""
        from ..core.security import verify_token
        
        payload = verify_token(token)
        if not payload:
            return None
        
        user_id = payload.get("sub")
        if not user_id:
            return None
        
        return self.db.query(User).filter(User.system_id == user_id).first()
    
    def create_user(self, email: str, password: str, full_name: str, tenant_id: Optional[str] = None) -> User:
        """Create a new user"""
        hashed_pw = hash_password(password)
        
        # Generate system ID (simplified for now)
        user_count = self.db.query(User).count()
        system_id = f"USR-{user_count + 1:03d}"
        
        user = User(
            system_id=system_id,
            email=email,
            full_name=full_name,
            hashed_password=hashed_pw,
            tenant_id=tenant_id
        )
        
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        
        return user
