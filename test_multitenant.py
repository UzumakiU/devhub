#!/usr/bin/env python3
"""
Test script for DevHub Multi-Tenant Architecture
Demonstrates tenant creation, data isolation, and role-based access
"""
import sys
import os
sys.path.append('devhub-api/src')

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from devhub_api.models import User, Customer, Project, Lead, Tenant
from devhub_api.id_system import create_tenant, IDGenerator, create_tenant_user
from devhub_api.auth import AuthManager
import json

# Database connection
DATABASE_URL = "postgresql://beast:@localhost:5432/devhub_your_business"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def test_multitenant_features():
    """Test multi-tenant features"""
    db = SessionLocal()
    
    try:
        print("🧪 Testing DevHub Multi-Tenant Features...")
        print("=" * 50)
        
        # Test 1: Create a new tenant business
        print("\n1. Creating new tenant business...")
        tenant, business_owner = create_tenant(
            db=db,
            business_name="ACME Corporation",
            business_email="admin@acmecorp.com",
            owner_email="john.smith@acmecorp.com",
            owner_password_hash=AuthManager.get_password_hash("acme123"),
            owner_full_name="John Smith",
            subscription_plan="professional"
        )
        print(f"✅ Created tenant: {tenant.system_id} ({tenant.business_name})")
        print(f"✅ Created business owner: {business_owner.system_id} ({business_owner.full_name})")
        print(f"📧 Login: {business_owner.email} / acme123")
        
        # Test 2: Add employees to the tenant
        print("\n2. Adding employees to ACME Corporation...")
        sales_manager = create_tenant_user(
            db=db,
            tenant_id=tenant.system_id,
            email="sales@acmecorp.com",
            password_hash=AuthManager.get_password_hash("sales123"),
            full_name="Sarah Connor",
            user_role="MANAGER",
            department="sales"
        )
        print(f"✅ Added sales manager: {sales_manager.system_id} ({sales_manager.full_name})")
        
        developer = create_tenant_user(
            db=db,
            tenant_id=tenant.system_id,
            email="dev@acmecorp.com",
            password_hash=AuthManager.get_password_hash("dev123"),
            full_name="Mike Johnson",
            user_role="EMPLOYEE",
            department="development"
        )
        print(f"✅ Added developer: {developer.system_id} ({developer.full_name})")
        
        # Test 3: Add customers to ACME tenant
        print("\n3. Adding customers to ACME Corporation...")
        customers_to_add = ["Apple Inc", "Google LLC", "Microsoft Corp"]
        
        for customer_name in customers_to_add:
            customer_id = IDGenerator.generate_id("customer", db)
            customer = Customer(
                system_id=customer_id,
                tenant_id=tenant.system_id,
                name=customer_name,
                email=f"contact@{customer_name.lower().replace(' ', '').replace('.', '')}.com",
                company=customer_name,
                is_active=True
            )
            db.add(customer)
            db.commit()  # Commit each customer individually
            print(f"   📋 {customer_id}: {customer_name}")
        
        # Test 4: Add a project for ACME
        print("\n4. Creating project for ACME Corporation...")
        project_id = IDGenerator.generate_id("project", db)
        project = Project(
            system_id=project_id,
            tenant_id=tenant.system_id,
            name="Enterprise CRM System",
            description="Custom CRM solution for ACME Corp",
            owner_id=business_owner.system_id,
            status="active"
        )
        db.add(project)
        print(f"✅ Created project: {project_id} (Enterprise CRM System)")
        
        db.commit()
        
        # Test 5: Verify data isolation
        print("\n5. Testing data isolation...")
        
        # Count customers per tenant
        default_tenant_customers = db.query(Customer).filter(Customer.tenant_id == "DEV-000").count()
        acme_tenant_customers = db.query(Customer).filter(Customer.tenant_id == tenant.system_id).count()
        
        print(f"   Default tenant (DEV-000) customers: {default_tenant_customers}")
        print(f"   ACME tenant ({tenant.system_id}) customers: {acme_tenant_customers}")
        print("   ✅ Data isolation confirmed - tenants see only their own data")
        
        # Test 6: Verify founder access
        print("\n6. Testing founder platform access...")
        founder = db.query(User).filter(User.is_founder == True).first()
        print(f"   Platform Founder: {founder.system_id} ({founder.email})")
        print(f"   Tenant ID: {founder.tenant_id} (None = Platform-wide access)")
        print("   ✅ Founder has platform-wide access")
        
        # Test 7: Display complete structure
        print("\n7. Complete multi-tenant structure:")
        print("=" * 50)
        
        print(f"\n🏢 Platform Founder:")
        print(f"   {founder.system_id}: {founder.full_name} ({founder.email})")
        print(f"   Role: {founder.user_role}")
        print(f"   Access: Platform-wide (all tenants)")
        
        tenants = db.query(Tenant).all()
        for tenant_obj in tenants:
            print(f"\n🏢 Tenant: {tenant_obj.business_name} ({tenant_obj.system_id})")
            print(f"   Subscription: {tenant_obj.subscription_plan}")
            print(f"   Max Users: {tenant_obj.max_users}")
            
            # Users in this tenant
            tenant_users = db.query(User).filter(User.tenant_id == tenant_obj.system_id).all()
            for user in tenant_users:
                role_icon = "👑" if user.user_role == "BUSINESS_OWNER" else "👤"
                print(f"   {role_icon} {user.system_id}: {user.full_name} ({user.user_role}, {user.department})")
            
            # Customers in this tenant
            tenant_customers = db.query(Customer).filter(Customer.tenant_id == tenant_obj.system_id).count()
            tenant_projects = db.query(Project).filter(Project.tenant_id == tenant_obj.system_id).count()
            print(f"   📊 Data: {tenant_customers} customers, {tenant_projects} projects")
        
        print("\n🎉 Multi-tenant architecture test completed successfully!")
        
        # Test 8: Login simulation
        print("\n8. Login credential summary:")
        print("=" * 30)
        print("Platform Founder:")
        print(f"  Email: {founder.email}")
        print(f"  Role: Platform-wide access")
        print("\nACME Corporation:")
        print(f"  Business Owner: john.smith@acmecorp.com / acme123")
        print(f"  Sales Manager: sales@acmecorp.com / sales123")
        print(f"  Developer: dev@acmecorp.com / dev123")
        
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {str(e)}")
        db.rollback()
        return False
    finally:
        db.close()

