#!/usr/bin/env python3
"""
Add sample data to the database for testing the database management page
"""
import asyncio
from sqlalchemy.orm import Session
from src.devhub_api.database import engine, SessionLocal
from src.devhub_api.models import *
from datetime import datetime, timezone

def add_sample_data():
    """Add sample data to the database"""
    db = SessionLocal()
    
    try:
        # Check if we already have sample data
        existing_customers = db.query(Customer).count()
        if existing_customers > 0:
            print("Sample data already exists. Skipping...")
            return
        
        # Create a tenant
        tenant = Tenant(
            name="DevHub Demo",
            domain="demo.devhub.com",
            is_active=True
        )
        db.add(tenant)
        db.flush()  # Get the ID
        
        # Create some customers
        customers_data = [
            {
                "name": "Acme Corporation",
                "email": "contact@acme.com",
                "phone": "+1-555-0101",
                "company": "Acme Corporation",
                "address": "123 Business Ave, New York, NY 10001",
                "status": CustomerStatus.ACTIVE
            },
            {
                "name": "Tech Innovators Inc",
                "email": "hello@techinnovators.com",
                "phone": "+1-555-0102",
                "company": "Tech Innovators Inc",
                "address": "456 Innovation Drive, San Francisco, CA 94102",
                "status": CustomerStatus.ACTIVE
            },
            {
                "name": "Global Solutions Ltd",
                "email": "info@globalsolutions.com",
                "phone": "+1-555-0103",
                "company": "Global Solutions Ltd",
                "address": "789 Enterprise Blvd, Austin, TX 73301",
                "status": CustomerStatus.ACTIVE
            }
        ]
        
        customers = []
        for customer_data in customers_data:
            customer = Customer(
                tenant_id=tenant.id,
                **customer_data
            )
            customers.append(customer)
            db.add(customer)
        
        # Create some leads
        leads_data = [
            {
                "name": "StartupXYZ",
                "email": "founder@startupxyz.com",
                "phone": "+1-555-0201",
                "company": "StartupXYZ",
                "status": LeadStatus.NEW,
                "source": "Website"
            },
            {
                "name": "Enterprise Corp",
                "email": "procurement@enterprise.com",
                "phone": "+1-555-0202",
                "company": "Enterprise Corp",
                "status": LeadStatus.QUALIFIED,
                "source": "Referral"
            }
        ]
        
        leads = []
        for lead_data in leads_data:
            lead = Lead(
                tenant_id=tenant.id,
                **lead_data
            )
            leads.append(lead)
            db.add(lead)
        
        # Create some projects
        db.flush()  # Get customer IDs
        
        projects_data = [
            {
                "name": "Website Redesign",
                "description": "Complete redesign of company website with modern UI/UX",
                "status": ProjectStatus.IN_PROGRESS,
                "priority": ProjectPriority.HIGH,
                "budget": 25000.00,
                "start_date": datetime.now(timezone.utc),
                "customer_id": customers[0].id
            },
            {
                "name": "Mobile App Development",
                "description": "Native iOS and Android app development",
                "status": ProjectStatus.PLANNING,
                "priority": ProjectPriority.MEDIUM,
                "budget": 50000.00,
                "start_date": datetime.now(timezone.utc),
                "customer_id": customers[1].id
            },
            {
                "name": "Data Migration",
                "description": "Migrate legacy data to new cloud infrastructure",
                "status": ProjectStatus.COMPLETED,
                "priority": ProjectPriority.LOW,
                "budget": 15000.00,
                "start_date": datetime.now(timezone.utc),
                "customer_id": customers[2].id
            }
        ]
        
        projects = []
        for project_data in projects_data:
            project = Project(
                tenant_id=tenant.id,
                **project_data
            )
            projects.append(project)
            db.add(project)
        
        # Create some invoices
        db.flush()  # Get project IDs
        
        invoices_data = [
            {
                "invoice_number": "INV-2024-001",
                "customer_id": customers[0].id,
                "project_id": projects[0].id,
                "amount": 5000.00,
                "tax_amount": 450.00,
                "total_amount": 5450.00,
                "status": InvoiceStatus.PAID,
                "issue_date": datetime.now(timezone.utc),
                "due_date": datetime.now(timezone.utc)
            },
            {
                "invoice_number": "INV-2024-002",
                "customer_id": customers[1].id,
                "project_id": projects[1].id,
                "amount": 10000.00,
                "tax_amount": 900.00,
                "total_amount": 10900.00,
                "status": InvoiceStatus.PENDING,
                "issue_date": datetime.now(timezone.utc),
                "due_date": datetime.now(timezone.utc)
            }
        ]
        
        for invoice_data in invoices_data:
            invoice = Invoice(
                tenant_id=tenant.id,
                **invoice_data
            )
            db.add(invoice)
        
        # Add some customer interactions
        db.flush()
        
        interactions_data = [
            {
                "customer_id": customers[0].id,
                "type": "email",
                "subject": "Project kickoff meeting",
                "notes": "Scheduled initial meeting to discuss project requirements and timeline",
                "interaction_date": datetime.now(timezone.utc)
            },
            {
                "customer_id": customers[1].id,
                "type": "call",
                "subject": "Budget discussion",
                "notes": "Discussed project budget and payment terms",
                "interaction_date": datetime.now(timezone.utc)
            }
        ]
        
        for interaction_data in interactions_data:
            interaction = CustomerInteraction(
                tenant_id=tenant.id,
                **interaction_data
            )
            db.add(interaction)
        
        # Commit all changes
        db.commit()
        print("Sample data added successfully!")
        print(f"Added: {len(customers)} customers, {len(leads)} leads, {len(projects)} projects")
        
    except Exception as e:
        print(f"Error adding sample data: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    add_sample_data()
