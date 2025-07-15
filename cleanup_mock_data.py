#!/usr/bin/env python3
"""
Safe Mock Data Cleanup Script for DevHub
Removes all mock data while preserving the founder account (USR-000)

This script will:
1. Preserve the founder account (USR-000) 
2. Remove all mock tenants, customers, leads, interactions, etc.
3. Show what will be deleted before confirmation
4. Create a backup option

Usage:
    python cleanup_mock_data.py --preview  # Show what will be deleted
    python cleanup_mock_data.py --execute  # Actually delete the data
    python cleanup_mock_data.py --backup   # Create backup before cleanup
"""

import sys
import os
import argparse
import json
from datetime import datetime
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


def get_founder_info(db: Session):
    """Get founder account information"""
    founder = db.query(User).filter(
        User.system_id == "USR-000",
        User.is_founder == True
    ).first()
    
    if not founder:
        print("❌ CRITICAL: Founder account (USR-000) not found!")
        print("This script requires the founder account to exist for safety.")
        sys.exit(1)
    
    return founder


def analyze_mock_data(db: Session):
    """Analyze what mock data exists in the database"""
    founder = get_founder_info(db)
    
    print(f"✅ Founder account found: {founder.email} ({founder.full_name})")
    print(f"   System ID: {founder.system_id}")
    print(f"   Created: {founder.created_at}")
    print()
    
    # Find DevHub Enterprise tenant (the actual business, not mock data)
    devhub_enterprise = db.query(Tenant).filter(
        Tenant.business_name.ilike('%devhub%enterprise%')
    ).first()
    
    if not devhub_enterprise:
        # Try other variations
        devhub_enterprise = db.query(Tenant).filter(
            Tenant.business_name.ilike('%devhub%')
        ).first()
    
    analysis = {
        'founder': {
            'id': founder.system_id,
            'email': founder.email,
            'name': founder.full_name
        },
        'devhub_enterprise': None,
        'mock_data': {}
    }
    
    if devhub_enterprise:
        analysis['devhub_enterprise'] = {
            'id': devhub_enterprise.system_id,
            'name': devhub_enterprise.business_name,
            'email': devhub_enterprise.business_email
        }
        print(f"✅ DevHub Enterprise found: {devhub_enterprise.business_name} ({devhub_enterprise.system_id})")
        print(f"   This will be PRESERVED as it's your actual business")
        print()
    
    # Analyze tenants (exclude DevHub Enterprise)
    if devhub_enterprise:
        mock_tenants = db.query(Tenant).filter(Tenant.system_id != devhub_enterprise.system_id).all()
    else:
        mock_tenants = db.query(Tenant).all()
    analysis['mock_data']['tenants'] = len(mock_tenants)
    
    # Analyze users (exclude founder and DevHub Enterprise users)
    exclude_user_filter = User.system_id != "USR-000"
    if devhub_enterprise:
        exclude_user_filter = (User.system_id != "USR-000") & (User.tenant_id != devhub_enterprise.system_id)
    
    mock_users = db.query(User).filter(exclude_user_filter).all()
    analysis['mock_data']['users'] = len(mock_users)
    
    # Analyze customers (exclude DevHub Enterprise customers)
    if devhub_enterprise:
        mock_customers = db.query(Customer).filter(Customer.tenant_id != devhub_enterprise.system_id).all()
    else:
        mock_customers = db.query(Customer).all()
    analysis['mock_data']['customers'] = len(mock_customers)
    
    # Analyze leads (exclude DevHub Enterprise leads)
    if devhub_enterprise:
        mock_leads = db.query(Lead).filter(Lead.tenant_id != devhub_enterprise.system_id).all()
    else:
        mock_leads = db.query(Lead).all()
    analysis['mock_data']['leads'] = len(mock_leads)
    
    # Analyze projects (exclude DevHub Enterprise projects)
    if devhub_enterprise:
        mock_projects = db.query(Project).filter(Project.tenant_id != devhub_enterprise.system_id).all()
    else:
        mock_projects = db.query(Project).all()
    analysis['mock_data']['projects'] = len(mock_projects)
    
    # Analyze invoices
    invoices = db.query(Invoice).all()
    analysis['mock_data']['invoices'] = len(invoices)
    
    # Analyze interactions
    customer_interactions = db.query(CustomerInteraction).all()
    lead_interactions = db.query(LeadInteraction).all()
    customer_notes = db.query(CustomerNote).all()
    
    analysis['mock_data']['customer_interactions'] = len(customer_interactions)
    analysis['mock_data']['lead_interactions'] = len(lead_interactions)
    analysis['mock_data']['customer_notes'] = len(customer_notes)
    
    # Analyze assignments and relationships
    project_assignments = db.query(ProjectAssignment).all()
    project_customers = db.query(ProjectCustomer).all()
    password_vault = db.query(PasswordVault).all()
    
    analysis['mock_data']['project_assignments'] = len(project_assignments)
    analysis['mock_data']['project_customers'] = len(project_customers)
    analysis['mock_data']['password_vault'] = len(password_vault)
    
    return analysis