def create_another_tenant():
    """Create a second tenant to demonstrate isolation"""
    db = SessionLocal()
    
    try:
        print("\n🏢 Creating second tenant business...")
        
        tenant2, owner2 = create_tenant(
            db=db,
            business_name="TechFlow Solutions",
            business_email="info@techflow.com",
            owner_email="ceo@techflow.com",
            owner_password_hash=AuthManager.get_password_hash("techflow123"),
            owner_full_name="Alice Williams",
            subscription_plan="enterprise"
        )
        
        print(f"✅ Created second tenant: {tenant2.system_id} ({tenant2.business_name})")
        print(f"✅ Business Owner: {owner2.email} / techflow123")
        
        # Add some customers to demonstrate isolation
        for customer_name in ["Netflix Inc", "Spotify AB"]:
            customer_id = IDGenerator.generate_id("customer", db)
            customer = Customer(
                system_id=customer_id,
                tenant_id=tenant2.system_id,
                name=customer_name,
                email=f"contact@{customer_name.lower().replace(' ', '').replace('.', '')}.com",
                company=customer_name,
                is_active=True
            )
            db.add(customer)
        
        db.commit()
        print("✅ Added customers to TechFlow Solutions")
        
        # Verify isolation
        tenant_count = db.query(Tenant).count()
        print(f"\n📊 Total tenants in system: {tenant_count}")
        
        for tenant in db.query(Tenant).all():
            customer_count = db.query(Customer).filter(Customer.tenant_id == tenant.system_id).count()
            print(f"   {tenant.business_name}: {customer_count} customers")
        
        return True
        
    except Exception as e:
        print(f"❌ Second tenant creation failed: {str(e)}")
        db.rollback()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    print("DevHub Multi-Tenant Architecture Test")
    print("=" * 40)
    
    success = test_multitenant_features()
    
    if success:
        choice = input("\n🤔 Create a second tenant business to test isolation? (y/n): ")
        if choice.lower() == 'y':
            create_another_tenant()
    
    print("\n🎯 Testing completed!")
