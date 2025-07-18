"""
Models package - Organized database models by domain
"""
from .base import BaseModel, TimestampMixin
from .tenant import Tenant
from .user import User
from .crm import Customer, Lead, CustomerInteraction, LeadInteraction, CustomerNote, CustomerStatus, LeadStatus
from .project import Project, ProjectStatus, ProjectPriority
from .invoice import Invoice, InvoiceStatus

__all__ = [
    "BaseModel",
    "TimestampMixin", 
    "Tenant",
    "User",
    "Customer",
    "Lead", 
    "CustomerInteraction",
    "LeadInteraction",
    "CustomerNote",
    "CustomerStatus",
    "LeadStatus",
    "Project",
    "ProjectStatus",
    "ProjectPriority",
    "Invoice",
    "InvoiceStatus"
]
