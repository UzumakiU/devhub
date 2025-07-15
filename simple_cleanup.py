#!/usr/bin/env python3
"""
Simple Mock Data Cleanup Script for DevHub
Removes all mock data while preserving the founder account and DevHub Enterprise

Usage:
    python simple_cleanup.py --preview  # Show what will be deleted
    python simple_cleanup.py --execute  # Actually delete the data
"""

import sys
import argparse
from pathlib import Path

# Add the API source directory to Python path
sys.path.append(str(Path(__file__).parent / "devhub-api" / "src"))

from devhub_api.database import get_db
from devhub_api.models import (
    Tenant, User, Project, Customer, ProjectAssignment, 
    ProjectCustomer, Invoice, PasswordVault, CustomerInteraction,
    Lead, LeadInteraction, CustomerNote
)
from sqlalchemy.orm import Session
from sqlalchemy import text


def get_preserved_data(db: Session):
    """Get data that should be preserved"""
    # Find founder
    founder = db.query(User).filter(
        User.system_id == "USR-000",
        User.is_founder == True
    ).first()
    
    if not founder:
        print("❌ CRITICAL: Founder account (USR-000) not found!")
        sys.exit(1)
    
    # Find DevHub Enterprise
    devhub_enterprise = db.query(Tenant).filter(
        Tenant.business_name.ilike('%devhub%enterprise%')
    ).first()
    
    if not devhub_enterprise:
        # Try other variations
        devhub_enterprise = db.query(Tenant).filter(
            Tenant.business_name.ilike('%devhub%')
        ).first()
    
    return founder, devhub_enterprise


def preview_cleanup(db: Session):
    """Show what will be deleted and preserved"""
    founder, devhub_enterprise = get_preserved_data(db)
    
    print("🔍 MOCK DATA CLEANUP PREVIEW")
    print("=" * 50)
    print()
    print("✅ WILL BE PRESERVED:")
    print(f"   Founder Account: {founder.email} ({founder.full_name})")
    print(f"   System ID: {founder.system_id}")
    
    if devhub_enterprise:
        print(f"   DevHub Enterprise: {devhub_enterprise.business_name}")
        print(f"   System ID: {devhub_enterprise.system_id}")
        print("   + All DevHub Enterprise users, customers, projects, and data")
    print()
    
    # Count what will be deleted
    total_to_delete = 0
    
    # Count tenants to delete
    if devhub_enterprise:
        mock_tenants = db.query(Tenant).filter(Tenant.system_id != devhub_enterprise.system_id).count()
    else:
        mock_tenants = db.query(Tenant).count()
    
    # Count users to delete (exclude founder and DevHub Enterprise users)
    mock_users_query = db.query(User).filter(User.system_id != founder.system_id)
    if devhub_enterprise:
        mock_users_query = mock_users_query.filter(User.tenant_id != devhub_enterprise.system_id)
    mock_users = mock_users_query.count()
    
    # Count other data
    all_customers = db.query(Customer).count()
    all_leads = db.query(Lead).count()
    all_projects = db.query(Project).count()
    all_interactions = db.query(CustomerInteraction).count()
    all_lead_interactions = db.query(LeadInteraction).count()
    all_notes = db.query(CustomerNote).count()
    all_assignments = db.query(ProjectAssignment).count()
    all_vault = db.query(PasswordVault).count()
    all_invoices = db.query(Invoice).count()
    
    total_to_delete = (mock_tenants + mock_users + all_customers + all_leads + 
                      all_projects + all_interactions + all_lead_interactions + 
                      all_notes + all_assignments + all_vault + all_invoices)
    
    print("🗑️  WILL BE DELETED:")
    if mock_tenants > 0:
        print(f"   Mock Tenants: {mock_tenants} records")
    if mock_users > 0:
        print(f"   Mock Users: {mock_users} records")
    if all_customers > 0:
        print(f"   All Customers: {all_customers} records")
    if all_leads > 0:
        print(f"   All Leads: {all_leads} records")
    if all_projects > 0:
        print(f"   All Projects: {all_projects} records")
    if all_interactions > 0:
        print(f"   Customer Interactions: {all_interactions} records")
    if all_lead_interactions > 0:
        print(f"   Lead Interactions: {all_lead_interactions} records")
    if all_notes > 0:
        print(f"   Customer Notes: {all_notes} records")
    if all_assignments > 0:
        print(f"   Project Assignments: {all_assignments} records")
    if all_vault > 0:
        print(f"   Password Vault: {all_vault} records")
    if all_invoices > 0:
        print(f"   Invoices: {all_invoices} records")
    
    print()
    print(f"📊 TOTAL RECORDS TO DELETE: {total_to_delete}")
    
    if total_to_delete == 0:
        print("No mock data found - database is already clean!")
        return False
    
    return True


