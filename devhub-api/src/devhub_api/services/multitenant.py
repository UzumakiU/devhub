"""
Multi-Tenant Service Layer for DevHub SaaS Platform
Provides tenant-aware business logic and data access
"""

from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from fastapi import HTTPException, status
import json

from ..models import Tenant, User, Customer, Project, Lead, Invoice
from ..core.config import settings


class TenantService:
    """Service for managing tenants and tenant-aware operations"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_tenant_context(self, user_id: str) -> Dict[str, Any]:
        """Get tenant context for a user"""
        user = self.db.query(User).filter(User.system_id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        context = {
            "user_id": user.system_id,
            "user_role": user.user_role,
            "is_founder": user.is_founder,
            "tenant_id": user.tenant_id,
            "permissions": json.loads(user.permissions) if user.permissions else {}
        }
        
        if user.tenant_id:
            tenant = self.db.query(Tenant).filter(
                Tenant.system_id == user.tenant_id
            ).first()
            if tenant:
                context["tenant_name"] = tenant.business_name
                context["subscription_plan"] = tenant.subscription_plan
        
        return context
    
    def get_accessible_tenants(self, user_id: str) -> List[Tenant]:
        """Get all tenants accessible to a user"""
        user = self.db.query(User).filter(User.system_id == user_id).first()
        if not user:
            return []
        
        if user.is_founder:
            # Platform founder can access all tenants
            return self.db.query(Tenant).filter(Tenant.is_active == True).all()
        else:
            # Regular users can only access their own tenant
            if user.tenant_id:
                tenant = self.db.query(Tenant).filter(
                    Tenant.system_id == user.tenant_id
                ).first()
                return [tenant] if tenant else []
            return []
    
    def create_tenant(self, tenant_data: Dict[str, Any], creator_id: str) -> Tenant:
        """Create a new tenant (platform founder only)"""
        creator = self.db.query(User).filter(User.system_id == creator_id).first()
        if not creator or not creator.is_founder:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only platform founder can create tenants"
            )
        
        # Generate tenant ID
        from ..id_system import IDGenerator
        tenant_id = IDGenerator.generate_id("tenant", self.db)
        
        tenant = Tenant(
            system_id=tenant_id,
            business_name=tenant_data["business_name"],
            business_email=tenant_data["business_email"],
            business_phone=tenant_data.get("business_phone"),
            address_line1=tenant_data.get("address_line1"),
            city=tenant_data.get("city"),
            state=tenant_data.get("state"),
            postal_code=tenant_data.get("postal_code"),
            country=tenant_data.get("country", "US"),
            subscription_plan=tenant_data.get("subscription_plan", "starter"),
            max_users=tenant_data.get("max_users", 5)
        )
        
        self.db.add(tenant)
        self.db.flush()
        
        return tenant
    
    def filter_by_tenant(self, query, model, tenant_context: Dict[str, Any]):
        """Apply tenant filtering to a query"""
        if tenant_context["is_founder"]:
            # Platform founder can see all data
            return query
        elif tenant_context["tenant_id"]:
            # Regular users see only their tenant's data
            return query.filter(model.tenant_id == tenant_context["tenant_id"])
        else:
            # No tenant access
            return query.filter(False)


class MultiTenantCRMService:
    """Tenant-aware CRM service"""
    
    def __init__(self, db: Session):
        self.db = db
        self.tenant_service = TenantService(db)
    
    def get_customers(self, tenant_context: Dict[str, Any], 
                     filters: Optional[Dict[str, Any]] = None) -> List[Customer]:
        """Get customers with tenant filtering"""
        query = self.db.query(Customer)
        query = self.tenant_service.filter_by_tenant(query, Customer, tenant_context)
        
        if filters:
            # Note: Customer model doesn't have status field in current schema
            if filters.get("search"):
                search_term = f"%{filters['search']}%"
                query = query.filter(or_(
                    Customer.company.ilike(search_term),
                    Customer.name.ilike(search_term),  # Use 'name' instead of 'contact_name'
                    Customer.email.ilike(search_term)
                ))
        
        return query.all()
    
    def create_customer(self, customer_data: Dict[str, Any], 
                       tenant_context: Dict[str, Any]) -> Customer:
        """Create a new customer"""
        if not tenant_context["tenant_id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Must belong to a tenant to create customers"
            )
        
        from ..id_system import IDGenerator
        customer_id = IDGenerator.generate_id("customer", self.db)
        
        customer = Customer(
            system_id=customer_id,
            tenant_id=tenant_context["tenant_id"],
            company=customer_data["company"],
            name=customer_data["contact_name"],  # Map contact_name to name field
            email=customer_data["email"],
            phone=customer_data.get("phone"),
            # Note: Customer model doesn't have address or status fields in current schema
        )
        
        self.db.add(customer)
        self.db.flush()
        
        return customer
    
    def get_leads(self, tenant_context: Dict[str, Any], 
                 filters: Optional[Dict[str, Any]] = None) -> List:
        """Get leads with tenant filtering"""
        from ..models import Lead
        
        query = self.db.query(Lead)
        query = self.tenant_service.filter_by_tenant(query, Lead, tenant_context)
        
        if filters:
            if filters.get("stage"):  # Use 'stage' instead of 'status'
                query = query.filter(Lead.stage == filters["stage"])
            if filters.get("source"):
                query = query.filter(Lead.source == filters["source"])
            if filters.get("search"):
                search_term = f"%{filters['search']}%"
                query = query.filter(or_(
                    Lead.company.ilike(search_term),
                    Lead.name.ilike(search_term),  # Use 'name' instead of 'contact_name'
                    Lead.email.ilike(search_term)
                ))
        
        return query.all()
    
    def create_lead(self, lead_data: Dict[str, Any], 
                   tenant_context: Dict[str, Any]):
        """Create a new lead"""
        if not tenant_context["tenant_id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Must belong to a tenant to create leads"
            )
        
        from ..models import Lead
        from ..id_system import IDGenerator
        
        lead_id = IDGenerator.generate_id("lead", self.db)
        
        lead = Lead(
            system_id=lead_id,
            tenant_id=tenant_context["tenant_id"],
            company=lead_data["company"],
            name=lead_data["name"],  # Use 'name' instead of 'contact_name'
            email=lead_data["email"],
            phone=lead_data.get("phone"),
            stage=lead_data.get("stage", "new"),  # Use 'stage' instead of 'status'
            source=lead_data.get("source"),
            job_title=lead_data.get("job_title"),
            assigned_to=lead_data.get("assigned_to")
        )
        
        self.db.add(lead)
        self.db.flush()
        
        return lead
    
    def get_customer_interactions(self, tenant_context: Dict[str, Any], 
                                 customer_id: str) -> List:
        """Get customer interactions with tenant filtering"""
        from ..models import CustomerInteraction
        
        # First verify the customer belongs to the tenant
        customer = self.db.query(Customer).filter(
            and_(
                Customer.system_id == customer_id,
                Customer.tenant_id == tenant_context["tenant_id"]
            )
        ).first()
        
        if not customer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Customer not found or not accessible"
            )
        
        query = self.db.query(CustomerInteraction)
        query = query.filter(CustomerInteraction.customer_id == customer_id)
        
        return query.all()
    
    def create_customer_interaction(self, customer_id: str, 
                                   interaction_data: Dict[str, Any],
                                   tenant_context: Dict[str, Any]):
        """Create a new customer interaction"""
        from ..models import CustomerInteraction
        from ..id_system import IDGenerator
        
        # Verify customer belongs to tenant
        customer = self.db.query(Customer).filter(
            and_(
                Customer.system_id == customer_id,
                Customer.tenant_id == tenant_context["tenant_id"]
            )
        ).first()
        
        if not customer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Customer not found or not accessible"
            )
        
        interaction_id = IDGenerator.generate_id("interaction", self.db)
        
        interaction = CustomerInteraction(
            system_id=interaction_id,
            customer_id=customer_id,
            type=interaction_data["type"],
            notes=interaction_data.get("notes"),
            date=interaction_data.get("date")
        )
        
        self.db.add(interaction)
        self.db.flush()
        
        return interaction


class MultiTenantProjectService:
    """Tenant-aware project service"""
    
    def __init__(self, db: Session):
        self.db = db
        self.tenant_service = TenantService(db)
    
    def get_projects(self, tenant_context: Dict[str, Any],
                    filters: Optional[Dict[str, Any]] = None) -> List[Project]:
        """Get projects with tenant filtering"""
        query = self.db.query(Project)
        query = self.tenant_service.filter_by_tenant(query, Project, tenant_context)
        
        if filters:
            if filters.get("status"):
                query = query.filter(Project.status == filters["status"])
            if filters.get("priority"):
                query = query.filter(Project.priority == filters["priority"])
            if filters.get("customer_id"):
                query = query.filter(Project.customer_id == filters["customer_id"])
        
        return query.all()
    
    def create_project(self, project_data: Dict[str, Any],
                      tenant_context: Dict[str, Any]) -> Project:
        """Create a new project"""
        if not tenant_context["tenant_id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Must belong to a tenant to create projects"
            )
        
        # Validate customer belongs to same tenant
        if project_data.get("customer_id"):
            customer = self.db.query(Customer).filter(
                and_(
                    Customer.system_id == project_data["customer_id"],
                    Customer.tenant_id == tenant_context["tenant_id"]
                )
            ).first()
            if not customer:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Customer not found in your tenant"
                )
        
        from ..id_system import IDGenerator
        project_id = IDGenerator.generate_id("project", self.db)
        
        project = Project(
            system_id=project_id,
            tenant_id=tenant_context["tenant_id"],
            name=project_data["name"],
            description=project_data.get("description"),
            status=project_data.get("status", "PLANNED"),
            priority=project_data.get("priority", "MEDIUM"),
            customer_id=project_data.get("customer_id"),
            creator_id=tenant_context["user_id"],
            budget=project_data.get("budget"),
            estimated_hours=project_data.get("estimated_hours")
        )
        
        self.db.add(project)
        self.db.flush()
        
        return project


class MultiTenantInvoiceService:
    """Tenant-aware invoice service"""
    
    def __init__(self, db: Session):
        self.db = db
        self.tenant_service = TenantService(db)
    
    def get_invoices(self, tenant_context: Dict[str, Any],
                    filters: Optional[Dict[str, Any]] = None) -> List[Invoice]:
        """Get invoices with tenant filtering"""
        query = self.db.query(Invoice)
        query = self.tenant_service.filter_by_tenant(query, Invoice, tenant_context)
        
        if filters:
            if filters.get("status"):
                query = query.filter(Invoice.status == filters["status"])
            if filters.get("customer_id"):
                query = query.filter(Invoice.customer_id == filters["customer_id"])
        
        return query.all()


class AuthorizationService:
    """Handle role-based permissions within tenants"""
    
    @staticmethod
    def can_access_feature(tenant_context: Dict[str, Any], feature: str) -> bool:
        """Check if user can access a feature"""
        if tenant_context["is_founder"]:
            return True
        
        permissions = tenant_context.get("permissions", {})
        
        # Check tenant-wide permissions
        if permissions.get("tenant") == "*":
            return True
        
        # Check specific feature permissions
        feature_permission = permissions.get(feature)
        if feature_permission in ["*", "read", "write", "manage"]:
            return True
        
        # Check role-based defaults
        role = tenant_context.get("user_role", "")
        if role == "BUSINESS_OWNER":
            return True
        elif role == "MANAGER" and feature in ["crm", "projects", "reports"]:
            return True
        elif role == "EMPLOYEE" and feature in ["crm", "projects"]:
            return True
        
        return False
    
    @staticmethod
    def can_manage_users(tenant_context: Dict[str, Any]) -> bool:
        """Check if user can manage other users"""
        if tenant_context["is_founder"]:
            return True
        
        role = tenant_context.get("user_role", "")
        return role in ["BUSINESS_OWNER", "MANAGER"]
    
    @staticmethod
    def can_access_tenant(tenant_context: Dict[str, Any], target_tenant_id: str) -> bool:
        """Check if user can access data from a specific tenant"""
        if tenant_context["is_founder"]:
            return True
        
        return tenant_context.get("tenant_id") == target_tenant_id
