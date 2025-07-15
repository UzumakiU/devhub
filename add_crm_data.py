#!/usr/bin/env python3
"""
Script to add CRM leads and interactions for our mock clients
"""
import requests
import json
from datetime import datetime, timedelta
import random

# Base API URL
API_BASE = 'http://localhost:8005/api'

# Customer IDs we just created
customer_ids = ['CUS-010', 'CUS-011', 'CUS-012', 'CUS-013', 'CUS-014', 'CUS-015', 'CUS-016', 'CUS-017', 'CUS-018', 'CUS-019']

# Mock leads for different industries
mock_leads = [
    {
        'name': 'InnovateTech Startup',
        'email': 'founder@innovatetech.com',
        'phone': '+1-555-0201',
        'company': 'InnovateTech Startup',
        'job_title': 'CEO',
        'source': 'website',
        'lead_score': 85,
        'qualification_status': 'qualified',
        'stage': 'proposal',
        'estimated_value': 75000,
        'probability': 70,
        'city': 'Palo Alto',
        'state': 'CA'
    },
    {
        'name': 'Urban Gardens LLC',
        'email': 'contact@urbangardens.com',
        'phone': '+1-555-0202',
        'company': 'Urban Gardens LLC',
        'job_title': 'Operations Manager',
        'source': 'referral',
        'lead_score': 60,
        'qualification_status': 'new',
        'stage': 'contacted',
        'estimated_value': 25000,
        'probability': 40,
        'city': 'Sacramento',
        'state': 'CA'
    },
    {
        'name': 'City Law Firm',
        'email': 'intake@citylawfirm.com',
        'phone': '+1-555-0203',
        'company': 'City Law Firm',
        'job_title': 'Managing Partner',
        'source': 'cold_call',
        'lead_score': 90,
        'qualification_status': 'qualified',
        'stage': 'negotiation',
        'estimated_value': 120000,
        'probability': 85,
        'city': 'Chicago',
        'state': 'IL'
    },
    {
        'name': 'Wellness Center Plus',
        'email': 'director@wellnesscenterplus.com',
        'phone': '+1-555-0204',
        'company': 'Wellness Center Plus',
        'job_title': 'Medical Director',
        'source': 'social_media',
        'lead_score': 70,
        'qualification_status': 'qualified',
        'stage': 'proposal',
        'estimated_value': 45000,
        'probability': 60,
        'city': 'Phoenix',
        'state': 'AZ'
    },
    {
        'name': 'Premium Auto Services',
        'email': 'owner@premiumauto.com',
        'phone': '+1-555-0205',
        'company': 'Premium Auto Services',
        'job_title': 'Owner',
        'source': 'event',
        'lead_score': 55,
        'qualification_status': 'new',
        'stage': 'prospect',
        'estimated_value': 15000,
        'probability': 25,
        'city': 'Las Vegas',
        'state': 'NV'
    }
]

# Sample customer interactions
interaction_types = ['call', 'email', 'meeting', 'note']
subjects = [
    'Initial consultation call',
    'Project requirements discussion',
    'Follow-up on proposal',
    'Contract negotiation',
    'Monthly check-in',
    'Technical support request',
    'Service feedback session',
    'Renewal discussion',
    'Upselling opportunity',
    'Issue resolution'
]

outcomes = [
    'Positive response, next steps scheduled',
    'Needs more information, sending details',
    'Ready to proceed with contract',
    'Considering options, follow up in 2 weeks',
    'Very satisfied with current service',
    'Some concerns addressed, relationship strengthened',
    'Identified new opportunity',
    'Issue resolved successfully',
    'Feedback incorporated into service improvement',
    'Scheduled next phase of project'
]

def create_lead(lead_data):
    """Create a lead via CRM API"""
    try:
        # Use the correct table name with underscores
        response = requests.post(f'{API_BASE}/database/table/leads', json=lead_data)
        if response.status_code == 200:
            result = response.json()
            return result['record']['system_id']
        else:
            print(f'❌ Failed to create lead {lead_data["company"]}: {response.text}')
            return None
    except Exception as e:
        print(f'❌ Error creating lead {lead_data["company"]}: {e}')
        return None

def create_customer_interaction(customer_id, interaction_data):
    """Create a customer interaction"""
    try:
        # Use the correct table name with underscores
        response = requests.post(f'{API_BASE}/database/table/customer_interactions', json=interaction_data)
        if response.status_code == 200:
            result = response.json()
            return result['record']['system_id']
        else:
            print(f'❌ Failed to create interaction for {customer_id}: {response.text}')
            return None
    except Exception as e:
        print(f'❌ Error creating interaction for {customer_id}: {e}')
        return None

def main():
    print('🎯 Adding CRM leads and customer interactions...')
    
    # Create leads
    print('\n📈 Creating mock leads...')
    lead_ids = []
    for i, lead in enumerate(mock_leads, 1):
        print(f'Creating lead {i}: {lead["company"]}...')
        lead_id = create_lead(lead)
        if lead_id:
            lead_ids.append(lead_id)
            print(f'✅ Created lead: {lead["company"]} ({lead_id})')
    
    # Create customer interactions (2-3 per customer)
    print('\n💬 Creating customer interactions...')
    interaction_count = 0
    
    for customer_id in customer_ids[:5]:  # Add interactions for first 5 customers
        num_interactions = random.randint(2, 4)
        print(f'\\nAdding {num_interactions} interactions for {customer_id}...')
        
        for j in range(num_interactions):
            # Create realistic interaction data
            interaction_data = {
                'customer_id': customer_id,
                'user_id': 'USR-000',  # Assuming founder user
                'interaction_type': random.choice(interaction_types),
                'subject': random.choice(subjects),
                'description': f'Detailed discussion about {random.choice(subjects).lower()}',
                'outcome': random.choice(outcomes),
                'priority': random.choice(['low', 'medium', 'high']),
                'status': 'completed',
                'is_billable': random.choice([True, False]),
                'billable_hours': round(random.uniform(0.5, 3.0), 1) if random.choice([True, False]) else None,
                'completed_at': (datetime.now() - timedelta(days=random.randint(1, 30))).isoformat()
            }
            
            interaction_id = create_customer_interaction(customer_id, interaction_data)
            if interaction_id:
                interaction_count += 1
                print(f'  ✅ Added interaction: {interaction_data["subject"]} ({interaction_id})')
    
    print(f'\\n🎉 CRM Data Creation Summary:')
    print(f'✅ Created {len(lead_ids)} leads')
    print(f'✅ Created {interaction_count} customer interactions')
    print(f'✅ Total customers: {len(customer_ids)}')
    print(f'\\n📊 Your CRM now has realistic data for testing!')

if __name__ == "__main__":
    main()
