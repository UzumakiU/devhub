#!/usr/bin/env python3
"""
Fix ID System - Comprehensive solution to synchronize and standardize IDs across the database
Addresses the inconsistent ID patterns and ensures proper sequential numbering
"""

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from src.devhub_api.database import DATABASE_URL
from src.devhub_api.models import *
from src.devhub_api.id_system import IDGenerator

def main():
    """Main function to fix all ID system issues"""
    print("🔧 Starting ID System Fix...")
    
    # Create database connection
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Step 1: Fix Tenant IDs
        print("\n📋 Step 1: Fixing Tenant IDs...")
        fix_tenant_ids(db)
        
        # Step 2: Fix User IDs and relationships
        print("\n👤 Step 2: Fixing User IDs and relationships...")
        fix_user_ids(db)
        
        # Step 3: Fix Customer IDs
        print("\n🏢 Step 3: Fixing Customer IDs...")
        fix_customer_ids(db)
        
        # Step 4: Fix Project IDs
        print("\n📁 Step 4: Fixing Project IDs...")
        fix_project_ids(db)
        
        # Step 5: Fix Lead IDs
        print("\n🎯 Step 5: Fixing Lead IDs...")
        fix_lead_ids(db)
        
        # Step 6: Fix Invoice IDs
        print("\n💰 Step 6: Fixing Invoice IDs...")
        fix_invoice_ids(db)
        
        # Step 7: Fix Interaction IDs
        print("\n💬 Step 7: Fixing Interaction IDs...")
        fix_interaction_ids(db)
        
        # Step 8: Verify the fixes
        print("\n✅ Step 8: Verifying fixes...")
        verify_id_system(db)
        
        print("\n🎉 ID System Fix Complete!")
        
    except Exception as e:
        print(f"\n❌ Error during ID system fix: {e}")
        db.rollback()
        raise
    finally:
        db.close()


def fix_tenant_ids(db):
    """Fix tenant ID inconsistencies"""
    # Get all tenants
    tenants = db.query(Tenant).all()
    
    id_mapping = {}
    
    # Create mapping of old to new IDs
    for i, tenant in enumerate(tenants):
        old_id = tenant.system_id
        new_id = f"TNT-{i:03d}"
        
        print(f"  📝 Tenant: {old_id} -> {new_id} ({tenant.business_name})")
        id_mapping[old_id] = new_id
    
    # Check which tables have tenant_id column
    tables_with_tenant_id = []
    for table in ['users', 'customers', 'projects', 'leads', 'invoices']:
        try:
            result = db.execute(text(f"SELECT column_name FROM information_schema.columns WHERE table_name = '{table}' AND column_name = 'tenant_id';"))
            if len(result.fetchall()) > 0:
                tables_with_tenant_id.append(table)
        except:
            pass
    
    print(f"  📊 Tables with tenant_id: {tables_with_tenant_id}")
    
    try:
        # Disable foreign key checks temporarily for PostgreSQL
        db.execute(text("SET session_replication_role = replica;"))
        
        # Update tenant IDs directly
        for old_id, new_id in id_mapping.items():
            db.execute(text(f"UPDATE tenants SET system_id = '{new_id}' WHERE system_id = '{old_id}';"))
        
        # Update foreign key references only in tables that have tenant_id
        print(f"  🔗 Updating foreign key references...")
        for old_id, new_id in id_mapping.items():
            for table in tables_with_tenant_id:
                db.execute(text(f"UPDATE {table} SET tenant_id = '{new_id}' WHERE tenant_id = '{old_id}';"))
                print(f"    ✅ Updated {table}")
        
        # Re-enable foreign key checks
        db.execute(text("SET session_replication_role = DEFAULT;"))
        
        db.commit()
        print(f"  ✅ Fixed {len(tenants)} tenant IDs")
            
    except Exception as e:
        print(f"  ❌ Failed to fix tenant IDs: {e}")
        db.rollback()
        raise e


def fix_user_ids(db):
    """Fix user ID issues and founder account"""
    users = db.query(User).all()
    
    for user in users:
        print(f"  👤 User: {user.system_id} ({user.full_name})")
        
        # Fix founder account
        if user.system_id == "USR-000":
            user.tenant_id = None  # Platform founder has no tenant
            user.user_role = "FOUNDER"  # Correct role name
            user.display_id = "FOUNDER"
            user.is_founder = True
            print(f"    🔧 Fixed founder account: tenant_id=None, role=FOUNDER")
        
        # Fix display_id for business owners
        elif user.user_role == "BUSINESS_OWNER":
            user.display_id = "BUSINESS_OWNER"
            print(f"    🔧 Fixed display_id: {user.display_id}")
    
    db.commit()
    print(f"  ✅ Fixed {len(users)} user records")


def fix_customer_ids(db):
    """Fix customer ID sequence"""
    customers = db.query(Customer).order_by(Customer.id).all()
    
    for i, customer in enumerate(customers):
        old_id = customer.system_id
        new_id = f"CUS-{i:03d}"
        
        if old_id != new_id:
            print(f"  🏢 Customer: {old_id} -> {new_id}")
            
            # Check which tables have customer_id column
            tables_with_customer_id = []
            for table in ['projects', 'invoices', 'customer_interactions', 'customer_notes']:
                try:
                    result = db.execute(text(f"SELECT column_name FROM information_schema.columns WHERE table_name = '{table}' AND column_name = 'customer_id';"))
                    if len(result.fetchall()) > 0:
                        tables_with_customer_id.append(table)
                except:
                    pass
            
            # Update foreign key references only in tables that have customer_id
            for table in tables_with_customer_id:
                db.execute(text(f"UPDATE {table} SET customer_id = '{new_id}' WHERE customer_id = '{old_id}'"))
                print(f"    ✅ Updated {table}")
            
            # Update customer system_id
            customer.system_id = new_id
    
    db.commit()
    print(f"  ✅ Fixed {len(customers)} customer IDs")


