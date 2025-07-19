"""
CRM-related Pydantic schemas for DevHub SaaS Platform
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class CustomerBase(BaseModel):
    company: str = Field(..., description="Company name")
    name: str = Field(..., description="Contact person name")
    email: str = Field(..., description="Email address")
    phone: Optional[str] = Field(None, description="Phone number")
    address_line1: Optional[str] = Field(None, description="Address line 1")
    address_line2: Optional[str] = Field(None, description="Address line 2")
    city: Optional[str] = Field(None, description="City")
    state: Optional[str] = Field(None, description="State")
    postal_code: Optional[str] = Field(None, description="Postal code")
    country: Optional[str] = Field(None, description="Country")
    is_active: Optional[bool] = Field(True, description="Customer status")

class CustomerCreate(CustomerBase):
    """Schema for creating a new customer"""
    pass

class CustomerUpdate(BaseModel):
    """Schema for updating a customer"""
    company: Optional[str] = None
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    is_active: Optional[bool] = None

class CustomerResponse(CustomerBase):
    """Schema for customer responses"""
    id: str = Field(..., description="Customer system ID")
    tenant_id: str = Field(..., description="Tenant system ID")
    created_at: Optional[datetime] = Field(None, description="Creation timestamp")
    updated_at: Optional[datetime] = Field(None, description="Last update timestamp")
    
    class Config:
        from_attributes = True

class CustomerSummary(BaseModel):
    """Schema for customer summary (for lists)"""
    id: str = Field(..., description="Customer system ID")
    company: str = Field(..., description="Company name")
    name: str = Field(..., description="Contact person name")
    email: str = Field(..., description="Email address")
    is_active: bool = Field(..., description="Customer status")
    
    class Config:
        from_attributes = True

# Lead schemas
class LeadBase(BaseModel):
    company: str = Field(..., description="Company name")
    contact_name: str = Field(..., description="Contact person name")
    email: str = Field(..., description="Email address")
    phone: Optional[str] = Field(None, description="Phone number")
    status: Optional[str] = Field("new", description="Lead status")
    source: Optional[str] = Field(None, description="Lead source")
    notes: Optional[str] = Field(None, description="Notes")

class LeadCreate(LeadBase):
    """Schema for creating a new lead"""
    pass

class LeadUpdate(BaseModel):
    """Schema for updating a lead"""
    company: Optional[str] = None
    contact_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    status: Optional[str] = None
    source: Optional[str] = None
    notes: Optional[str] = None

class LeadResponse(LeadBase):
    """Schema for lead responses"""
    id: str = Field(..., description="Lead system ID")
    tenant_id: str = Field(..., description="Tenant system ID")
    assigned_to: Optional[str] = Field(None, description="Assigned user ID")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
    
    class Config:
        from_attributes = True
