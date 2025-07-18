"""
Invoice Management Models
"""
from sqlalchemy import Column, String, Text, Date, Numeric, ForeignKey, Index
from sqlalchemy.orm import relationship
from decimal import Decimal
from .base import BaseModel, TimestampMixin
from .tenant import Tenant
from .crm import Customer


class InvoiceStatus:
    """Invoice status constants"""
    DRAFT = "draft"
    PENDING = "pending"
    PAID = "paid"
    OVERDUE = "overdue"
    CANCELLED = "cancelled"


class Invoice(BaseModel, TimestampMixin):
    """Invoice management model"""
    __tablename__ = "invoices"
    
    # Core fields
    customer_id = Column(String(50), ForeignKey('customers.system_id'), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(3), nullable=False, default='USD')
    status = Column(String(50), nullable=False, default=InvoiceStatus.DRAFT)
    
    # Date fields
    issue_date = Column(Date, nullable=False)
    due_date = Column(Date, nullable=True)
    paid_date = Column(Date, nullable=True)
    
    # Optional fields
    description = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    
    # Relationships
    tenant_id = Column(String(50), ForeignKey('tenants.system_id'), nullable=False)
    created_by = Column(String(50), ForeignKey('users.system_id'), nullable=True)
    
    # SQLAlchemy relationships
    tenant = relationship("Tenant", back_populates="invoices")
    customer = relationship("Customer", back_populates="invoices")
    creator = relationship("User", back_populates="created_invoices")
    
    # Indexes for performance
    __table_args__ = (
        Index('idx_invoice_tenant', 'tenant_id'),
        Index('idx_invoice_customer', 'customer_id'),
        Index('idx_invoice_status', 'status'),
        Index('idx_invoice_due_date', 'due_date'),
        Index('idx_invoice_issue_date', 'issue_date'),
        Index('idx_invoice_amount', 'amount'),
    )
    
    def __repr__(self):
        return f"<Invoice(system_id='{self.system_id}', customer_id='{self.customer_id}', amount={self.amount}, status='{self.status}')>"
    
    @property
    def is_overdue(self) -> bool:
        """Check if invoice is overdue"""
        if not self.due_date or self.status in [InvoiceStatus.PAID, InvoiceStatus.CANCELLED]:
            return False
        
        from datetime import date
        return date.today() > self.due_date and self.status != InvoiceStatus.PAID
    
    @property
    def formatted_amount(self) -> str:
        """Format amount for display"""
        return f"{self.amount:.2f} {self.currency}"
    
    @property
    def days_until_due(self) -> int:
        """Calculate days until due (negative if overdue)"""
        if not self.due_date:
            return 0
        
        from datetime import date
        return (self.due_date - date.today()).days
