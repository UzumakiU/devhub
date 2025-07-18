"""
Invoice Management Models - Comprehensive Version
"""
from sqlalchemy import Column, String, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from decimal import Decimal
from .base import BaseModel, TimestampMixin


class InvoiceStatus:
    """Invoice status constants"""
    DRAFT = "draft"
    PENDING = "pending"
    SENT = "sent"
    VIEWED = "viewed"
    PAID = "paid"
    OVERDUE = "overdue"
    CANCELLED = "cancelled"


class Invoice(BaseModel, TimestampMixin):
    """Simple invoice model matching actual database schema"""
    __tablename__ = "invoices"
    
    # System identifier  
    system_id = Column(String, unique=True, index=True)  # INV-000, INV-001, etc.
    
    # Core invoice fields
    status = Column(String(20), nullable=False, default=InvoiceStatus.DRAFT)
    
    # Date fields (stored as datetime/timestamp in actual DB)
    issue_date = Column(DateTime, nullable=False)
    due_date = Column(DateTime, nullable=False)
    paid_date = Column(DateTime, nullable=True)
    
    # Amount fields (stored as strings in actual DB)
    amount = Column(String(50), nullable=False)  # Matches actual VARCHAR type
    currency = Column(String(3), nullable=False, default="USD")
    
    # Foreign keys
    customer_id = Column(String(50), ForeignKey('customers.system_id'), nullable=False)
    # Note: No tenant_id or project_id in actual table schema
    
    # Relationships
    customer = relationship("Customer", back_populates="invoices")
    # Note: No project or tenant relationships due to missing foreign keys
    
    # Indexes for performance
    __table_args__ = (
        Index('idx_invoice_customer', 'customer_id'),
        Index('idx_invoice_status', 'status'),
        Index('idx_invoice_due_date', 'due_date'),
        Index('idx_invoice_issue_date', 'issue_date'),
        Index('idx_invoice_amount', 'amount'),
    )
    
    def __repr__(self):
        return f"<Invoice(system_id='{self.system_id}', amount={self.amount}, status='{self.status}')>"
    
    @property
    def is_overdue(self) -> bool:
        """Check if invoice is overdue"""
        if self.status in [InvoiceStatus.PAID, InvoiceStatus.CANCELLED]:
            return False
        
        from datetime import datetime
        return datetime.now() > self.due_date
    
    @property
    def days_until_due(self) -> int:
        """Calculate days until due (negative if overdue)"""
        from datetime import datetime
        return (self.due_date - datetime.now()).days

# InvoiceItem class disabled - not present in actual database schema
# class InvoiceItem(BaseModel, TimestampMixin):
#     """Invoice item/line item model"""
#     __tablename__ = "invoice_items"
#     
#     # System identifier
#     system_id = Column(String, unique=True, index=True)  # ITM-000, ITM-001, etc.
#     
#     # Core fields
#     description = Column(String(500), nullable=False)
#     quantity = Column(Numeric(10, 2), nullable=False)
#     unit_price = Column(Numeric(10, 2), nullable=False)
#     total = Column(Numeric(12, 2), nullable=False)
#     
#     # Foreign keys
#     invoice_id = Column(String(50), ForeignKey('invoices.system_id'), nullable=False)
#     
#     # Relationships - DISABLED
#     # invoice = relationship("Invoice", back_populates="items")
#     
#     # Indexes for performance
#     __table_args__ = (
#         Index('idx_invoice_item_invoice', 'invoice_id'),
#     )
#     
#     def __repr__(self):
#         return f"<InvoiceItem(system_id='{self.system_id}', description='{self.description}', total={self.total})>"
