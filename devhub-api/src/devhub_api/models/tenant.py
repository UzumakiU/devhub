"""
Tenant model - Represents client businesses using the DevHub platform
"""
from sqlalchemy import Column, String, Boolean, Integer
from sqlalchemy.orm import relationship
from .base import BaseModel, TimestampMixin

class Tenant(BaseModel, TimestampMixin):
    """
    Represents a client business using the DevHub platform
    Each tenant is a separate business with complete data isolation
    """
    __tablename__ = "tenants"
    
    system_id = Column(String, unique=True, index=True)  # TNT-000, TNT-001, etc.
    
    # Business Information
    business_name = Column(String, index=True)  # "ACME Corp", "TechFlow Solutions"
    business_email = Column(String)
    business_phone = Column(String)
    
    # Address
    address_line1 = Column(String)
    address_line2 = Column(String)
    city = Column(String)
    state = Column(String)
    postal_code = Column(String)
    country = Column(String, default="US")
    
    # Subscription & Status
    subscription_plan = Column(String, default="starter")  # starter, professional, enterprise
    is_active = Column(Boolean, default=True)
    max_users = Column(Integer, default=5)  # Based on subscription plan
    
    # Relationships
    users = relationship("User", back_populates="tenant")
    customers = relationship("Customer", back_populates="tenant")
    projects = relationship("Project", back_populates="tenant")
    # invoices = relationship("Invoice", back_populates="tenant")  # Disabled - no tenant_id in invoices
