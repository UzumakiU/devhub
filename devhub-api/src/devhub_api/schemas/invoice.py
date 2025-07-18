"""Invoice schemas for API requests and responses."""

from datetime import datetime, date
from decimal import Decimal
from enum import Enum
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


class InvoiceStatus(str, Enum):
    """Invoice status enum."""
    DRAFT = "draft"
    PENDING = "pending"
    SENT = "sent"
    VIEWED = "viewed"
    PAID = "paid"
    OVERDUE = "overdue"
    CANCELLED = "cancelled"


class InvoiceItemBase(BaseModel):
    """Base schema for invoice items."""
    description: str = Field(..., min_length=1, max_length=500, description="Item description")
    quantity: Decimal = Field(..., gt=0, description="Item quantity")
    unit_price: Decimal = Field(..., ge=0, description="Price per unit")
    total: Decimal = Field(..., ge=0, description="Total price (quantity * unit_price)")


class InvoiceItemCreate(InvoiceItemBase):
    """Schema for creating invoice items."""
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "description": "Web Development Services",
                "quantity": "10.0",
                "unit_price": "150.00",
                "total": "1500.00"
            }
        }
    )


class InvoiceItemUpdate(BaseModel):
    """Schema for updating invoice items."""
    description: Optional[str] = Field(None, min_length=1, max_length=500)
    quantity: Optional[Decimal] = Field(None, gt=0)
    unit_price: Optional[Decimal] = Field(None, ge=0)
    total: Optional[Decimal] = Field(None, ge=0)


class InvoiceItemResponse(InvoiceItemBase):
    """Schema for invoice item responses."""
    id: str = Field(..., description="Item ID")
    invoice_id: str = Field(..., description="Invoice ID")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "invoice_id": "550e8400-e29b-41d4-a716-446655440001",
                "description": "Web Development Services",
                "quantity": "10.0",
                "unit_price": "150.00",
                "total": "1500.00",
                "created_at": "2024-01-01T00:00:00Z",
                "updated_at": "2024-01-01T00:00:00Z"
            }
        }
    )


# Base schema with common invoice fields
class InvoiceBase(BaseModel):
    """Base invoice schema with common fields."""
    invoice_number: str = Field(..., min_length=1, max_length=50, description="Invoice number")
    status: InvoiceStatus = Field(default=InvoiceStatus.DRAFT, description="Invoice status")
    issue_date: date = Field(..., description="Invoice issue date")
    due_date: date = Field(..., description="Invoice due date")
    subtotal: Decimal = Field(..., ge=0, description="Subtotal amount")
    tax_rate: Decimal = Field(default=Decimal("0.00"), ge=0, le=1, description="Tax rate (0.0 to 1.0)")
    tax_amount: Decimal = Field(..., ge=0, description="Tax amount")
    total_amount: Decimal = Field(..., ge=0, description="Total amount including tax")
    notes: Optional[str] = Field(None, max_length=1000, description="Invoice notes")
    terms: Optional[str] = Field(None, max_length=1000, description="Payment terms")


# Schema for creating an invoice
class InvoiceCreate(InvoiceBase):
    """Schema for creating a new invoice."""
    customer_id: str = Field(..., description="Customer ID this invoice belongs to")
    project_id: Optional[str] = Field(None, description="Related project ID")
    items: List[InvoiceItemCreate] = Field(..., description="Invoice items")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "invoice_number": "INV-2024-001",
                "status": "draft",
                "issue_date": "2024-01-15",
                "due_date": "2024-02-15",
                "subtotal": "1500.00",
                "tax_rate": "0.08",
                "tax_amount": "120.00",
                "total_amount": "1620.00",
                "notes": "Payment due within 30 days",
                "terms": "Net 30",
                "customer_id": "550e8400-e29b-41d4-a716-446655440000",
                "project_id": "550e8400-e29b-41d4-a716-446655440001",
                "items": [
                    {
                        "description": "Web Development Services",
                        "quantity": "10.0",
                        "unit_price": "150.00",
                        "total": "1500.00"
                    }
                ]
            }
        }
    )