def execute_cleanup(db: Session):
    """Execute the cleanup using direct SQL for better control"""
    founder, devhub_enterprise = get_preserved_data(db)
    
    print("🧹 EXECUTING MOCK DATA CLEANUP")
    print("=" * 40)
    
    total_deleted = 0
    
    try:
        # Delete in correct order to handle foreign keys
        
        # 1. Delete customer notes
        result = db.execute(text("DELETE FROM customer_notes"))
        count = result.rowcount
        if count > 0:
            print(f"   ✅ Deleted {count} customer notes")
            total_deleted += count
        
        # 2. Delete lead interactions  
        result = db.execute(text("DELETE FROM lead_interactions"))
        count = result.rowcount
        if count > 0:
            print(f"   ✅ Deleted {count} lead interactions")
            total_deleted += count
        
        # 3. Delete customer interactions
        result = db.execute(text("DELETE FROM customer_interactions"))
        count = result.rowcount
        if count > 0:
            print(f"   ✅ Deleted {count} customer interactions")
            total_deleted += count
        
        # 4. Delete project assignments
        result = db.execute(text("DELETE FROM project_assignments"))
        count = result.rowcount
        if count > 0:
            print(f"   ✅ Deleted {count} project assignments")
            total_deleted += count
        
        # 5. Delete project customers
        result = db.execute(text("DELETE FROM project_customers"))
        count = result.rowcount
        if count > 0:
            print(f"   ✅ Deleted {count} project-customer relationships")
            total_deleted += count
        
        # 6. Delete password vault entries (but preserve founder's)
        result = db.execute(text("DELETE FROM password_vault WHERE user_system_id != :founder_id"), 
                          {"founder_id": founder.system_id})
        count = result.rowcount
        if count > 0:
            print(f"   ✅ Deleted {count} password vault entries")
            total_deleted += count
        
        # 7. Delete invoices
        result = db.execute(text("DELETE FROM invoices"))
        count = result.rowcount
        if count > 0:
            print(f"   ✅ Deleted {count} invoices")
            total_deleted += count
        
        # 8. Delete leads
        result = db.execute(text("DELETE FROM leads"))
        count = result.rowcount
        if count > 0:
            print(f"   ✅ Deleted {count} leads")
            total_deleted += count
        
        # 9. Delete projects
        result = db.execute(text("DELETE FROM projects"))
        count = result.rowcount
        if count > 0:
            print(f"   ✅ Deleted {count} projects")
            total_deleted += count
        
        # 10. Delete customers
        result = db.execute(text("DELETE FROM customers"))
        count = result.rowcount
        if count > 0:
            print(f"   ✅ Deleted {count} customers")
            total_deleted += count
        
        # 11. Delete mock users (preserve founder and DevHub Enterprise users)
        if devhub_enterprise:
            result = db.execute(text("""
                DELETE FROM users 
                WHERE system_id != :founder_id 
                AND tenant_id != :devhub_id
            """), {
                "founder_id": founder.system_id,
                "devhub_id": devhub_enterprise.system_id
            })
        else:
            result = db.execute(text("DELETE FROM users WHERE system_id != :founder_id"), 
                              {"founder_id": founder.system_id})
        count = result.rowcount
        if count > 0:
            print(f"   ✅ Deleted {count} mock users")
            total_deleted += count
        
        # 12. Delete mock tenants (preserve DevHub Enterprise)
        if devhub_enterprise:
            result = db.execute(text("DELETE FROM tenants WHERE system_id != :devhub_id"), 
                              {"devhub_id": devhub_enterprise.system_id})
            count = result.rowcount
            if count > 0:
                print(f"   ✅ Deleted {count} mock tenants")
                total_deleted += count
        
        # Commit all changes
        db.commit()
        
        print()
        print(f"🎉 CLEANUP COMPLETE!")
        print(f"   Total mock records deleted: {total_deleted}")
        print(f"   Founder account preserved: {founder.system_id}")
        if devhub_enterprise:
            print(f"   DevHub Enterprise preserved: {devhub_enterprise.system_id}")
        
        # Verify preservation
        founder_check = db.query(User).filter(User.system_id == founder.system_id).first()
        if founder_check:
            print(f"   ✅ Founder verification: {founder_check.email} still active")
        else:
            print("   ❌ ERROR: Founder account missing after cleanup!")
        
        if devhub_enterprise:
            devhub_check = db.query(Tenant).filter(Tenant.system_id == devhub_enterprise.system_id).first()
            if devhub_check:
                print(f"   ✅ DevHub Enterprise verification: {devhub_check.business_name} still active")
            else:
                print("   ❌ ERROR: DevHub Enterprise missing after cleanup!")
        
    except Exception as e:
        print(f"❌ Error during cleanup: {e}")
        db.rollback()
        raise


def main():
    parser = argparse.ArgumentParser(description="Clean up mock data from DevHub database")
    parser.add_argument('--preview', action='store_true', help="Preview what will be deleted")
    parser.add_argument('--execute', action='store_true', help="Execute the cleanup")
    
    args = parser.parse_args()
    
    if not any([args.preview, args.execute]):
        print("Please specify an action: --preview or --execute")
        parser.print_help()
        return
    
    try:
        db = next(get_db())
        
        if args.preview:
            has_data = preview_cleanup(db)
            if has_data:
                print("💡 To execute cleanup: python simple_cleanup.py --execute")
        
        elif args.execute:
            has_data = preview_cleanup(db)
            if not has_data:
                print("No mock data to clean up!")
                return
            
            print("⚠️  WARNING: This will permanently delete all mock data!")
            print("   Only the founder account and DevHub Enterprise will be preserved.")
            print()
            
            response = input("Are you sure you want to continue? Type 'YES' to confirm: ")
            if response == 'YES':
                execute_cleanup(db)
            else:
                print("❌ Cleanup cancelled")
    
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
