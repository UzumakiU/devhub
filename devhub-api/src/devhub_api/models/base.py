"""
Base model configuration and common fields
"""
from sqlalchemy import Column, Integer, DateTime
from ..database import Base
from datetime import datetime, timezone

class TimestampMixin:
    """Mixin for models that need created_at and updated_at timestamps"""
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class BaseModel(Base):
    """Base model with common fields"""
    __abstract__ = True
    
    id = Column(Integer, primary_key=True, index=True)
