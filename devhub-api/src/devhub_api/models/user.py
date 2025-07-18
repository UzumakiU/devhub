"""
User model - Represents people who can login to the DevHub platform
"""
from sqlalchemy import Column, String, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship
from .base import BaseModel, TimestampMixin

class User(BaseModel, TimestampMixin):
    """
    Represents people who can login to the DevHub platform
    - Platform Founder: Controls entire platform (is_founder=True, tenant_id=None)
    - Business Owners: Control their tenant business completely (user_role=BUSINESS_OWNER)
    - Business Employees: Work within tenant with role-based permissions
    """
    __tablename__ = "users"
    
    system_id = Column(String, unique=True, index=True)  # USR-000, USR-001, etc.
    display_id = Column(String, index=True)  # FOUNDER for USR-000, business role for others
    
    # User Information
    email = Column(String, unique=True, index=True)
    full_name = Column(String)
    hashed_password = Column(String)
    
    # Tenant Relationship
    tenant_id = Column(String, ForeignKey("tenants.system_id"), nullable=True)  # NULL for platform founder
    
    # User Role within tenant (or platform for founder)
    user_role = Column(String, default="EMPLOYEE")  # FOUNDER, BUSINESS_OWNER, MANAGER, EMPLOYEE
    department = Column(String)  # sales, marketing, development, admin, etc.
    
    # Permissions (JSON string for flexibility)
    permissions = Column(Text)  # JSON: {"crm": true, "projects": true, "invoices": false}
    
    # Status
    is_active = Column(Boolean, default=True)
    is_founder = Column(Boolean, default=False)  # Only true for platform founder (USR-000)
    
    # Relationships
    tenant = relationship("Tenant", back_populates="users")
    owned_projects = relationship("Project", foreign_keys="Project.owner_id")  # Updated to match actual column
    # created_invoices = relationship("Invoice", back_populates="creator")  # Temporarily disabled - no foreign key
    customer_interactions = relationship("CustomerInteraction", back_populates="user")
    lead_interactions = relationship("LeadInteraction", back_populates="user")
    customer_notes = relationship("CustomerNote", back_populates="user")
    assigned_leads = relationship("Lead", foreign_keys="Lead.assigned_to", back_populates="assigned_user")
