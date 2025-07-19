"""
Tenant-related Pydantic schemas for DevHub SaaS Platform
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class TenantBase(BaseModel):
    business_name: str = Field(..., description="Business name")
    business_email: str = Field(..., description="Business email")
    business_phone: Optional[str] = Field(None, description="Business phone")
    address_line1: Optional[str] = Field(None, description="Address line 1")
    address_line2: Optional[str] = Field(None, description="Address line 2")
    city: Optional[str] = Field(None, description="City")
    state: Optional[str] = Field(None, description="State")
    postal_code: Optional[str] = Field(None, description="Postal code")
    country: Optional[str] = Field("US", description="Country")
    subscription_plan: Optional[str] = Field("starter", description="Subscription plan")
    max_users: Optional[int] = Field(5, description="Maximum users")

class TenantCreate(TenantBase):
    """Schema for creating a new tenant"""
    pass

class TenantUpdate(BaseModel):
    """Schema for updating a tenant"""
    business_name: Optional[str] = None
    business_email: Optional[str] = None
    business_phone: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    subscription_plan: Optional[str] = None
    max_users: Optional[int] = None
    is_active: Optional[bool] = None

class TenantResponse(TenantBase):
    """Schema for tenant responses"""
    id: str = Field(..., description="Tenant system ID")
    is_active: bool = Field(..., description="Is tenant active")
    created_at: datetime = Field(..., description="Creation timestamp")
    
    class Config:
        from_attributes = True

class TenantSummary(BaseModel):
    """Schema for tenant summary (for lists)"""
    id: str = Field(..., description="Tenant system ID")
    business_name: str = Field(..., description="Business name")
    subscription_plan: str = Field(..., description="Subscription plan")
    is_active: bool = Field(..., description="Is tenant active")
    user_count: Optional[int] = Field(None, description="Number of users")
    customer_count: Optional[int] = Field(None, description="Number of customers")
    project_count: Optional[int] = Field(None, description="Number of projects")
    
    class Config:
        from_attributes = True