def fix_project_ids(db):
    """Fix project ID sequence"""
    projects = db.query(Project).order_by(Project.id).all()
    
    for i, project in enumerate(projects):
        old_id = project.system_id
        new_id = f"PRJ-{i:03d}"
        
        if old_id != new_id:
            print(f"  📁 Project: {old_id} -> {new_id}")
            
            # Update foreign key references first
            db.execute(text(f"UPDATE invoices SET project_id = '{new_id}' WHERE project_id = '{old_id}'"))
            
            # Update project system_id
            project.system_id = new_id
    
    db.commit()
    print(f"  ✅ Fixed {len(projects)} project IDs")


def fix_lead_ids(db):
    """Fix lead ID sequence"""
    leads = db.query(Lead).order_by(Lead.id).all()
    
    for i, lead in enumerate(leads):
        old_id = lead.system_id
        new_id = f"LED-{i:03d}"
        
        if old_id != new_id:
            print(f"  🎯 Lead: {old_id} -> {new_id}")
            
            # Update foreign key references first
            db.execute(text(f"UPDATE lead_interactions SET lead_id = '{new_id}' WHERE lead_id = '{old_id}'"))
            
            # Update lead system_id
            lead.system_id = new_id
    
    db.commit()
    print(f"  ✅ Fixed {len(leads)} lead IDs")


def fix_invoice_ids(db):
    """Fix invoice ID sequence"""
    invoices = db.query(Invoice).order_by(Invoice.id).all()
    
    for i, invoice in enumerate(invoices):
        old_id = invoice.system_id
        new_id = f"INV-{i:03d}"
        
        if old_id != new_id:
            print(f"  💰 Invoice: {old_id} -> {new_id}")
            invoice.system_id = new_id
    
    db.commit()
    print(f"  ✅ Fixed {len(invoices)} invoice IDs")


def fix_interaction_ids(db):
    """Fix customer interaction and note IDs"""
    # Fix customer interactions
    interactions = db.query(CustomerInteraction).order_by(CustomerInteraction.id).all()
    
    for i, interaction in enumerate(interactions):
        old_id = interaction.system_id
        new_id = f"INT-{i:03d}"
        
        if old_id != new_id:
            print(f"  💬 Interaction: {old_id} -> {new_id}")
            interaction.system_id = new_id
    
    # Fix customer notes
    notes = db.query(CustomerNote).order_by(CustomerNote.id).all()
    
    for i, note in enumerate(notes):
        old_id = note.system_id
        new_id = f"NOT-{i:03d}"
        
        if old_id != new_id:
            print(f"  📝 Note: {old_id} -> {new_id}")
            note.system_id = new_id
    
    db.commit()
    print(f"  ✅ Fixed {len(interactions)} interactions and {len(notes)} notes")


def verify_id_system(db):
    """Verify that the ID system is now consistent"""
    print("\n📊 ID System Verification:")
    
    # Check tenants
    tenants = db.query(Tenant).all()
    tenant_ids = [t.system_id for t in tenants]
    print(f"  📋 Tenants: {tenant_ids}")
    
    # Check users
    users = db.query(User).all()
    user_info = [(u.system_id, u.display_id, u.tenant_id, u.user_role) for u in users]
    print(f"  👤 Users:")
    for info in user_info:
        print(f"    {info[0]} ({info[1]}) -> tenant: {info[2]}, role: {info[3]}")
    
    # Check customers
    customers = db.query(Customer).all()
    customer_ids = [c.system_id for c in customers]
    print(f"  🏢 Customers: {customer_ids}")
    
    # Check projects
    projects = db.query(Project).all()
    project_ids = [p.system_id for p in projects]
    print(f"  📁 Projects: {project_ids}")
    
    # Check leads
    leads = db.query(Lead).all()
    lead_ids = [l.system_id for l in leads]
    print(f"  🎯 Leads: {lead_ids}")
    
    # Verify sequences
    print("\n🔢 Sequence Verification:")
    verify_sequence("tenants", [t.system_id for t in tenants], "TNT")
    verify_sequence("users", [u.system_id for u in users], "USR")
    verify_sequence("customers", [c.system_id for c in customers], "CUS")
    verify_sequence("projects", [p.system_id for p in projects], "PRJ")
    verify_sequence("leads", [l.system_id for l in leads], "LED")


def verify_sequence(entity_name, ids, prefix):
    """Verify that IDs follow proper sequential pattern"""
    if not ids:
        print(f"  ✅ {entity_name}: No records (OK)")
        return
    
    expected_pattern = True
    for i, id_val in enumerate(sorted(ids)):
        expected = f"{prefix}-{i:03d}"
        if id_val != expected:
            expected_pattern = False
            print(f"  ❌ {entity_name}: {id_val} should be {expected}")
            break
    
    if expected_pattern:
        print(f"  ✅ {entity_name}: Sequential pattern correct ({len(ids)} records)")


if __name__ == "__main__":
    main()
