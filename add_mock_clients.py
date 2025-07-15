#!/usr/bin/env python3
"""
Script to add mock business clients to DevHub CRM
"""
import requests
import json
from datetime import datetime, timedelta
import random

# Base API URL
API_BASE = 'http://localhost:8005/api'

# Remaining mock business clients (8 more since we already added 2)
mock_clients = [
    {
        'name': 'Metro Legal Associates',
        'email': 'partners@metrolegal.com',
        'phone': '+1-555-0103',
        'company': 'Metro Legal Associates',
        'address_line1': '789 Justice Boulevard',
        'address_line2': 'Floor 12',
        'city': 'New York',
        'state': 'NY',
        'postal_code': '10001',
        'country': 'US'
    },
    {
        'name': 'Sunrise Healthcare Clinic',
        'email': 'admin@sunrisehealthcare.com',
        'phone': '+1-555-0104',
        'company': 'Sunrise Healthcare Clinic',
        'address_line1': '321 Wellness Street',
        'city': 'Austin',
        'state': 'TX',
        'postal_code': '78701',
        'country': 'US'
    },
    {
        'name': 'Artisan Coffee Roasters',
        'email': 'orders@artisancoffee.com',
        'phone': '+1-555-0105',
        'company': 'Artisan Coffee Roasters',
        'address_line1': '654 Bean Avenue',
        'city': 'Seattle',
        'state': 'WA',
        'postal_code': '98101',
        'country': 'US'
    },
    {
        'name': 'Elite Construction Group',
        'email': 'projects@eliteconstruction.com',
        'phone': '+1-555-0106',
        'company': 'Elite Construction Group',
        'address_line1': '987 Builder Lane',
        'city': 'Denver',
        'state': 'CO',
        'postal_code': '80201',
        'country': 'US'
    },
    {
        'name': 'Digital Marketing Pro',
        'email': 'hello@digitalmarketingpro.com',
        'phone': '+1-555-0107',
        'company': 'Digital Marketing Pro',
        'address_line1': '147 Social Media Drive',
        'address_line2': 'Unit 8',
        'city': 'Miami',
        'state': 'FL',
        'postal_code': '33101',
        'country': 'US'
    },
    {
        'name': 'Fresh Bites Restaurant',
        'email': 'management@freshbites.com',
        'phone': '+1-555-0108',
        'company': 'Fresh Bites Restaurant',
        'address_line1': '258 Culinary Court',
        'city': 'Chicago',
        'state': 'IL',
        'postal_code': '60601',
        'country': 'US'
    },
    {
        'name': 'BlueSky Financial Advisory',
        'email': 'advisors@blueskyfinancial.com',
        'phone': '+1-555-0109',
        'company': 'BlueSky Financial Advisory',
        'address_line1': '369 Investment Plaza',
        'address_line2': 'Suite 2100',
        'city': 'Boston',
        'state': 'MA',
        'postal_code': '02101',
        'country': 'US'
    },
    {
        'name': 'Luxury Auto Detailing',
        'email': 'service@luxuryautodetailing.com',
        'phone': '+1-555-0110',
        'company': 'Luxury Auto Detailing',
        'address_line1': '741 Premium Lane',
        'city': 'Los Angeles',
        'state': 'CA',
        'postal_code': '90210',
        'country': 'US'
    }
]

def create_customer(client_data):
    """Create a customer via API"""
    try:
        response = requests.post(f'{API_BASE}/database/table/customers', json=client_data)
        if response.status_code == 200:
            result = response.json()
            return result['record']['system_id']
        else:
            print(f'❌ Failed to create {client_data["company"]}: {response.text}')
            return None
    except Exception as e:
        print(f'❌ Error creating {client_data["company"]}: {e}')
        return None

def create_lead(lead_data):
    """Create a lead via CRM API"""
    try:
        # We'll need authentication for CRM endpoints, so let's skip leads for now
        # and focus on customers only
        pass
    except Exception as e:
        print(f'❌ Error creating lead: {e}')

def main():
    print('🚀 Adding remaining 8 mock business clients...')
    
    customer_ids = []
    
    # Create customers
    for i, client in enumerate(mock_clients, 3):  # Start from 3 since we already have 2
        print(f'Creating client {i}: {client["company"]}...')
        customer_id = create_customer(client)
        if customer_id:
            customer_ids.append(customer_id)
            print(f'✅ Created customer: {client["company"]} ({customer_id})')
        else:
            print(f'❌ Failed to create: {client["company"]}')
    
    print(f'\n🎉 Successfully created {len(customer_ids)} new customers!')
    print('All Customer IDs:', customer_ids)
    
    # Now let's add some CRM data for these customers
    print('\n📊 CRM Summary:')
    print(f'- Total customers: {len(customer_ids) + 2} (including the 2 already created)')
    print(f'- Industries represented: Technology, Landscaping, Legal, Healthcare, Food & Beverage, Construction, Marketing, Finance, Automotive')
    print(f'- Geographic coverage: CA, OR, NY, TX, WA, CO, FL, IL, MA')

if __name__ == "__main__":
    main()
