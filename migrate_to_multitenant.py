#!/usr/bin/env python3
"""
Migration script for DevHub Multi-Tenant Architecture
Converts existing single-tenant data to proper multi-tenant structure
"""
import sys
import os
sys.path.append('devhub-api/src')

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from devhub_api.models import User, Customer, Project, Lead, Tenant
from devhub_api.id_system import create_tenant, IDGenerator
from devhub_api.auth import AuthManager
import json

# Database connection
DATABASE_URL = "postgresql://postgres:password@localhost:5432/devhub"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def migrate_to_multitenant():
    """
    Migrate existing DevHub data to multi-tenant architecture
    """
    db = SessionLocal()
    
    try:
        print("🚀 Starting DevHub Multi-Tenant Migration...")
        
        # Step 1: Run the database migration
        print("\n1. Running database migration...")
        os.system("cd devhub-api && alembic upgrade head")
        
        # Step 2: Update founder account
        print("\n2. Updating founder account...")
        founder = db.query(User).filter(User.system_id == "USR-000").first()
        if founder:
            founder.tenant_id = None  # Platform founder has no tenant
            founder.user_role = "FOUNDER"
            founder.department = "platform_admin"
            founder.permissions = json.dumps({
                "platform_admin": True,
                "all_tenants": True,
                "crm": True,
                "projects": True,
                "invoices": True,
                "users": True,
                "vault": True
            })
            print(f"✅ Updated founder: {founder.email} ({founder.display_id})")
        else:
            print("❌ Founder account not found - you may need to create it first")
        
        # Step 3: Create default tenant for existing data
        print("\n3. Creating default tenant for existing data...")
        
        # Check if we have existing customers/projects without tenant
        existing_customers = db.query(Customer).filter(Customer.tenant_id == None).all()
        existing_projects = db.query(Project).filter(Project.tenant_id == None).all()
        existing_users = db.query(User).filter(User.tenant_id == None, User.is_founder == False).all()
        
        if existing_customers or existing_projects or existing_users:
            # Create default tenant
            tenant_id = IDGenerator.generate_id("tenant", db)
            default_tenant = Tenant(
                system_id=tenant_id,
                business_name="Default Business",
                business_email="business@example.com",
                subscription_plan="professional",
                is_active=True,
                max_users=50
            )
            db.add(default_tenant)
            db.flush()
            
            print(f"✅ Created default tenant: {tenant_id} (Default Business)")
            
            # Step 4: Migrate existing customers
            print(f"\n4. Migrating {len(existing_customers)} existing customers...")
            for customer in existing_customers:
                customer.tenant_id = tenant_id
                print(f"   📋 {customer.system_id}: {customer.name}")
            
            # Step 5: Migrate existing projects
            print(f"\n5. Migrating {len(existing_projects)} existing projects...")
            for project in existing_projects:
                project.tenant_id = tenant_id
                print(f"   📁 {project.system_id}: {project.name}")
            
            # Step 6: Migrate existing leads
            existing_leads = db.query(Lead).filter(Lead.tenant_id == None).all()
            print(f"\n6. Migrating {len(existing_leads)} existing leads...")
            for lead in existing_leads:
                lead.tenant_id = tenant_id
                print(f"   🎯 {lead.system_id}: {lead.name}")
            
            # Step 7: Migrate existing users (make them employees of default tenant)
            print(f"\n7. Migrating {len(existing_users)} existing users...")
            for user in existing_users:
                user.tenant_id = tenant_id
                user.user_role = "EMPLOYEE"
                user.department = "general"
                user.permissions = json.dumps({
                    "crm": True,
                    "projects": True,
                    "invoices": True,
                    "users": False,
                    "vault": False
                })
                print(f"   👤 {user.system_id}: {user.full_name} ({user.email})")
        
        else:
            print("✅ No existing data to migrate")
        
        # Step 8: Commit all changes
        db.commit()
        print("\n✅ Migration completed successfully!")
        
        # Step 9: Display summary
        print("\n📊 MIGRATION SUMMARY:")
        print("=" * 50)
        
        # Count tenants
        tenant_count = db.query(Tenant).count()
        print(f"🏢 Tenants: {tenant_count}")
        
        # Count users by role
        founder_count = db.query(User).filter(User.is_founder == True).count()
        business_owner_count = db.query(User).filter(User.user_role == "BUSINESS_OWNER").count()
        employee_count = db.query(User).filter(User.user_role == "EMPLOYEE").count()
        
        print(f"👤 Users:")
        print(f"   - Platform Founder: {founder_count}")
        print(f"   - Business Owners: {business_owner_count}")
        print(f"   - Employees: {employee_count}")
        
        # Count data by tenant
        for tenant in db.query(Tenant).all():
            customer_count = db.query(Customer).filter(Customer.tenant_id == tenant.system_id).count()
            project_count = db.query(Project).filter(Project.tenant_id == tenant.system_id).count()
            lead_count = db.query(Lead).filter(Lead.tenant_id == tenant.system_id).count()
            user_count = db.query(User).filter(User.tenant_id == tenant.system_id).count()
            
            print(f"\n🏢 {tenant.business_name} ({tenant.system_id}):")
            print(f"   - Users: {user_count}")
            print(f"   - Customers: {customer_count}")
            print(f"   - Projects: {project_count}")
            print(f"   - Leads: {lead_count}")
        
        print("\n🎉 DevHub is now running in Multi-Tenant SaaS mode!")
        print("\n💡 Next Steps:")
        print("1. Test founder login and platform access")
        print("2. Create new tenant businesses using the API")
        print("3. Test data isolation between tenants")
        print("4. Update frontend to handle tenant context")
        
    except Exception as e:
        print(f"❌ Migration failed: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()

def create_demo_tenant():
    """Create a demo tenant business for testing"""
    db = SessionLocal()
    
    try:
        print("\n🏢 Creating demo tenant business...")
        
        # Create tenant with business owner
        tenant, business_owner = create_tenant(
            db=db,
            business_name="ACME Corporation",
            business_email="admin@acmecorp.com",
            owner_email="owner@acmecorp.com",
            owner_password_hash=AuthManager.get_password_hash("password123"),
            owner_full_name="John Smith",
            subscription_plan="professional"
        )
        
        print(f"✅ Created tenant: {tenant.system_id} ({tenant.business_name})")
        print(f"✅ Created business owner: {business_owner.system_id} ({business_owner.full_name})")
        print(f"📧 Business owner login: {business_owner.email} / password123")
        
        return tenant, business_owner
        
    except Exception as e:
        print(f"❌ Demo tenant creation failed: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    print("DevHub Multi-Tenant Migration Tool")
    print("=" * 40)
    
    choice = input("\nChoose an option:\n1. Migrate existing data to multi-tenant\n2. Create demo tenant business\n3. Both\n\nEnter choice (1-3): ")
    
    if choice in ["1", "3"]:
        migrate_to_multitenant()
    
    if choice in ["2", "3"]:
        create_demo_tenant()
    
    print("\n🎯 Migration completed!")