# Schema for updating an invoice
class InvoiceUpdate(BaseModel):
    """Schema for updating an existing invoice."""
    invoice_number: Optional[str] = Field(None, min_length=1, max_length=50)
    status: Optional[InvoiceStatus] = None
    issue_date: Optional[date] = None
    due_date: Optional[date] = None
    subtotal: Optional[Decimal] = Field(None, ge=0)
    tax_rate: Optional[Decimal] = Field(None, ge=0, le=1)
    tax_amount: Optional[Decimal] = Field(None, ge=0)
    total_amount: Optional[Decimal] = Field(None, ge=0)
    notes: Optional[str] = Field(None, max_length=1000)
    terms: Optional[str] = Field(None, max_length=1000)
    customer_id: Optional[str] = None
    project_id: Optional[str] = None

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "status": "sent",
                "notes": "Updated payment terms"
            }
        }
    )


# Schema for invoice responses (includes database fields)
class InvoiceResponse(InvoiceBase):
    """Schema for invoice API responses."""
    id: str = Field(..., description="Unique invoice identifier")
    customer_id: str = Field(..., description="Customer ID this invoice belongs to")
    project_id: Optional[str] = Field(None, description="Related project ID")
    tenant_id: str = Field(..., description="Tenant ID")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
    
    # Optional customer details for expanded responses
    customer_name: Optional[str] = Field(None, description="Customer name")
    customer_email: Optional[str] = Field(None, description="Customer email")
    project_name: Optional[str] = Field(None, description="Project name")
    
    # Invoice items
    items: List[InvoiceItemResponse] = Field(default=[], description="Invoice items")

    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "invoice_number": "INV-2024-001",
                "status": "sent",
                "issue_date": "2024-01-15",
                "due_date": "2024-02-15",
                "subtotal": "1500.00",
                "tax_rate": "0.08",
                "tax_amount": "120.00",
                "total_amount": "1620.00",
                "notes": "Payment due within 30 days",
                "terms": "Net 30",
                "customer_id": "550e8400-e29b-41d4-a716-446655440001",
                "project_id": "550e8400-e29b-41d4-a716-446655440002",
                "tenant_id": "550e8400-e29b-41d4-a716-446655440003",
                "created_at": "2024-01-01T00:00:00Z",
                "updated_at": "2024-01-15T12:30:00Z",
                "customer_name": "Acme Corp",
                "customer_email": "contact@acme.com",
                "project_name": "Website Redesign",
                "items": []
            }
        }
    )


# Schema for listing invoices with pagination
class InvoiceList(BaseModel):
    """Schema for paginated invoice list responses."""
    invoices: List[InvoiceResponse] = Field(..., description="List of invoices")
    total: int = Field(..., description="Total number of invoices")
    page: int = Field(..., description="Current page number")
    per_page: int = Field(..., description="Items per page")
    has_next: bool = Field(..., description="Whether there are more pages")
    has_prev: bool = Field(..., description="Whether there are previous pages")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "invoices": [],
                "total": 25,
                "page": 1,
                "per_page": 10,
                "has_next": True,
                "has_prev": False
            }
        }
    )


# Schema for invoice filters
class InvoiceFilters(BaseModel):
    """Schema for filtering invoices."""
    status: Optional[InvoiceStatus] = None
    customer_id: Optional[str] = None
    project_id: Optional[str] = None
    issue_date_from: Optional[date] = None
    issue_date_to: Optional[date] = None
    due_date_from: Optional[date] = None
    due_date_to: Optional[date] = None
    total_min: Optional[Decimal] = Field(None, ge=0)
    total_max: Optional[Decimal] = Field(None, ge=0)
    overdue_only: Optional[bool] = Field(False, description="Show only overdue invoices")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "status": "sent",
                "customer_id": "550e8400-e29b-41d4-a716-446655440000",
                "overdue_only": False
            }
        }
    )


# Schema for invoice summary/statistics
class InvoiceSummary(BaseModel):
    """Schema for invoice summary statistics."""
    total_invoices: int = Field(..., description="Total number of invoices")
    total_amount: Decimal = Field(..., description="Total amount of all invoices")
    paid_amount: Decimal = Field(..., description="Total amount of paid invoices")
    pending_amount: Decimal = Field(..., description="Total amount of pending invoices")
    overdue_amount: Decimal = Field(..., description="Total amount of overdue invoices")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "total_invoices": 25,
                "total_amount": "45000.00",
                "paid_amount": "30000.00", 
                "pending_amount": "10000.00",
                "overdue_amount": "5000.00"
            }
        }
    )
