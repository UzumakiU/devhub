"""
CRM API endpoints with tenant isolation
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any, List
from ...database import get_db
from ...services.multitenant import TenantService, MultiTenantCRMService
from ...models import Customer, Lead

router = APIRouter()

# Dependency to get current user context
def get_current_user_context(db: Session = Depends(get_db)):
    """
    Get current user context - placeholder for JWT implementation
    In production, this would decode JWT token and return user info
    """
    # TODO: Replace with real JWT authentication
    # For now, simulate a regular user belonging to TNT-001
    return {
        "user_id": "USR-001",  # Regular user for demo
        "user_role": "USER",
        "is_founder": False,
        "tenant_id": "TNT-001",  # User belongs to demo tenant
        "permissions": {
            "crm": "*",
            "projects": "*"
        }
    }

@router.get("/health")
async def crm_health() -> Dict[str, str]:
    """CRM module health check"""
    return {"status": "healthy", "module": "crm"}

@router.get("/customers")
async def get_customers(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user_context)
) -> List[Dict[str, Any]]:
    """Get customers with tenant filtering"""
    crm_service = MultiTenantCRMService(db)
    customers = crm_service.get_customers(current_user)
    
    return [
        {
            "id": customer.system_id,
            "name": customer.name,
            "email": customer.email,
            "company": customer.company,
            "phone": customer.phone,
            "tenant_id": customer.tenant_id,
            "created_at": customer.created_at
        }
        for customer in customers
    ]

@router.get("/leads")
async def get_leads(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user_context)
) -> List[Dict[str, Any]]:
    """Get leads with tenant filtering"""
    crm_service = MultiTenantCRMService(db)
    leads = crm_service.get_leads(current_user)
    
    return [
        {
            "id": lead.system_id,
            "name": lead.name,
            "email": lead.email,
            "company": lead.company,
            "stage": lead.stage,
            "source": lead.source,
            "tenant_id": lead.tenant_id,
            "created_at": lead.created_at
        }
        for lead in leads
    ]

@router.get("/analytics/dashboard")
async def get_crm_analytics_dashboard(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user_context)
) -> Dict[str, Any]:
    """Get CRM dashboard analytics data with tenant filtering"""
    crm_service = MultiTenantCRMService(db)
    
    # Get tenant-filtered data
    customers = crm_service.get_customers(current_user)
    leads = crm_service.get_leads(current_user)
    
    return {
        "customer_metrics": {
            "total_customers": len(customers),
            "new_customers_this_month": len([c for c in customers if c.created_at and c.created_at.month == 7]),
            "active_customers": len([c for c in customers if c.is_active])
        },
        "lead_metrics": {
            "total_leads": len(leads),
            "qualified_leads": len([l for l in leads if l.qualification_status == "qualified"]),
            "converted_leads": len([l for l in leads if l.converted_to_customer]),
            "conversion_rate": round(len([l for l in leads if l.converted_to_customer]) / len(leads) * 100, 1) if leads else 0
        },
        "interaction_metrics": {
            "total_interactions": 0,
            "interactions_this_week": 0
        },
        "pipeline_stages": {},
        "lead_sources": {},
        "tenant_context": {
            "tenant_id": current_user["tenant_id"],
            "user_role": current_user["user_role"],
            "is_founder": current_user["is_founder"]
        }
    }
