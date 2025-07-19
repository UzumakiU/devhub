"""
Multi-Tenant API Endpoints for DevHub SaaS Platform
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from ...database import get_db
from ...services.multitenant import (
    TenantService, 
    MultiTenantCRMService, 
    MultiTenantProjectService,
    AuthorizationService
)
from ...schemas.tenant import TenantResponse, TenantCreate
from ...schemas.crm import CustomerResponse, CustomerCreate  
from ...schemas.project import ProjectResponse, ProjectCreate

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

# Tenant Management Endpoints
@router.get("/tenants", response_model=List[TenantResponse])
async def list_tenants(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user_context)
):
    """List all accessible tenants"""
    if not current_user["is_founder"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only platform founder can list all tenants"
        )
    
    tenant_service = TenantService(db)
    tenants = tenant_service.get_accessible_tenants(current_user["user_id"])
    
    return [
        TenantResponse(
            id=tenant.system_id,
            business_name=tenant.business_name,
            business_email=tenant.business_email,
            subscription_plan=tenant.subscription_plan,
            is_active=tenant.is_active,
            max_users=tenant.max_users,
            created_at=tenant.created_at
        )
        for tenant in tenants
    ]

@router.post("/tenants", response_model=TenantResponse)
async def create_tenant(
    tenant_data: TenantCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user_context)
):
    """Create a new tenant (platform founder only)"""
    if not current_user["is_founder"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only platform founder can create tenants"
        )
    
    tenant_service = TenantService(db)
    tenant = tenant_service.create_tenant(
        tenant_data.dict(),
        current_user["user_id"]
    )
    
    db.commit()
    db.refresh(tenant)
    
    return TenantResponse(
        id=tenant.system_id,
        business_name=tenant.business_name,
        business_email=tenant.business_email,
        subscription_plan=tenant.subscription_plan,
        is_active=tenant.is_active,
        max_users=tenant.max_users,
        created_at=tenant.created_at
    )

# Multi-Tenant CRM Endpoints
@router.get("/tenants/{tenant_id}/customers", response_model=List[CustomerResponse])
async def list_tenant_customers(
    tenant_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user_context),
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = Query(None)
):
    """List customers for a specific tenant"""
    # Check if user can access this tenant
    if not AuthorizationService.can_access_tenant(current_user, tenant_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this tenant"
        )
    
    # Create tenant context for the target tenant
    tenant_context = current_user.copy()
    if not current_user["is_founder"]:
        tenant_context["tenant_id"] = tenant_id
    
    crm_service = MultiTenantCRMService(db)
    filters = {}
    if status_filter:
        filters["status"] = status_filter
    if search:
        filters["search"] = search
    
    customers = crm_service.get_customers(tenant_context, filters)
    
    return [
        CustomerResponse(
            id=customer.system_id,
            tenant_id=customer.tenant_id,
            company=customer.company,
            name=customer.name,
            email=customer.email,
            phone=customer.phone,
            address_line1=customer.address_line1,
            address_line2=customer.address_line2,
            city=customer.city,
            state=customer.state,
            postal_code=customer.postal_code,
            country=customer.country,
            is_active=customer.is_active,
            created_at=customer.created_at,
            updated_at=customer.updated_at
        )
        for customer in customers
    ]

@router.post("/tenants/{tenant_id}/customers", response_model=CustomerResponse)
async def create_tenant_customer(
    tenant_id: str,
    customer_data: CustomerCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user_context)
):
    """Create a new customer for a specific tenant"""
    # Check if user can access this tenant
    if not AuthorizationService.can_access_tenant(current_user, tenant_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this tenant"
        )
    
    # Create tenant context for the target tenant
    tenant_context = current_user.copy()
    tenant_context["tenant_id"] = tenant_id
    
    crm_service = MultiTenantCRMService(db)
    customer = crm_service.create_customer(
        customer_data.dict(),
        tenant_context
    )
    
    db.commit()
    db.refresh(customer)
    
    return CustomerResponse(
        id=customer.system_id,
        tenant_id=customer.tenant_id,
        company=customer.company,
        name=customer.name,
        email=customer.email,
        phone=customer.phone,
        address_line1=customer.address_line1,
        address_line2=customer.address_line2,
        city=customer.city,
        state=customer.state,
        postal_code=customer.postal_code,
        country=customer.country,
        is_active=customer.is_active,
        created_at=customer.created_at,
        updated_at=customer.updated_at
    )

# Multi-Tenant Project Endpoints
@router.get("/tenants/{tenant_id}/projects", response_model=List[ProjectResponse])
async def list_tenant_projects(
    tenant_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user_context),
    status_filter: Optional[str] = Query(None, alias="status"),
    customer_id: Optional[str] = Query(None)
):
    """List projects for a specific tenant"""
    # Check if user can access this tenant
    if not AuthorizationService.can_access_tenant(current_user, tenant_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this tenant"
        )
    
    # Create tenant context for the target tenant
    tenant_context = current_user.copy()
    if not current_user["is_founder"]:
        tenant_context["tenant_id"] = tenant_id
    
    project_service = MultiTenantProjectService(db)
    filters = {}
    if status_filter:
        filters["status"] = status_filter
    if customer_id:
        filters["customer_id"] = customer_id
    
    projects = project_service.get_projects(tenant_context, filters)
    
    return [
        ProjectResponse(
            id=project.system_id,
            tenant_id=project.tenant_id,
            name=project.name,
            description=project.description,
            status=project.status,
            priority=project.priority,
            customer_id=project.customer_id,
            budget=project.budget,
            created_at=project.created_at
        )
        for project in projects
    ]

@router.post("/tenants/{tenant_id}/projects", response_model=ProjectResponse)
async def create_tenant_project(
    tenant_id: str,
    project_data: ProjectCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user_context)
):
    """Create a new project for a specific tenant"""
    # Check if user can access this tenant
    if not AuthorizationService.can_access_tenant(current_user, tenant_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this tenant"
        )
    
    # Create tenant context for the target tenant
    tenant_context = current_user.copy()
    tenant_context["tenant_id"] = tenant_id
    
    project_service = MultiTenantProjectService(db)
    project = project_service.create_project(
        project_data.dict(),
        tenant_context
    )
    
    db.commit()
    db.refresh(project)
    
    return ProjectResponse(
        id=project.system_id,
        tenant_id=project.tenant_id,
        name=project.name,
        description=project.description,
        status=project.status,
        priority=project.priority,
        customer_id=project.customer_id,
        budget=project.budget,
        created_at=project.created_at
    )

# User Context and Permissions
@router.get("/auth/context")
async def get_user_context(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user_context)
):
    """Get current user context and permissions"""
    tenant_service = TenantService(db)
    
    # Get full context with tenant details
    if current_user["user_id"]:
        context = tenant_service.get_tenant_context(current_user["user_id"])
    else:
        context = current_user
    
    # Add accessible tenants
    accessible_tenants = tenant_service.get_accessible_tenants(
        current_user["user_id"]
    )
    
    context["accessible_tenants"] = [
        {
            "id": tenant.system_id,
            "name": tenant.business_name,
            "subscription_plan": tenant.subscription_plan
        }
        for tenant in accessible_tenants
    ]
    
    return context

# Platform Statistics (Founder only)
@router.get("/platform/stats")
async def get_platform_stats(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user_context)
):
    """Get platform-wide statistics (founder only)"""
    if not current_user["is_founder"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only platform founder can view platform statistics"
        )
    
    from ...models import Tenant, User, Customer, Project
    
    stats = {
        "total_tenants": db.query(Tenant).count(),
        "active_tenants": db.query(Tenant).filter(Tenant.is_active == True).count(),
        "total_users": db.query(User).filter(User.is_founder == False).count(),
        "total_customers": db.query(Customer).count(),
        "total_projects": db.query(Project).count()
    }
    
    return stats


# CRM Analytics Endpoints
@router.get("/tenants/{tenant_id}/crm/analytics", response_model=dict)
async def get_tenant_crm_analytics(
    tenant_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user_context)
):
    """Get CRM analytics for a specific tenant"""
    # Validate tenant access
    tenant_context = current_user.copy()
    if not current_user["is_founder"]:
        tenant_context["tenant_id"] = tenant_id
    
    crm_service = MultiTenantCRMService(db)
    
    # Get analytics data
    from ...models import Customer, Lead, Project
    
    # Customer metrics
    customers = crm_service.get_customers(tenant_context, {})
    total_customers = len(customers)
    active_customers = len([c for c in customers if c.is_active])
    
    # Lead metrics  
    leads = crm_service.get_leads(tenant_context, {})
    total_leads = len(leads)
    qualified_leads = len([l for l in leads if l.qualification_status == 'qualified'])
    converted_leads = len([l for l in leads if l.converted_to_customer == True])
    conversion_rate = (converted_leads / total_leads * 100) if total_leads > 0 else 0
    
    # Project metrics
    project_service = MultiTenantProjectService(db)
    projects = project_service.get_projects(tenant_context, {})
    total_projects = len(projects)
    
    return {
        "customer_metrics": {
            "total_customers": total_customers,
            "active_customers": active_customers,
            "new_customers_this_month": 0  # TODO: Calculate from created_at
        },
        "lead_metrics": {
            "total_leads": total_leads,
            "qualified_leads": qualified_leads,
            "converted_leads": converted_leads,
            "conversion_rate": round(conversion_rate, 2)
        },
        "project_metrics": {
            "total_projects": total_projects,
            "active_projects": len([p for p in projects if p.status == 'active'])
        }
    }


# Lead Management Endpoints
@router.get("/tenants/{tenant_id}/leads", response_model=List[dict])
async def list_tenant_leads(
    tenant_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user_context),
    status_filter: Optional[str] = Query(None, alias="status"),
    source_filter: Optional[str] = Query(None, alias="source")
):
    """List leads for a specific tenant"""
    # Validate tenant access
    tenant_context = current_user.copy()
    if not current_user["is_founder"]:
        tenant_context["tenant_id"] = tenant_id
    
    crm_service = MultiTenantCRMService(db)
    filters = {}
    if status_filter:
        filters["status"] = status_filter
    if source_filter:
        filters["source"] = source_filter
    
    leads = crm_service.get_leads(tenant_context, filters)
    
    return [
        {
            "id": lead.system_id,
            "tenant_id": lead.tenant_id,
            "company": lead.company,
            "name": lead.name,  # Use 'name' instead of 'contact_name'
            "email": lead.email,
            "phone": lead.phone,
            "stage": lead.stage,  # Use 'stage' instead of 'status'
            "source": lead.source,
            "job_title": lead.job_title,
            "assigned_to": lead.assigned_to,
            "qualification_status": lead.qualification_status,
            "converted_to_customer": lead.converted_to_customer,
            "created_at": lead.created_at,
            "updated_at": lead.updated_at
        }
        for lead in leads
    ]


@router.post("/tenants/{tenant_id}/leads", response_model=dict)
async def create_tenant_lead(
    tenant_id: str,
    lead_data: dict,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user_context)
):
    """Create a new lead for a specific tenant"""
    # Validate tenant access
    tenant_context = current_user.copy()
    if not current_user["is_founder"]:
        tenant_context["tenant_id"] = tenant_id
    
    crm_service = MultiTenantCRMService(db)
    lead = crm_service.create_lead(
        lead_data,
        tenant_context
    )
    
    db.commit()
    db.refresh(lead)
    
    return {
        "id": lead.system_id,
        "tenant_id": lead.tenant_id,
        "company": lead.company,
        "name": lead.name,  # Use 'name' instead of 'contact_name'
        "email": lead.email,
        "phone": lead.phone,
        "stage": lead.stage,  # Use 'stage' instead of 'status'
        "source": lead.source,
        "job_title": lead.job_title,
        "assigned_to": lead.assigned_to,
        "qualification_status": lead.qualification_status,
        "converted_to_customer": lead.converted_to_customer,
        "created_at": lead.created_at,
        "updated_at": lead.updated_at
    }


# Customer Interactions Endpoints
@router.get("/tenants/{tenant_id}/customers/{customer_id}/interactions", response_model=List[dict])
async def list_customer_interactions(
    tenant_id: str,
    customer_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user_context)
):
    """List interactions for a specific customer"""
    # Validate tenant access
    tenant_context = current_user.copy()
    if not current_user["is_founder"]:
        tenant_context["tenant_id"] = tenant_id
    
    crm_service = MultiTenantCRMService(db)
    interactions = crm_service.get_customer_interactions(tenant_context, customer_id)
    
    return [
        {
            "id": interaction.system_id,
            "customer_id": interaction.customer_id,
            "type": interaction.type,
            "notes": interaction.notes,
            "date": interaction.date,
            "created_at": interaction.created_at,
            "updated_at": interaction.updated_at
        }
        for interaction in interactions
    ]


@router.post("/tenants/{tenant_id}/customers/{customer_id}/interactions", response_model=dict)
async def create_customer_interaction(
    tenant_id: str,
    customer_id: str,
    interaction_data: dict,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user_context)
):
    """Create a new interaction for a specific customer"""
    # Validate tenant access
    tenant_context = current_user.copy()
    if not current_user["is_founder"]:
        tenant_context["tenant_id"] = tenant_id
    
    crm_service = MultiTenantCRMService(db)
    interaction = crm_service.create_customer_interaction(
        customer_id,
        interaction_data,
        tenant_context
    )
    
    db.commit()
    db.refresh(interaction)
    
    return {
        "id": interaction.system_id,
        "customer_id": interaction.customer_id,
        "type": interaction.type,
        "notes": interaction.notes,
        "date": interaction.date,
        "created_at": interaction.created_at,
        "updated_at": interaction.updated_at
    }