def preview_cleanup(analysis):
    """Show what will be deleted"""
    print("🔍 MOCK DATA CLEANUP PREVIEW")
    print("=" * 50)
    print()
    print("✅ WILL BE PRESERVED:")
    print(f"   Founder Account: {analysis['founder']['email']} ({analysis['founder']['name']})")
    print(f"   System ID: {analysis['founder']['id']}")
    
    if analysis['devhub_enterprise']:
        print(f"   DevHub Enterprise: {analysis['devhub_enterprise']['name']}")
        print(f"   System ID: {analysis['devhub_enterprise']['id']}")
        print(f"   Email: {analysis['devhub_enterprise']['email']}")
        print("   + All DevHub Enterprise users, customers, projects, and data")
    print()
    
    print("🗑️  WILL BE DELETED:")
    mock_data = analysis['mock_data']
    total_records = sum(mock_data.values())
    
    if total_records == 0:
        print("   No mock data found - database is already clean!")
        return False
    
    for table, count in mock_data.items():
        if count > 0:
            print(f"   {table.replace('_', ' ').title()}: {count} records")
    
    print()
    print(f"📊 TOTAL MOCK RECORDS TO DELETE: {total_records}")
    print()
    
    # Show specific examples of what will be deleted
    if mock_data['tenants'] > 0:
        print("📋 Example mock tenants that will be deleted:")
        db = next(get_db())
        
        if analysis['devhub_enterprise']:
            example_tenants = db.query(Tenant).filter(
                Tenant.system_id != analysis['devhub_enterprise']['id']
            ).limit(3).all()
        else:
            example_tenants = db.query(Tenant).limit(3).all()
            
        for tenant in example_tenants:
            print(f"   - {tenant.business_name} ({tenant.system_id})")
        if mock_data['tenants'] > 3:
            print(f"   ... and {mock_data['tenants'] - 3} more")
        print()
    
    return True


