"""
Database Management and Validation System
Provides CRUD operations, relationship validation, and error detection
"""
from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text, inspect, func
from typing import Dict, List, Any, Optional
import re
from .models import (
    User, Project, Customer, Invoice, ProjectAssignment, ProjectCustomer,
    Tenant, Lead, CustomerInteraction, LeadInteraction, CustomerNote, PasswordVault
)
from .id_system import IDGenerator


class DatabaseValidator:
    """Validates database integrity and relationships"""
    
    @staticmethod
    def validate_schema(db: Session) -> Dict[str, Any]:
        """Comprehensive database validation"""
        issues = {
            "errors": [],
            "warnings": [],
            "suggestions": [],
            "relationship_issues": [],
            "id_system_issues": []
        }
        
        # Check ID system consistency
        issues.update(DatabaseValidator._validate_id_system(db))
        
        # Check relationships
        issues.update(DatabaseValidator._validate_relationships(db))
        
        # Check required columns
        issues.update(DatabaseValidator._validate_required_columns(db))
        
        # Check data consistency
        issues.update(DatabaseValidator._validate_data_consistency(db))
        
        return issues
    
    @staticmethod
    def _validate_id_system(db: Session) -> Dict[str, List[str]]:
        """Validate ID system consistency"""
        issues = {"id_system_issues": []}
        
        # Check for missing or invalid system_ids
        models = [
            (User, "USR"),
            (Project, "PRJ"),
            (Customer, "CUS"),
            (Invoice, "INV")
        ]
        
        for model, prefix in models:
            # Check for records with null system_id
            null_count = db.query(model).filter(model.system_id.is_(None)).count()
            if null_count > 0:
                issues["id_system_issues"].append(
                    f"{model.__tablename__}: {null_count} records have null system_id"
                )
            
            # Check for invalid ID format
            invalid_ids = db.query(model).filter(
                ~model.system_id.like(f"{prefix}-%")
            ).all()
            
            for record in invalid_ids:
                if record.system_id:
                    issues["id_system_issues"].append(
                        f"{model.__tablename__}: Invalid ID format '{record.system_id}' (should be {prefix}-###)"
                    )
        
        # Check for duplicate system_ids
        for model, prefix in models:
            duplicates = db.query(model.system_id, func.count(model.system_id)).group_by(
                model.system_id
            ).having(func.count(model.system_id) > 1).all()
            
            for system_id, count in duplicates:
                issues["id_system_issues"].append(
                    f"{model.__tablename__}: Duplicate system_id '{system_id}' ({count} records)"
                )
        
        return issues
    
    @staticmethod
    def _validate_relationships(db: Session) -> Dict[str, List[str]]:
        """Validate foreign key relationships"""
        issues = {"relationship_issues": []}
        
        # Check orphaned projects (owner doesn't exist)
        orphaned_projects = db.query(Project).filter(
            ~Project.owner_id.in_(db.query(User.system_id))
        ).all()
        
        for project in orphaned_projects:
            issues["relationship_issues"].append(
                f"Project '{project.name}' ({project.system_id}) has invalid owner_id: {project.owner_id}"
            )
        
        # Check orphaned invoices (customer doesn't exist)
        orphaned_invoices = db.query(Invoice).filter(
            ~Invoice.customer_id.in_(db.query(Customer.system_id))
        ).all()
        
        for invoice in orphaned_invoices:
            issues["relationship_issues"].append(
                f"Invoice {invoice.system_id} has invalid customer_id: {invoice.customer_id}"
            )
        
        # Check orphaned project assignments
        orphaned_assignments = db.query(ProjectAssignment).filter(
            ~ProjectAssignment.user_id.in_(db.query(User.system_id))
        ).all()
        
        for assignment in orphaned_assignments:
            issues["relationship_issues"].append(
                f"Project assignment has invalid user_id: {assignment.user_id}"
            )
        
        return issues
    
    @staticmethod
    def _validate_required_columns(db: Session) -> Dict[str, List[str]]:
        """Check for missing required data"""
        issues = {"warnings": []}
        
        # Check for users without email
        users_no_email = db.query(User).filter(User.email.is_(None)).count()
        if users_no_email > 0:
            issues["warnings"].append(f"{users_no_email} users have no email address")
        
        # Check for projects without names
        projects_no_name = db.query(Project).filter(Project.name.is_(None)).count()
        if projects_no_name > 0:
            issues["warnings"].append(f"{projects_no_name} projects have no name")
        
        # Check for customers without names
        customers_no_name = db.query(Customer).filter(Customer.name.is_(None)).count()
        if customers_no_name > 0:
            issues["warnings"].append(f"{customers_no_name} customers have no name")
        
        return issues
    
    @staticmethod
    def _validate_data_consistency(db: Session) -> Dict[str, List[str]]:
        """Check for data consistency issues"""
        issues = {"suggestions": []}
        
        # Check for inactive users with active projects
        inactive_users_with_projects = db.query(User).filter(
            User.is_active == False,
            User.system_id.in_(db.query(Project.owner_id))
        ).count()
        
        if inactive_users_with_projects > 0:
            issues["suggestions"].append(
                f"{inactive_users_with_projects} inactive users still own active projects"
            )
        
        # Check for projects without due dates
        projects_no_due_date = db.query(Project).filter(
            Project.due_date.is_(None),
            Project.status != "completed"
        ).count()
        
        if projects_no_due_date > 0:
            issues["suggestions"].append(
                f"{projects_no_due_date} active projects have no due date"
            )
        
        return issues


