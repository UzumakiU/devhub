"""Project schemas for API requests and responses."""

from datetime import datetime
from decimal import Decimal
from enum import Enum
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


class ProjectStatus(str, Enum):
    """Project status enum."""
    PLANNED = "planned"
    IN_PROGRESS = "in_progress" 
    ON_HOLD = "on_hold"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class ProjectPriority(str, Enum):
    """Project priority enum."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


# Base schema with common fields
class ProjectBase(BaseModel):
    """Base project schema with common fields."""
    name: str = Field(..., min_length=1, max_length=200, description="Project name")
    description: Optional[str] = Field(None, max_length=2000, description="Project description")
    status: ProjectStatus = Field(default=ProjectStatus.PLANNED, description="Project status")
    priority: ProjectPriority = Field(default=ProjectPriority.MEDIUM, description="Project priority")
    budget: Optional[Decimal] = Field(None, ge=0, description="Project budget")
    start_date: Optional[datetime] = Field(None, description="Project start date")
    end_date: Optional[datetime] = Field(None, description="Project end date")
    estimated_hours: Optional[Decimal] = Field(None, ge=0, description="Estimated hours")
    actual_hours: Optional[Decimal] = Field(None, ge=0, description="Actual hours worked")


# Schema for creating a project
class ProjectCreate(ProjectBase):
    """Schema for creating a new project."""
    customer_id: str = Field(..., description="Customer ID this project belongs to")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "name": "Website Redesign",
                "description": "Complete redesign of company website",
                "status": "planned",
                "priority": "high",
                "budget": "15000.00",
                "start_date": "2024-01-15T00:00:00Z",
                "end_date": "2024-03-15T00:00:00Z",
                "estimated_hours": "120.5",
                "customer_id": "550e8400-e29b-41d4-a716-446655440000"
            }
        }
    )


# Schema for updating a project
class ProjectUpdate(BaseModel):
    """Schema for updating an existing project."""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    status: Optional[ProjectStatus] = None
    priority: Optional[ProjectPriority] = None
    budget: Optional[Decimal] = Field(None, ge=0)
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    estimated_hours: Optional[Decimal] = Field(None, ge=0)
    actual_hours: Optional[Decimal] = Field(None, ge=0)
    customer_id: Optional[str] = None

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "status": "in_progress",
                "actual_hours": "45.5"
            }
        }
    )


# Schema for project responses (includes database fields)
class ProjectResponse(ProjectBase):
    """Schema for project API responses."""
    id: str = Field(..., description="Unique project identifier")
    customer_id: str = Field(..., description="Customer ID this project belongs to")
    tenant_id: str = Field(..., description="Tenant ID")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
    
    # Optional customer details for expanded responses
    customer_name: Optional[str] = Field(None, description="Customer name")
    customer_email: Optional[str] = Field(None, description="Customer email")

    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "name": "Website Redesign",
                "description": "Complete redesign of company website",
                "status": "in_progress",
                "priority": "high",
                "budget": "15000.00",
                "start_date": "2024-01-15T00:00:00Z",
                "end_date": "2024-03-15T00:00:00Z",
                "estimated_hours": "120.5",
                "actual_hours": "45.5",
                "customer_id": "550e8400-e29b-41d4-a716-446655440001",
                "tenant_id": "550e8400-e29b-41d4-a716-446655440002",
                "created_at": "2024-01-01T00:00:00Z",
                "updated_at": "2024-01-15T12:30:00Z",
                "customer_name": "Acme Corp",
                "customer_email": "contact@acme.com"
            }
        }
    )


# Schema for listing projects with pagination
class ProjectList(BaseModel):
    """Schema for paginated project list responses."""
    projects: List[ProjectResponse] = Field(..., description="List of projects")
    total: int = Field(..., description="Total number of projects")
    page: int = Field(..., description="Current page number")
    per_page: int = Field(..., description="Items per page")
    has_next: bool = Field(..., description="Whether there are more pages")
    has_prev: bool = Field(..., description="Whether there are previous pages")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "projects": [],
                "total": 25,
                "page": 1,
                "per_page": 10,
                "has_next": True,
                "has_prev": False
            }
        }
    )


# Schema for project filters
class ProjectFilters(BaseModel):
    """Schema for filtering projects."""
    status: Optional[ProjectStatus] = None
    priority: Optional[ProjectPriority] = None
    customer_id: Optional[str] = None
    start_date_from: Optional[datetime] = None
    start_date_to: Optional[datetime] = None
    end_date_from: Optional[datetime] = None
    end_date_to: Optional[datetime] = None
    budget_min: Optional[Decimal] = Field(None, ge=0)
    budget_max: Optional[Decimal] = Field(None, ge=0)

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "status": "in_progress",
                "priority": "high",
                "customer_id": "550e8400-e29b-41d4-a716-446655440000"
            }
        }
    )
