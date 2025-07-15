#!/usr/bin/env python3
"""
Custom migration script for DevHub Multi-Tenant Architecture
Handles existing data properly before applying database migrations
"""
import sys
import os
sys.path.append('src')

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import json

# Database connection
DATABASE_URL = "postgresql://beast:@localhost:5432/devhub_your_business"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def custom_migration():
    """
    Custom migration that handles existing data properly
    """
    db = SessionLocal()
    
    try:
        print("🚀 Starting DevHub Multi-Tenant Custom Migration...")
        
        # Step 1: Create tenants table first
        print("\n1. Creating tenants table...")
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS tenants (
                id SERIAL PRIMARY KEY,
                system_id VARCHAR UNIQUE,
                business_name VARCHAR,
                business_email VARCHAR,
                business_phone VARCHAR,
                address_line1 VARCHAR,
                address_line2 VARCHAR,
                city VARCHAR,
                state VARCHAR,
                postal_code VARCHAR,
                country VARCHAR DEFAULT 'US',
                subscription_plan VARCHAR DEFAULT 'starter',
                is_active BOOLEAN DEFAULT true,
                max_users INTEGER DEFAULT 5,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        """))
        
        db.execute(text("""
            CREATE INDEX IF NOT EXISTS ix_tenants_system_id ON tenants (system_id);
            CREATE INDEX IF NOT EXISTS ix_tenants_business_name ON tenants (business_name);
            CREATE INDEX IF NOT EXISTS ix_tenants_id ON tenants (id);
        """))
        
        # Step 2: Create default tenant for existing data
        print("\n2. Creating default tenant for existing data...")
        
        # Check if we need to create a tenant for existing users
        existing_tenant_ids = db.execute(text("""
            SELECT DISTINCT tenant_id FROM users 
            WHERE tenant_id IS NOT NULL AND tenant_id != ''
        """)).fetchall()
        
        for row in existing_tenant_ids:
            tenant_id = row[0]
            if tenant_id:
                # Check if tenant already exists
                existing = db.execute(text("""
                    SELECT system_id FROM tenants WHERE system_id = :tenant_id
                """), {"tenant_id": tenant_id}).fetchone()
                
                if not existing:
                    print(f"   Creating tenant: {tenant_id}")
                    db.execute(text("""
                        INSERT INTO tenants (system_id, business_name, business_email, subscription_plan, max_users)
                        VALUES (:system_id, :business_name, :business_email, 'professional', 50)
                    """), {
                        "system_id": tenant_id,
                        "business_name": f"Default Business ({tenant_id})",
                        "business_email": "admin@defaultbusiness.com"
                    })
        
        # Step 3: Add new columns to existing tables
        print("\n3. Adding new columns to existing tables...")
        
        # Check which tables exist first
        tables_result = db.execute(text("""
            SELECT table_name FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
        """)).fetchall()
        
        existing_tables = [row[0] for row in tables_result]
        print(f"   Found tables: {existing_tables}")
        
        # Add tenant_id to customers table
        if 'customers' in existing_tables:
            db.execute(text("""
                ALTER TABLE customers 
                ADD COLUMN IF NOT EXISTS tenant_id VARCHAR;
            """))
            print("   ✅ Added tenant_id to customers")
        
        # Add tenant_id to projects table  
        if 'projects' in existing_tables:
            db.execute(text("""
                ALTER TABLE projects 
                ADD COLUMN IF NOT EXISTS tenant_id VARCHAR;
            """))
            print("   ✅ Added tenant_id to projects")
        
        # Add tenant_id to leads table (if it exists)
        if 'leads' in existing_tables:
            db.execute(text("""
                ALTER TABLE leads 
                ADD COLUMN IF NOT EXISTS tenant_id VARCHAR;
            """))
            print("   ✅ Added tenant_id to leads")
        else:
            print("   ⚠️  Leads table not found - skipping")
        
        # Add new columns to users table
        db.execute(text("""
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS department VARCHAR,
            ADD COLUMN IF NOT EXISTS permissions TEXT;
        """))
        print("   ✅ Added department and permissions to users")
        
        # Step 4: Update existing data to belong to default tenant
        print("\n4. Updating existing data with tenant relationships...")
        
        # Set default tenant for orphaned customers
        default_tenant = db.execute(text("""
            SELECT system_id FROM tenants ORDER BY created_at LIMIT 1
        """)).fetchone()
        
        if default_tenant:
            default_tenant_id = default_tenant[0]
            
            # Update customers without tenant
            db.execute(text("""
                UPDATE customers 
                SET tenant_id = :tenant_id 
                WHERE tenant_id IS NULL
            """), {"tenant_id": default_tenant_id})
            
            # Update projects without tenant
            db.execute(text("""
                UPDATE projects 
                SET tenant_id = :tenant_id 
                WHERE tenant_id IS NULL
            """), {"tenant_id": default_tenant_id})
            
            # Update leads without tenant (if table exists)
            if 'leads' in existing_tables:
                db.execute(text("""
                    UPDATE leads 
                    SET tenant_id = :tenant_id 
                    WHERE tenant_id IS NULL
                """), {"tenant_id": default_tenant_id})
                print("   ✅ Updated leads with tenant relationship")
            
            # Update users without tenant (but not founder)
            db.execute(text("""
                UPDATE users 
                SET tenant_id = :tenant_id 
                WHERE tenant_id IS NULL AND is_founder = false
            """), {"tenant_id": default_tenant_id})
        
        # Step 5: Update founder account
        print("\n5. Updating founder account...")
        db.execute(text("""
            UPDATE users 
            SET tenant_id = NULL, 
                user_role = 'FOUNDER',
                department = 'platform_admin',
                permissions = :permissions
            WHERE system_id = 'USR-000' OR is_founder = true
        """), {
            "permissions": json.dumps({
                "platform_admin": True,
                "all_tenants": True,
                "crm": True,
                "projects": True,
                "invoices": True,
                "users": True,
                "vault": True
            })
        })
        
        # Step 6: Update other users with default permissions
        print("\n6. Setting default permissions for other users...")
        db.execute(text("""
            UPDATE users 
            SET user_role = COALESCE(user_role, 'EMPLOYEE'),
                department = COALESCE(department, 'general'),
                permissions = COALESCE(permissions, :permissions)
            WHERE is_founder = false
        """), {
            "permissions": json.dumps({
                "crm": True,
                "projects": True,
                "invoices": True,
                "users": False,
                "vault": False
            })
        })
        
        # Step 7: Create foreign key constraints
        print("\n7. Creating foreign key constraints...")
        
        # Drop old tenant_name column and index if they exist
        db.execute(text("""
            DROP INDEX IF EXISTS ix_users_tenant_id;
            ALTER TABLE users DROP COLUMN IF EXISTS tenant_name;
        """))
        
        # Add foreign key constraints for existing tables
        db.execute(text("""
            ALTER TABLE customers 
            ADD CONSTRAINT fk_customers_tenant 
            FOREIGN KEY (tenant_id) REFERENCES tenants (system_id);
        """))
        print("   ✅ Added customers -> tenants foreign key")
        
        db.execute(text("""
            ALTER TABLE projects 
            ADD CONSTRAINT fk_projects_tenant 
            FOREIGN KEY (tenant_id) REFERENCES tenants (system_id);
        """))
        print("   ✅ Added projects -> tenants foreign key")
        
        # Only add leads constraint if table exists
        if 'leads' in existing_tables:
            db.execute(text("""
                ALTER TABLE leads 
                ADD CONSTRAINT fk_leads_tenant 
                FOREIGN KEY (tenant_id) REFERENCES tenants (system_id);
            """))
            print("   ✅ Added leads -> tenants foreign key")
        
        db.execute(text("""
            ALTER TABLE users 
            ADD CONSTRAINT fk_users_tenant 
            FOREIGN KEY (tenant_id) REFERENCES tenants (system_id);
        """))
        print("   ✅ Added users -> tenants foreign key")
        
        # Step 8: Commit all changes
        db.commit()
        print("\n✅ Custom migration completed successfully!")
        
        # Step 9: Display summary
        print("\n📊 MIGRATION SUMMARY:")
        print("=" * 50)
        
        # Count tenants
        tenant_count = db.execute(text("SELECT COUNT(*) FROM tenants")).fetchone()[0]
        print(f"🏢 Tenants: {tenant_count}")
        
        # Count users by role
        founder_count = db.execute(text("SELECT COUNT(*) FROM users WHERE is_founder = true")).fetchone()[0]
        business_owner_count = db.execute(text("SELECT COUNT(*) FROM users WHERE user_role = 'BUSINESS_OWNER'")).fetchone()[0]
        employee_count = db.execute(text("SELECT COUNT(*) FROM users WHERE user_role = 'EMPLOYEE'")).fetchone()[0]
        
        print(f"👤 Users:")
        print(f"   - Platform Founder: {founder_count}")
        print(f"   - Business Owners: {business_owner_count}")
        print(f"   - Employees: {employee_count}")
        
        # Count data by tenant
        tenants = db.execute(text("SELECT system_id, business_name FROM tenants")).fetchall()
        for tenant in tenants:
            tenant_id, business_name = tenant
            customer_count = db.execute(text("SELECT COUNT(*) FROM customers WHERE tenant_id = :tenant_id"), {"tenant_id": tenant_id}).fetchone()[0]
            project_count = db.execute(text("SELECT COUNT(*) FROM projects WHERE tenant_id = :tenant_id"), {"tenant_id": tenant_id}).fetchone()[0]
            lead_count = db.execute(text("SELECT COUNT(*) FROM leads WHERE tenant_id = :tenant_id"), {"tenant_id": tenant_id}).fetchone()[0]
            user_count = db.execute(text("SELECT COUNT(*) FROM users WHERE tenant_id = :tenant_id"), {"tenant_id": tenant_id}).fetchone()[0]
            
            print(f"\n🏢 {business_name} ({tenant_id}):")
            print(f"   - Users: {user_count}")
            print(f"   - Customers: {customer_count}")
            print(f"   - Projects: {project_count}")
            print(f"   - Leads: {lead_count}")
        
        print("\n🎉 DevHub is now running in Multi-Tenant SaaS mode!")
        
    except Exception as e:
        print(f"❌ Migration failed: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    print("DevHub Multi-Tenant Custom Migration")
    print("=" * 40)
    custom_migration()
    print("\n🎯 Migration completed!")