class DatabaseManager:
    """Manages database operations and modifications"""
    
    @staticmethod
    def create_record(db: Session, table_name: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new record in the specified table"""
        try:
            if table_name == "users":
                # Generate system_id
                system_id = IDGenerator.generate_id("user", db)
                display_id = system_id  # Same unless founder
                
                user = User(
                    system_id=system_id,
                    display_id=display_id,
                    email=data.get("email"),
                    full_name=data.get("full_name"),
                    hashed_password=data.get("hashed_password", "temp_password"),
                    is_active=data.get("is_active", True),
                    is_founder=data.get("is_founder", False)
                )
                
                db.add(user)
                db.commit()
                db.refresh(user)
                
                return {
                    "success": True,
                    "record": {
                        "system_id": user.system_id,
                        "display_id": user.display_id,
                        "email": user.email,
                        "full_name": user.full_name,
                        "is_active": user.is_active,
                        "is_founder": user.is_founder
                    }
                }
            
            elif table_name == "projects":
                system_id = IDGenerator.generate_id("project", db)
                
                project = Project(
                    system_id=system_id,
                    name=data.get("name"),
                    description=data.get("description"),
                    status=data.get("status", "active"),
                    owner_id=data.get("owner_id")
                )
                
                db.add(project)
                db.commit()
                db.refresh(project)
                
                return {
                    "success": True,
                    "record": {
                        "system_id": project.system_id,
                        "name": project.name,
                        "description": project.description,
                        "status": project.status,
                        "owner_id": project.owner_id
                    }
                }
            
            elif table_name == "customers":
                system_id = IDGenerator.generate_id("customer", db)
                
                customer = Customer(
                    system_id=system_id,
                    name=data.get("name"),
                    email=data.get("email"),
                    phone=data.get("phone"),
                    company=data.get("company"),
                    is_active=data.get("is_active", True)
                )
                
                db.add(customer)
                db.commit()
                db.refresh(customer)
                
                return {
                    "success": True,
                    "record": {
                        "system_id": customer.system_id,
                        "name": customer.name,
                        "email": customer.email,
                        "phone": customer.phone,
                        "company": customer.company,
                        "is_active": customer.is_active
                    }
                }
            
            elif table_name == "leads":
                from .models import Lead
                system_id = IDGenerator.generate_id("lead", db)
                
                lead = Lead(
                    system_id=system_id,
                    name=data.get("name"),
                    email=data.get("email"),
                    phone=data.get("phone"),
                    company=data.get("company"),
                    job_title=data.get("job_title"),
                    source=data.get("source", "unknown"),
                    lead_score=data.get("lead_score", 0),
                    qualification_status=data.get("qualification_status", "new"),
                    stage=data.get("stage", "prospect"),
                    estimated_value=data.get("estimated_value"),
                    probability=data.get("probability", 10),
                    assigned_to=data.get("assigned_to"),
                    address_line1=data.get("address_line1"),
                    address_line2=data.get("address_line2"),
                    city=data.get("city"),
                    state=data.get("state"),
                    postal_code=data.get("postal_code"),
                    country=data.get("country", "US"),
                    is_active=data.get("is_active", True)
                )
                
                db.add(lead)
                db.commit()
                db.refresh(lead)
                
                return {
                    "success": True,
                    "record": {
                        "system_id": lead.system_id,
                        "name": lead.name,
                        "email": lead.email,
                        "company": lead.company,
                        "stage": lead.stage,
                        "qualification_status": lead.qualification_status,
                        "lead_score": lead.lead_score
                    }
                }
            
            elif table_name == "customer_interactions":
                from .models import CustomerInteraction
                system_id = IDGenerator.generate_id("customer_interaction", db)
                
                interaction = CustomerInteraction(
                    system_id=system_id,
                    customer_id=data.get("customer_id"),
                    user_id=data.get("user_id"),
                    interaction_type=data.get("interaction_type", "note"),
                    subject=data.get("subject", ""),
                    description=data.get("description", ""),
                    outcome=data.get("outcome", ""),
                    priority=data.get("priority", "medium"),
                    status=data.get("status", "completed"),
                    is_billable=data.get("is_billable", False),
                    billable_hours=data.get("billable_hours"),
                    completed_at=data.get("completed_at")
                )
                
                db.add(interaction)
                db.commit()
                db.refresh(interaction)
                
                return {
                    "success": True,
                    "record": {
                        "system_id": interaction.system_id,
                        "customer_id": interaction.customer_id,
                        "interaction_type": interaction.interaction_type,
                        "subject": interaction.subject,
                        "status": interaction.status
                    }
                }
            
            else:
                raise ValueError(f"Unsupported table: {table_name}")
                
        except Exception as e:
            db.rollback()
            return {
                "success": False,
                "error": str(e)
            }
    
    @staticmethod
    def update_record(db: Session, table_name: str, system_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Update an existing record"""
        try:
            if table_name == "users":
                user = db.query(User).filter(User.system_id == system_id).first()
                if not user:
                    raise ValueError(f"User {system_id} not found")
                
                # Update fields
                for key, value in data.items():
                    if hasattr(user, key) and key != "system_id":  # Don't allow system_id changes
                        setattr(user, key, value)
                
                db.commit()
                db.refresh(user)
                
                return {"success": True, "message": f"User {system_id} updated"}
            
            elif table_name == "projects":
                project = db.query(Project).filter(Project.system_id == system_id).first()
                if not project:
                    raise ValueError(f"Project {system_id} not found")
                
                for key, value in data.items():
                    if hasattr(project, key) and key != "system_id":
                        setattr(project, key, value)
                
                db.commit()
                db.refresh(project)
                
                return {"success": True, "message": f"Project {system_id} updated"}
            
            elif table_name == "customers":
                customer = db.query(Customer).filter(Customer.system_id == system_id).first()
                if not customer:
                    raise ValueError(f"Customer {system_id} not found")
                
                for key, value in data.items():
                    if hasattr(customer, key) and key != "system_id":
                        setattr(customer, key, value)
                
                db.commit()
                db.refresh(customer)
                
                return {"success": True, "message": f"Customer {system_id} updated"}
            
            else:
                raise ValueError(f"Unsupported table: {table_name}")
                
        except Exception as e:
            db.rollback()
            return {"success": False, "error": str(e)}
    
    @staticmethod
    def delete_record(db: Session, table_name: str, system_id: str) -> Dict[str, Any]:
        """Delete a record"""
        try:
            if table_name == "users":
                user = db.query(User).filter(User.system_id == system_id).first()
                if not user:
                    raise ValueError(f"User {system_id} not found")
                
                # Check if user owns projects
                owned_projects = db.query(Project).filter(Project.owner_id == system_id).count()
                if owned_projects > 0:
                    raise ValueError(f"Cannot delete user {system_id}: owns {owned_projects} projects")
                
                db.delete(user)
                db.commit()
                
                return {"success": True, "message": f"User {system_id} deleted"}
            
            elif table_name == "projects":
                project = db.query(Project).filter(Project.system_id == system_id).first()
                if not project:
                    raise ValueError(f"Project {system_id} not found")
                
                # Delete related assignments first
                db.query(ProjectAssignment).filter(ProjectAssignment.project_id == system_id).delete()
                db.query(ProjectCustomer).filter(ProjectCustomer.project_id == system_id).delete()
                
                db.delete(project)
                db.commit()
                
                return {"success": True, "message": f"Project {system_id} deleted"}
            
            elif table_name == "customers":
                customer = db.query(Customer).filter(Customer.system_id == system_id).first()
                if not customer:
                    raise ValueError(f"Customer {system_id} not found")
                
                # Check if customer has invoices
                invoices = db.query(Invoice).filter(Invoice.customer_id == system_id).count()
                if invoices > 0:
                    raise ValueError(f"Cannot delete customer {system_id}: has {invoices} invoices")
                
                db.delete(customer)
                db.commit()
                
                return {"success": True, "message": f"Customer {system_id} deleted"}
            
            else:
                raise ValueError(f"Unsupported table: {table_name}")
                
        except Exception as e:
            db.rollback()
            return {"success": False, "error": str(e)}
    
    @staticmethod
    def get_table_data(db: Session, table_name: str, limit: int = 100) -> Dict[str, Any]:
        """Get paginated table data"""
        try:
            if table_name == "users":
                users = db.query(User).limit(limit).all()
                return {
                    "success": True,
                    "data": [
                        {
                            "system_id": user.system_id,
                            "display_id": user.display_id,
                            "email": user.email,
                            "full_name": user.full_name,
                            "is_active": user.is_active,
                            "is_founder": user.is_founder,
                            "created_at": user.created_at.isoformat() if user.created_at else None
                        }
                        for user in users
                    ]
                }
            
            elif table_name == "projects":
                projects = db.query(Project).limit(limit).all()
                return {
                    "success": True,
                    "data": [
                        {
                            "system_id": project.system_id,
                            "name": project.name,
                            "description": project.description,
                            "status": project.status,
                            "owner_id": project.owner_id,
                            "created_at": project.created_at.isoformat() if project.created_at else None
                        }
                        for project in projects
                    ]
                }
            
            elif table_name == "customers":
                customers = db.query(Customer).limit(limit).all()
                return {
                    "success": True,
                    "data": [
                        {
                            "system_id": customer.system_id,
                            "name": customer.name,
                            "email": customer.email,
                            "phone": customer.phone,
                            "company": customer.company,
                            "is_active": customer.is_active,
                            "created_at": customer.created_at.isoformat() if customer.created_at else None
                        }
                        for customer in customers
                    ]
                }
            
            elif table_name == "invoices":
                invoices = db.query(Invoice).limit(limit).all()
                return {
                    "success": True,
                    "data": [
                        {
                            "system_id": invoice.system_id,
                            "invoice_number": invoice.invoice_number,
                            "customer_id": invoice.customer_id,
                            "project_id": invoice.project_id,
                            "amount": float(invoice.amount) if invoice.amount else None,
                            "status": invoice.status,
                            "due_date": invoice.due_date.isoformat() if invoice.due_date else None,
                            "created_at": invoice.created_at.isoformat() if invoice.created_at else None
                        }
                        for invoice in invoices
                    ]
                }
            
            elif table_name == "tenants":
                tenants = db.query(Tenant).limit(limit).all()
                return {
                    "success": True,
                    "data": [
                        {
                            "system_id": tenant.system_id,
                            "business_name": tenant.business_name,
                            "business_email": tenant.business_email,
                            "business_phone": tenant.business_phone,
                            "subscription_plan": tenant.subscription_plan,
                            "is_active": tenant.is_active,
                            "max_users": tenant.max_users,
                            "city": tenant.city,
                            "state": tenant.state,
                            "country": tenant.country,
                            "created_at": tenant.created_at.isoformat() if tenant.created_at else None
                        }
                        for tenant in tenants
                    ]
                }
            
            elif table_name == "leads":
                leads = db.query(Lead).limit(limit).all()
                return {
                    "success": True,
                    "data": [
                        {
                            "system_id": lead.system_id,
                            "name": lead.name,
                            "email": lead.email,
                            "phone": lead.phone,
                            "company": lead.company,
                            "job_title": lead.job_title,
                            "source": lead.source,
                            "lead_score": lead.lead_score,
                            "qualification_status": lead.qualification_status,
                            "stage": lead.stage,
                            "estimated_value": float(lead.estimated_value) if lead.estimated_value else None,
                            "probability": lead.probability,
                            "assigned_to": lead.assigned_to,
                            "is_active": lead.is_active,
                            "created_at": lead.created_at.isoformat() if lead.created_at else None
                        }
                        for lead in leads
                    ]
                }
            
            elif table_name == "customer_interactions":
                interactions = db.query(CustomerInteraction).limit(limit).all()
                return {
                    "success": True,
                    "data": [
                        {
                            "system_id": interaction.system_id,
                            "customer_id": interaction.customer_id,
                            "user_id": interaction.user_id,
                            "interaction_type": interaction.interaction_type,
                            "subject": interaction.subject,
                            "description": interaction.description,
                            "outcome": interaction.outcome,
                            "priority": interaction.priority,
                            "status": interaction.status,
                            "is_billable": interaction.is_billable,
                            "billable_hours": float(interaction.billable_hours) if interaction.billable_hours else None,
                            "created_at": interaction.created_at.isoformat() if interaction.created_at else None,
                            "completed_at": interaction.completed_at.isoformat() if interaction.completed_at else None
                        }
                        for interaction in interactions
                    ]
                }
            
            elif table_name == "lead_interactions":
                interactions = db.query(LeadInteraction).limit(limit).all()
                return {
                    "success": True,
                    "data": [
                        {
                            "system_id": interaction.system_id,
                            "lead_id": interaction.lead_id,
                            "user_id": interaction.user_id,
                            "interaction_type": interaction.interaction_type,
                            "subject": interaction.subject,
                            "description": interaction.description,
                            "outcome": interaction.outcome,
                            "priority": interaction.priority,
                            "status": interaction.status,
                            "created_at": interaction.created_at.isoformat() if interaction.created_at else None,
                            "completed_at": interaction.completed_at.isoformat() if interaction.completed_at else None
                        }
                        for interaction in interactions
                    ]
                }
            
            elif table_name == "customer_notes":
                notes = db.query(CustomerNote).limit(limit).all()
                return {
                    "success": True,
                    "data": [
                        {
                            "system_id": note.system_id,
                            "customer_id": note.customer_id,
                            "user_id": note.user_id,
                            "note_type": note.note_type,
                            "title": note.title,
                            "content": note.content,
                            "is_private": note.is_private,
                            "priority": note.priority,
                            "created_at": note.created_at.isoformat() if note.created_at else None
                        }
                        for note in notes
                    ]
                }
            
            elif table_name == "project_assignments":
                project_assignments = db.query(ProjectAssignment).limit(limit).all()
                return {
                    "success": True,
                    "data": [
                        {
                            "id": assignment.id,
                            "project_id": assignment.project_id,
                            "user_id": assignment.user_id,
                            "role": assignment.role,
                            "assigned_at": assignment.assigned_at.isoformat() if assignment.assigned_at else None
                        }
                        for assignment in project_assignments
                    ]
                }
            
            elif table_name == "project_customers":
                project_customers = db.query(ProjectCustomer).limit(limit).all()
                return {
                    "success": True,
                    "data": [
                        {
                            "id": pc.id,
                            "project_id": pc.project_id,
                            "customer_id": pc.customer_id,
                            "assigned_at": pc.assigned_at.isoformat() if pc.assigned_at else None
                        }
                        for pc in project_customers
                    ]
                }
            
            elif table_name == "password_vault":
                vault_entries = db.query(PasswordVault).limit(limit).all()
                return {
                    "success": True,
                    "data": [
                        {
                            "id": entry.id,
                            "user_system_id": entry.user_system_id,
                            "vault_access_code": entry.vault_access_code,
                            "created_by": entry.created_by,
                            "created_at": entry.created_at.isoformat() if entry.created_at else None,
                            "updated_at": entry.updated_at.isoformat() if entry.updated_at else None
                        }
                        for entry in vault_entries
                    ]
                }
            
            else:
                raise ValueError(f"Unsupported table: {table_name}")
                
        except Exception as e:
            return {"success": False, "error": str(e)}
