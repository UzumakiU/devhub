"""
Project Management Models
"""
from sqlalchemy import Column, String, Text, Date, Numeric, ForeignKey, Index
from sqlalchemy.orm import relationship
from decimal import Decimal
from .base import BaseModel, TimestampMixin
from .tenant import Tenant
from .user import User


class ProjectStatus:
    """Project status constants"""
    PLANNED = "planned"
    IN_PROGRESS = "in_progress"
    ON_HOLD = "on_hold"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class ProjectPriority:
    """Project priority constants"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class Project(BaseModel, TimestampMixin):
    """Comprehensive project management model"""
    __tablename__ = "projects"
    
    # System identifier
    system_id = Column(String, unique=True, index=True)  # PRJ-000, PRJ-001, etc.
    
    # Core fields
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default=ProjectStatus.PLANNED)
    
    # Date fields  
    start_date = Column(Date, nullable=True)
    due_date = Column(Date, nullable=True)  # Matches actual DB column name
    
    # Foreign keys
    tenant_id = Column(String(50), ForeignKey('tenants.system_id'), nullable=False)
    owner_id = Column(String(50), ForeignKey('users.system_id'), nullable=True)  # Matches actual DB column name
    
    # SQLAlchemy relationships
    tenant = relationship("Tenant", back_populates="projects")
    owner = relationship("User", foreign_keys=[owner_id])  # Updated to match actual column
    # invoices = relationship("Invoice", back_populates="project")  # May not exist
    
    # Indexes for performance
    __table_args__ = (
        Index('idx_project_tenant', 'tenant_id'),
        Index('idx_project_status', 'status'),
        Index('idx_project_due_date', 'due_date'),
        Index('idx_project_start_date', 'start_date'),
        Index('idx_project_owner', 'owner_id'),
    )
    
    def __repr__(self):
        return f"<Project(system_id='{self.system_id}', name='{self.name}', status='{self.status}')>"
    
    @property
    def is_overdue(self) -> bool:
        """Check if project is overdue"""
        if not self.due_date or self.status in [ProjectStatus.COMPLETED, ProjectStatus.CANCELLED]:
            return False
        
        from datetime import date
        return date.today() > self.due_date
    
    @property
    def duration_days(self) -> int:
        """Calculate project duration in days"""
        if not self.start_date or not self.due_date:
            return 0
        
        return (self.due_date - self.start_date).days
