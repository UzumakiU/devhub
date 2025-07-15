"""
Database models for DevHub - Multi-Tenant SaaS Platform
Implements the prefixed sequential ID system (USR-000, PRJ-001, etc.)

ARCHITECTURE CLARIFICATION:
- Platform Founder (USR-000): DevHub Enterprise owner, controls entire platform
- Tenant Businesses: Client businesses using the platform (e.g., ACME Corp)
- Business Owners: Own/control their specific tenant business completely
- Business Employees: Work within a tenant business with role-based permissions
- Customers: External clients that tenant businesses serve (CRM contacts)
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, func
from sqlalchemy.orm import relationship
from .database import Base
import datetime


class Tenant(Base):
    """
    Represents a client business using the DevHub platform
    Each tenant is a separate business with complete data isolation
    """
    __tablename__ = "tenants"
    
    id = Column(Integer, primary_key=True, index=True)
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
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    # Relationships
    users = relationship("User", back_populates="tenant")
    customers = relationship("Customer", back_populates="tenant")
    projects = relationship("Project", back_populates="tenant")


class User(Base):
    """
    Represents people who can login to the DevHub platform
    - Platform Founder: Controls entire platform (is_founder=True, tenant_id=None)
    - Business Owners: Control their tenant business completely (user_role=BUSINESS_OWNER)
    - Business Employees: Work within tenant with role-based permissions
    """
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
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
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    # Relationships
    tenant = relationship("Tenant", back_populates="users")
    projects_owned = relationship("Project", foreign_keys="Project.owner_id", back_populates="owner")
    project_assignments = relationship("ProjectAssignment", back_populates="user")
    customer_interactions = relationship("CustomerInteraction", back_populates="user")
    lead_interactions = relationship("LeadInteraction", back_populates="user")
    customer_notes = relationship("CustomerNote", back_populates="user")
    assigned_leads = relationship("Lead", foreign_keys="Lead.assigned_to", back_populates="assigned_user")


class Project(Base):
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    system_id = Column(String, unique=True, index=True)  # PRJ-000, PRJ-001, etc.
    
    # Tenant Relationship (data isolation)
    tenant_id = Column(String, ForeignKey("tenants.system_id"))
    
    # Project Information
    name = Column(String, index=True)
    description = Column(Text)
    status = Column(String, default="active")  # active, completed, on_hold, cancelled
    
    # Ownership (within tenant)
    owner_id = Column(String, ForeignKey("users.system_id"))
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    start_date = Column(DateTime)
    due_date = Column(DateTime)
    
    # Relationships
    tenant = relationship("Tenant", back_populates="projects")
    owner = relationship("User", foreign_keys=[owner_id], back_populates="projects_owned")
    assignments = relationship("ProjectAssignment", back_populates="project")
    customers = relationship("ProjectCustomer", back_populates="project")


class Customer(Base):
    """
    Represents external clients that tenant businesses serve (CRM contacts)
    These are NOT users of the platform - they are contacts in the CRM
    Each customer belongs to a specific tenant business
    """
    __tablename__ = "customers"
    
    id = Column(Integer, primary_key=True, index=True)
    system_id = Column(String, unique=True, index=True)  # CUS-000, CUS-001, etc.
    
    # Tenant Relationship (data isolation)
    tenant_id = Column(String, ForeignKey("tenants.system_id"))
    
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
    tenant = relationship("Tenant", back_populates="customers")
    projects = relationship("ProjectCustomer", back_populates="customer")
    invoices = relationship("Invoice", back_populates="customer")
    interactions = relationship("CustomerInteraction", back_populates="customer")
    notes = relationship("CustomerNote", back_populates="customer")


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


class CustomerInteraction(Base):
    """Track all interactions with customers (calls, emails, meetings, etc.)"""
    __tablename__ = "customer_interactions"
    
    id = Column(Integer, primary_key=True, index=True)
    system_id = Column(String, unique=True, index=True)  # INT-000, INT-001, etc.
    
    # References
    customer_id = Column(String, ForeignKey("customers.system_id"))
    user_id = Column(String, ForeignKey("users.system_id"))  # Who handled the interaction
    
    # Interaction Details
    interaction_type = Column(String, index=True)  # call, email, meeting, note, follow_up
    subject = Column(String)
    description = Column(Text)
    outcome = Column(String)  # successful, follow_up_needed, closed, etc.
    priority = Column(String, default="medium")  # low, medium, high, urgent
    
    # Scheduling
    scheduled_at = Column(DateTime)  # For scheduled interactions
    completed_at = Column(DateTime)  # When interaction was completed
    follow_up_date = Column(DateTime)  # Next follow-up date
    
    # Status
    status = Column(String, default="pending")  # pending, completed, cancelled
    is_billable = Column(Boolean, default=False)
    billable_hours = Column(String)  # For time tracking
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    # Relationships
    customer = relationship("Customer", back_populates="interactions")
    user = relationship("User", back_populates="customer_interactions")


class Lead(Base):
    """Lead management - potential customers before they become customers
    Each lead belongs to a specific tenant business"""
    __tablename__ = "leads"
    
    id = Column(Integer, primary_key=True, index=True)
    system_id = Column(String, unique=True, index=True)  # LED-000, LED-001, etc.
    
    # Tenant Relationship (data isolation)
    tenant_id = Column(String, ForeignKey("tenants.system_id"))
    
    # Lead Information
    name = Column(String, index=True)
    email = Column(String, index=True)
    phone = Column(String)
    company = Column(String)
    job_title = Column(String)
    
    # Lead Source & Qualification
    source = Column(String)  # website, referral, cold_call, social_media, etc.
    lead_score = Column(Integer, default=0)  # 0-100 lead scoring
    qualification_status = Column(String, default="new")  # new, qualified, unqualified, nurturing
    
    # Sales Pipeline
    stage = Column(String, default="prospect")  # prospect, contacted, qualified, proposal, negotiation, closed_won, closed_lost
    estimated_value = Column(String)  # Potential deal value
    probability = Column(Integer, default=10)  # 0-100% chance of closing
    expected_close_date = Column(DateTime)
    
    # Assignment (within tenant)
    assigned_to = Column(String, ForeignKey("users.system_id"))  # Sales rep handling the lead
    
    # Address (optional for leads)
    address_line1 = Column(String)
    address_line2 = Column(String)
    city = Column(String)
    state = Column(String)
    postal_code = Column(String)
    country = Column(String, default="US")
    
    # Status
    is_active = Column(Boolean, default=True)
    converted_to_customer = Column(Boolean, default=False)
    converted_customer_id = Column(String, ForeignKey("customers.system_id"))  # If converted
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    last_contacted = Column(DateTime)
    
    # Relationships
    tenant = relationship("Tenant")
    assigned_user = relationship("User", foreign_keys=[assigned_to], back_populates="assigned_leads")
    converted_customer = relationship("Customer", foreign_keys=[converted_customer_id])
    interactions = relationship("LeadInteraction", back_populates="lead")


class LeadInteraction(Base):
    """Track interactions with leads (similar to customer interactions)"""
    __tablename__ = "lead_interactions"
    
    id = Column(Integer, primary_key=True, index=True)
    system_id = Column(String, unique=True, index=True)  # LIN-000, LIN-001, etc.
    
    # References
    lead_id = Column(String, ForeignKey("leads.system_id"))
    user_id = Column(String, ForeignKey("users.system_id"))
    
    # Interaction Details
    interaction_type = Column(String, index=True)  # call, email, meeting, demo, proposal
    subject = Column(String)
    description = Column(Text)
    outcome = Column(String)  # interested, not_interested, follow_up, proposal_sent, etc.
    
    # Scheduling
    scheduled_at = Column(DateTime)
    completed_at = Column(DateTime)
    follow_up_date = Column(DateTime)
    
    # Status
    status = Column(String, default="pending")
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    # Relationships
    lead = relationship("Lead", back_populates="interactions")
    user = relationship("User", back_populates="lead_interactions")


class CustomerNote(Base):
    """Store notes and comments about customers"""
    __tablename__ = "customer_notes"
    
    id = Column(Integer, primary_key=True, index=True)
    system_id = Column(String, unique=True, index=True)  # NOT-000, NOT-001, etc.
    
    # References
    customer_id = Column(String, ForeignKey("customers.system_id"))
    user_id = Column(String, ForeignKey("users.system_id"))  # Who created the note
    
    # Note Details
    title = Column(String)
    content = Column(Text)
    note_type = Column(String, default="general")  # general, important, follow_up, complaint, compliment
    is_private = Column(Boolean, default=False)  # Internal note vs customer-visible
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    # Relationships
    customer = relationship("Customer", back_populates="notes")
    user = relationship("User", back_populates="customer_notes")
