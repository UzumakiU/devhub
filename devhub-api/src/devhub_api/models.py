"""
Database models for DevHub
Implements the prefixed sequential ID system (USR-000, PRJ-001, etc.)
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, func
from sqlalchemy.orm import relationship
from .database import Base
import datetime


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    system_id = Column(String, unique=True, index=True)  # USR-000, USR-001, etc.
    display_id = Column(String, index=True)  # FOUNDER for USR-000, OWNER/EMPLOYEE/CLIENT for others
    
    # User Information
    email = Column(String, unique=True, index=True)
    full_name = Column(String)
    hashed_password = Column(String)
    
    # Tenant Information
    tenant_id = Column(String, index=True)  # DEV-000 for DevHub Entreprise, etc.
    tenant_name = Column(String)  # "DevHub Entreprise", etc.
    
    # User Role within tenant
    user_role = Column(String, default="EMPLOYEE")  # FOUNDER, OWNER, EMPLOYEE, CLIENT
    
    # Status
    is_active = Column(Boolean, default=True)
    is_founder = Column(Boolean, default=False)  # Only true for the platform founder (USR-000)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    # Relationships
    projects_owned = relationship("Project", foreign_keys="Project.owner_id", back_populates="owner")
    project_assignments = relationship("ProjectAssignment", back_populates="user")


class Project(Base):
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    system_id = Column(String, unique=True, index=True)  # PRJ-000, PRJ-001, etc.
    
    # Project Information
    name = Column(String, index=True)
    description = Column(Text)
    status = Column(String, default="active")  # active, completed, on_hold, cancelled
    
    # Ownership
    owner_id = Column(String, ForeignKey("users.system_id"))
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    start_date = Column(DateTime)
    due_date = Column(DateTime)
    
    # Relationships
    owner = relationship("User", foreign_keys=[owner_id], back_populates="projects_owned")
    assignments = relationship("ProjectAssignment", back_populates="project")
    customers = relationship("ProjectCustomer", back_populates="project")


class Customer(Base):
    __tablename__ = "customers"
    
    id = Column(Integer, primary_key=True, index=True)
    system_id = Column(String, unique=True, index=True)  # CUS-000, CUS-001, etc.
    
    # Customer Information
    name = Column(String, index=True)
    email = Column(String, index=True)
    phone = Column(String)
    company = Column(String)
    
    # Address
    address_line1 = Column(String)
    address_line2 = Column(String)
    city = Column(String)
    state = Column(String)
    postal_code = Column(String)
    country = Column(String, default="US")
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    # Relationships
    projects = relationship("ProjectCustomer", back_populates="customer")
    invoices = relationship("Invoice", back_populates="customer")


class ProjectAssignment(Base):
    __tablename__ = "project_assignments"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # References
    user_id = Column(String, ForeignKey("users.system_id"))
    project_id = Column(String, ForeignKey("projects.system_id"))
    
    # Assignment Details
    role = Column(String)  # developer, designer, manager, etc.
    assigned_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="project_assignments")
    project = relationship("Project", back_populates="assignments")


class ProjectCustomer(Base):
    __tablename__ = "project_customers"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # References
    project_id = Column(String, ForeignKey("projects.system_id"))
    customer_id = Column(String, ForeignKey("customers.system_id"))
    
    # Timestamps
    linked_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    # Relationships
    project = relationship("Project", back_populates="customers")
    customer = relationship("Customer", back_populates="projects")


class Invoice(Base):
    __tablename__ = "invoices"
    
    id = Column(Integer, primary_key=True, index=True)
    system_id = Column(String, unique=True, index=True)  # INV-000, INV-001, etc.
    
    # Invoice Information
    customer_id = Column(String, ForeignKey("customers.system_id"))
    amount = Column(String)  # Store as string to avoid floating point issues
    currency = Column(String, default="USD")
    
    # Status
    status = Column(String, default="draft")  # draft, sent, paid, overdue, cancelled
    
    # Dates
    issue_date = Column(DateTime, default=datetime.datetime.utcnow)
    due_date = Column(DateTime)
    paid_date = Column(DateTime)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    # Relationships
    customer = relationship("Customer", back_populates="invoices")


class PasswordVault(Base):
    __tablename__ = "password_vault"
    
    id = Column(Integer, primary_key=True, index=True)
    user_system_id = Column(String, ForeignKey("users.system_id"))
    original_password = Column(String)  # Original password (encrypted)
    vault_access_code = Column(String, default="0000")  # 4-digit access code
    
    # Metadata
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    created_by = Column(String, default="USR-000")  # Who created this entry
    
    # Relationships
    user = relationship("User", backref="password_vault_entries")
