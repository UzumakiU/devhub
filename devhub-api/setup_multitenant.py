#!/usr/bin/env python3
"""
DevHub Multi-Tenant SaaS Setup Script
Transforms DevHub from single-tenant to full multi-tenant SaaS platform
"""

import sys
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import json

# Add the src directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from devhub_api.models import Tenant, User, Customer, Project, Lead
from devhub_api.core.config import settings
from devhub_api.database import get_db
from devhub_api.id_system import IDGenerator, create_tenant

def setup_multitenant_platform():
    """
    Complete multi-tenant platform setup
    """
    print("🚀 DevHub Multi-Tenant SaaS Platform Setup")
    print("=" * 50)
    
    # Database connection
    engine = create_engine(settings.DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Step 1: Create Platform Tenant (DevHub Enterprise)
        print("\n📊 Step 1: Creating Platform Tenant...")
        
        platform_tenant = Tenant(
            system_id="TNT-PLT",
            business_name="DevHub Enterprise",
            business_email="admin@devhub.enterprise",
            business_phone="+1-555-0100",
            address_line1="123 Platform Street",
            city="San Francisco",
            state="CA",
            postal_code="94105",
            country="US",
            subscription_plan="enterprise",
            is_active=True,
            max_users=1000,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        db.add(platform_tenant)
        db.flush()
        
        # Step 2: Update Founder User
        print("👑 Step 2: Configuring Platform Founder...")
        
        founder = db.query(User).filter(User.system_id == "USR-000").first()
        if not founder:
            # Create founder if doesn't exist
            founder = User(
                system_id="USR-000",
                display_id="FOUNDER",
                email="founder@devhub.enterprise",
                full_name="Platform Founder",
                hashed_password="$2b$12$dummy_hash_replace_with_real",
                is_active=True,
                is_founder=True,
                tenant_id=None,  # Platform-wide access
                user_role="PLATFORM_FOUNDER",
                department="platform",
                permissions=json.dumps({
                    "platform": "*",
                    "tenants": "*",
                    "admin": "*",
                    "support": "*"
                }),
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            db.add(founder)
        else:
            # Update existing founder
            founder.tenant_id = None  # Platform-wide access
            founder.is_founder = True
            founder.user_role = "PLATFORM_FOUNDER"
            founder.department = "platform"
            founder.permissions = json.dumps({
                "platform": "*",
                "tenants": "*", 
                "admin": "*",
                "support": "*"
            })
        
        # Step 3: Create Demo Tenant
        print("🏢 Step 3: Creating Demo Tenant...")
        
        demo_tenant = Tenant(
            system_id="TNT-000",
            business_name="DevHub Demo Corp",
            business_email="demo@devhub-demo.com",
            business_phone="+1-555-0101",
            address_line1="456 Demo Avenue",
            city="Austin",
            state="TX",
            postal_code="73301",
            country="US",
            subscription_plan="professional",
            is_active=True,
            max_users=50,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        db.add(demo_tenant)
        db.flush()
        
        # Step 4: Create Demo Business Owner
        print("👤 Step 4: Creating Demo Business Owner...")
        
        demo_owner = User(
            system_id="USR-001",
            display_id="BUSINESS_OWNER",
            email="owner@devhub-demo.com",
            full_name="Demo Business Owner",
            hashed_password="$2b$12$dummy_hash_replace_with_real",
            is_active=True,
            is_founder=False,
            tenant_id="TNT-000",
            user_role="BUSINESS_OWNER",
            department="management",
            permissions=json.dumps({
                "tenant": "*",
                "users": "manage",
                "crm": "*",
                "projects": "*",
                "invoices": "*",
                "reports": "*"
            }),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        db.add(demo_owner)
        
        # Step 5: Migrate existing data to demo tenant
        print("📦 Step 5: Migrating existing data...")
        
        # Update existing customers
        existing_customers = db.query(Customer).filter(Customer.tenant_id == None).all()
        for customer in existing_customers:
            customer.tenant_id = "TNT-000"
            print(f"   📋 Migrated customer: {customer.system_id}")
        
        # Update existing projects
        existing_projects = db.query(Project).filter(Project.tenant_id == None).all()
        for project in existing_projects:
            project.tenant_id = "TNT-000"
            print(f"   📋 Migrated project: {project.system_id}")
        
        # Update existing leads
        existing_leads = db.query(Lead).filter(Lead.tenant_id == None).all()
        for lead in existing_leads:
            lead.tenant_id = "TNT-000"
            print(f"   📋 Migrated lead: {lead.system_id}")
        
        # Step 6: Create additional demo tenants for testing
        print("🏢 Step 6: Creating additional demo tenants...")
        
        # ACME Corp
        acme_tenant = Tenant(
            system_id="TNT-001",
            business_name="ACME Corporation",
            business_email="contact@acme-corp.com",
            business_phone="+1-555-0102",
            address_line1="789 Business Blvd",
            city="New York",
            state="NY",
            postal_code="10001",
            country="US",
            subscription_plan="starter",
            is_active=True,
            max_users=10,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        db.add(acme_tenant)
        
        # TechFlow Solutions
        techflow_tenant = Tenant(
            system_id="TNT-002",
            business_name="TechFlow Solutions",
            business_email="hello@techflow.io",
            business_phone="+1-555-0103",
            address_line1="321 Innovation Drive",
            city="Seattle",
            state="WA",
            postal_code="98101",
            country="US",
            subscription_plan="professional",
            is_active=True,
            max_users=25,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        db.add(techflow_tenant)
        
        # Commit all changes
        db.commit()
        
        print("\n✅ Multi-Tenant Platform Setup Complete!")
        print("=" * 50)
        print(f"🏢 Platform Tenant: TNT-PLT (DevHub Enterprise)")
        print(f"👑 Platform Founder: USR-000 (Platform-wide access)")
        print(f"🏢 Demo Tenant: TNT-000 (DevHub Demo Corp)")
        print(f"👤 Demo Owner: USR-001 (Business Owner)")
        print(f"🏢 Test Tenant 1: TNT-001 (ACME Corporation)")
        print(f"🏢 Test Tenant 2: TNT-002 (TechFlow Solutions)")
        
        # Print summary
        customer_count = db.query(Customer).count()
        project_count = db.query(Project).count()
        lead_count = db.query(Lead).count()
        
        print(f"\n📊 Data Migration Summary:")
        print(f"   📋 Customers: {customer_count}")
        print(f"   📋 Projects: {project_count}")
        print(f"   📋 Leads: {lead_count}")
        
        print(f"\n🚀 Next Steps:")
        print("1. Update API endpoints to use tenant context")
        print("2. Update frontend for multi-tenant features")
        print("3. Test tenant isolation")
        print("4. Add tenant management UI")
        
        return True
        
    except Exception as e:
        print(f"❌ Error during setup: {str(e)}")
        db.rollback()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    success = setup_multitenant_platform()
    if success:
        print("\n🎉 DevHub is now a Multi-Tenant SaaS Platform!")
        exit(0)
    else:
        print("\n💥 Setup failed. Please check the errors above.")
        exit(1)
