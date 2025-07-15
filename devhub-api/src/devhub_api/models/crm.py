"""
CRM models - Customer, Lead, and related interaction models
"""
from sqlalchemy import Column, String, Boolean, Text, ForeignKey, Integer, Enum as SQLEnum
from sqlalchemy.orm import relationship
from .base import BaseModel, TimestampMixin
import enum

class CustomerStatus(enum.Enum):
    PROSPECT = "prospect"
    ACTIVE = "active"
    INACTIVE = "inactive"
    CHURNED = "churned"

class LeadStatus(enum.Enum):
    NEW = "new"
    CONTACTED = "contacted"
    QUALIFIED = "qualified"
    PROPOSAL = "proposal"
    NEGOTIATION = "negotiation"
    CLOSED_WON = "closed_won"
    CLOSED_LOST = "closed_lost"

class Customer(BaseModel, TimestampMixin):
    """
    Represents external clients that tenant businesses serve
    These are the CRM contacts for each business
    """
    __tablename__ = "customers"
    
    system_id = Column(String, unique=True, index=True)  # CUS-000, CUS-001, etc.
    tenant_id = Column(String, ForeignKey("tenants.system_id"), nullable=False)
    
    # Customer Information
    company_name = Column(String, index=True)
    contact_name = Column(String)
    email = Column(String)
    phone = Column(String)
    
    # Address
    address_line1 = Column(String)
    address_line2 = Column(String)
    city = Column(String)
    state = Column(String)
    postal_code = Column(String)
    country = Column(String, default="US")
    
    # Business Details
    industry = Column(String)
    company_size = Column(String)  # "1-10", "11-50", "51-200", etc.
    website = Column(String)
    notes = Column(Text)
    
    # Status
    status = Column(SQLEnum(CustomerStatus), default=CustomerStatus.PROSPECT)
    
    # Relationships
    tenant = relationship("Tenant", back_populates="customers")
    interactions = relationship("CustomerInteraction", back_populates="customer")
    notes_list = relationship("CustomerNote", back_populates="customer")

class Lead(BaseModel, TimestampMixin):
    """Lead management for CRM"""
    __tablename__ = "leads"
    
    system_id = Column(String, unique=True, index=True)  # LED-000, LED-001, etc.
    tenant_id = Column(String, ForeignKey("tenants.system_id"), nullable=False)
    
    # Lead Information
    company_name = Column(String, index=True)
    contact_name = Column(String)
    email = Column(String)
    phone = Column(String)
    
    # Lead Details
    source = Column(String)  # website, referral, cold_call, etc.
    status = Column(SQLEnum(LeadStatus), default=LeadStatus.NEW)
    value = Column(Integer, default=0)  # Estimated value in cents
    probability = Column(Integer, default=0)  # 0-100 percentage
    
    # Assignment
    assigned_to = Column(String, ForeignKey("users.system_id"), nullable=True)
    
    # Notes
    description = Column(Text)
    notes = Column(Text)
    
    # Relationships
    tenant = relationship("Tenant")
    assigned_user = relationship("User", foreign_keys=[assigned_to], back_populates="assigned_leads")
    interactions = relationship("LeadInteraction", back_populates="lead")

class CustomerInteraction(BaseModel, TimestampMixin):
    """Track all interactions with customers"""
    __tablename__ = "customer_interactions"
    
    system_id = Column(String, unique=True, index=True)  # INT-000, INT-001, etc.
    customer_id = Column(String, ForeignKey("customers.system_id"), nullable=False)
    user_id = Column(String, ForeignKey("users.system_id"), nullable=False)
    
    # Interaction Details
    interaction_type = Column(String)  # call, email, meeting, demo, etc.
    subject = Column(String)
    description = Column(Text)
    outcome = Column(String)  # positive, negative, neutral, follow_up_needed
    
    # Relationships
    customer = relationship("Customer", back_populates="interactions")
    user = relationship("User", back_populates="customer_interactions")

class LeadInteraction(BaseModel, TimestampMixin):
    """Track all interactions with leads"""
    __tablename__ = "lead_interactions"
    
    system_id = Column(String, unique=True, index=True)  # LI-000, LI-001, etc.
    lead_id = Column(String, ForeignKey("leads.system_id"), nullable=False)
    user_id = Column(String, ForeignKey("users.system_id"), nullable=False)
    
    # Interaction Details
    interaction_type = Column(String)  # call, email, meeting, demo, etc.
    subject = Column(String)
    description = Column(Text)
    outcome = Column(String)  # positive, negative, neutral, follow_up_needed
    
    # Relationships
    lead = relationship("Lead", back_populates="interactions")
    user = relationship("User", back_populates="lead_interactions")

class CustomerNote(BaseModel, TimestampMixin):
    """Customer notes and comments"""
    __tablename__ = "customer_notes"
    
    system_id = Column(String, unique=True, index=True)  # CN-000, CN-001, etc.
    customer_id = Column(String, ForeignKey("customers.system_id"), nullable=False)
    user_id = Column(String, ForeignKey("users.system_id"), nullable=False)
    
    # Note Details
    note_type = Column(String, default="general")  # general, important, follow_up, etc.
    title = Column(String)
    content = Column(Text)
    is_private = Column(Boolean, default=False)
    
    # Relationships
    customer = relationship("Customer", back_populates="notes_list")
    user = relationship("User", back_populates="customer_notes")