def create_backup(analysis):
    """Create a backup of mock data before deletion"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_file = f"mock_data_backup_{timestamp}.json"
    
    print(f"💾 Creating backup: {backup_file}")
    
    db = next(get_db())
    backup_data = {
        'timestamp': timestamp,
        'founder_preserved': analysis['founder'],
        'deleted_data': {}
    }
    
    # Backup tenants
    tenants = db.query(Tenant).all()
    backup_data['deleted_data']['tenants'] = [
        {
            'system_id': t.system_id,
            'business_name': t.business_name,
            'business_email': t.business_email,
            'created_at': str(t.created_at)
        } for t in tenants
    ]
    
    # Backup users (excluding founder)
    users = db.query(User).filter(User.system_id != "USR-000").all()
    backup_data['deleted_data']['users'] = [
        {
            'system_id': u.system_id,
            'email': u.email,
            'full_name': u.full_name,
            'tenant_id': u.tenant_id,
            'user_role': u.user_role
        } for u in users
    ]
    
    # Backup customers
    customers = db.query(Customer).all()
    backup_data['deleted_data']['customers'] = [
        {
            'system_id': c.system_id,
            'name': c.name,
            'email': c.email,
            'company': c.company
        } for c in customers
    ]
    
    # Save backup
    with open(backup_file, 'w') as f:
        json.dump(backup_data, f, indent=2, default=str)
    
    print(f"✅ Backup created: {backup_file}")
    return backup_file


def execute_cleanup(db: Session, analysis):
    """Execute the actual cleanup"""
    print("🧹 EXECUTING MOCK DATA CLEANUP")
    print("=" * 40)
    
    devhub_enterprise_id = analysis['devhub_enterprise']['id'] if analysis['devhub_enterprise'] else None
    
    # Order is important due to foreign key constraints
    cleanup_order = [
        (CustomerNote, "customer notes", lambda q: q.filter(CustomerNote.user_id != analysis['founder']['id'])),
        (LeadInteraction, "lead interactions", lambda q: q.filter(LeadInteraction.user_id != analysis['founder']['id'])),
        (CustomerInteraction, "customer interactions", lambda q: q.filter(CustomerInteraction.user_id != analysis['founder']['id'])),
        (ProjectCustomer, "project-customer relationships", lambda q: q),
        (ProjectAssignment, "project assignments", lambda q: q.filter(ProjectAssignment.user_id != analysis['founder']['id'])),
        (PasswordVault, "password vault entries", lambda q: q.filter(PasswordVault.user_id != analysis['founder']['id'])),
        (Invoice, "invoices", lambda q: q.filter(Invoice.tenant_id != devhub_enterprise_id) if devhub_enterprise_id else q),
        (Lead, "leads", lambda q: q.filter(Lead.tenant_id != devhub_enterprise_id) if devhub_enterprise_id else q),
        (Project, "projects", lambda q: q.filter(Project.tenant_id != devhub_enterprise_id) if devhub_enterprise_id else q),
        (Customer, "customers", lambda q: q.filter(Customer.tenant_id != devhub_enterprise_id) if devhub_enterprise_id else q),
        (User, "users (excluding founder & DevHub Enterprise)", lambda q: q.filter(
            (User.system_id != analysis['founder']['id']) & 
            (User.tenant_id != devhub_enterprise_id if devhub_enterprise_id else True)
        )),
        (Tenant, "tenants (excluding DevHub Enterprise)", lambda q: q.filter(Tenant.system_id != devhub_enterprise_id) if devhub_enterprise_id else q),
    ]
    
    total_deleted = 0
    
    for model_class, description, filter_func in cleanup_order:
        try:
            query = db.query(model_class)
            filtered_query = filter_func(query)
            count = filtered_query.count()
            
            if count > 0:
                filtered_query.delete()
                print(f"   ✅ Deleted {count} {description}")
                total_deleted += count
            else:
                print(f"   ⏭️  No {description} to delete")
        except Exception as e:
            print(f"   ⚠️  Error deleting {description}: {e}")
    
    # Commit all changes
    db.commit()
    
    print()
    print(f"🎉 CLEANUP COMPLETE!")
    print(f"   Total mock records deleted: {total_deleted}")
    print(f"   Founder account preserved: {analysis['founder']['id']}")
    if devhub_enterprise_id:
        print(f"   DevHub Enterprise preserved: {devhub_enterprise_id}")
    
    # Verify founder still exists
    founder = db.query(User).filter(User.system_id == analysis['founder']['id']).first()
    if founder:
        print(f"   ✅ Founder verification: {founder.email} still active")
    else:
        print("   ❌ ERROR: Founder account missing after cleanup!")
    
    # Verify DevHub Enterprise still exists
    if devhub_enterprise_id:
        devhub_ent = db.query(Tenant).filter(Tenant.system_id == devhub_enterprise_id).first()
        if devhub_ent:
            print(f"   ✅ DevHub Enterprise verification: {devhub_ent.business_name} still active")
        else:
            print("   ❌ ERROR: DevHub Enterprise missing after cleanup!")


def main():
    parser = argparse.ArgumentParser(description="Clean up mock data from DevHub database")
    parser.add_argument('--preview', action='store_true', help="Preview what will be deleted")
    parser.add_argument('--execute', action='store_true', help="Execute the cleanup")
    parser.add_argument('--backup', action='store_true', help="Create backup before cleanup")
    
    args = parser.parse_args()
    
    if not any([args.preview, args.execute, args.backup]):
        print("Please specify an action: --preview, --execute, or --backup")
        parser.print_help()
        return
    
    try:
        db = next(get_db())
        analysis = analyze_mock_data(db)
        
        if args.preview:
            has_data = preview_cleanup(analysis)
            if has_data:
                print("💡 To execute cleanup: python cleanup_mock_data.py --execute")
                print("💡 To create backup first: python cleanup_mock_data.py --backup")
        
        elif args.backup:
            backup_file = create_backup(analysis)
            print(f"💡 Backup created. To cleanup: python cleanup_mock_data.py --execute")
        
        elif args.execute:
            has_data = preview_cleanup(analysis)
            if not has_data:
                print("No mock data to clean up!")
                return
            
            print("⚠️  WARNING: This will permanently delete all mock data!")
            print("   Only the founder account and DevHub Enterprise will be preserved.")
            print()
            
            response = input("Are you sure you want to continue? Type 'YES' to confirm: ")
            if response == 'YES':
                execute_cleanup(db, analysis)
            else:
                print("❌ Cleanup cancelled")
    
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
