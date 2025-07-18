-- Add sample data to populate database tables for testing
-- This script adds realistic sample data to show in the database management page

-- First, let's check if we have a tenant
INSERT INTO tenants (system_id, name, is_active, created_at, updated_at) 
VALUES ('TEN-001', 'DevHub Demo', true, NOW(), NOW())
ON CONFLICT (system_id) DO NOTHING;

-- Add some customers
INSERT INTO customers (system_id, name, email, phone, company, address_line1, city, state, country, is_active, created_at, updated_at, tenant_id) 
VALUES 
  ('CUS-001', 'John Smith', 'john@acme.com', '+1-555-0101', 'Acme Corporation', '123 Business Ave', 'New York', 'NY', 'US', true, NOW(), NOW(), 'TEN-001'),
  ('CUS-002', 'Sarah Johnson', 'sarah@techinnovators.com', '+1-555-0102', 'Tech Innovators Inc', '456 Innovation Dr', 'San Francisco', 'CA', 'US', true, NOW(), NOW(), 'TEN-001'),
  ('CUS-003', 'Mike Wilson', 'mike@globalsolutions.com', '+1-555-0103', 'Global Solutions Ltd', '789 Enterprise Blvd', 'Austin', 'TX', 'US', true, NOW(), NOW(), 'TEN-001'),
  ('CUS-004', 'Emily Davis', 'emily@startuplife.com', '+1-555-0104', 'Startup Life', '321 Venture Way', 'Seattle', 'WA', 'US', true, NOW(), NOW(), 'TEN-001'),
  ('CUS-005', 'David Brown', 'david@enterprisecorp.com', '+1-555-0105', 'Enterprise Corp', '654 Corporate Plaza', 'Chicago', 'IL', 'US', true, NOW(), NOW(), 'TEN-001')
ON CONFLICT (system_id) DO NOTHING;

-- Add some leads  
INSERT INTO leads (system_id, name, email, phone, company, source, status, estimated_value, notes, created_at, updated_at, tenant_id) 
VALUES 
  ('LED-001', 'Alice Cooper', 'alice@newstartup.com', '+1-555-0201', 'New Startup Inc', 'Website', 'new', 15000, 'Interested in web development services', NOW(), NOW(), 'TEN-001'),
  ('LED-002', 'Bob Anderson', 'bob@bigcorp.com', '+1-555-0202', 'BigCorp Ltd', 'Referral', 'qualified', 50000, 'Large enterprise project, mobile app development', NOW(), NOW(), 'TEN-001'),
  ('LED-003', 'Carol White', 'carol@smallbiz.com', '+1-555-0203', 'Small Business Co', 'Cold Call', 'contacted', 8000, 'Basic website and SEO services', NOW(), NOW(), 'TEN-001'),
  ('LED-004', 'Frank Miller', 'frank@techhub.com', '+1-555-0204', 'Tech Hub Solutions', 'Social Media', 'proposal', 25000, 'Custom software development', NOW(), NOW(), 'TEN-001')
ON CONFLICT (system_id) DO NOTHING;

-- Add some projects
INSERT INTO projects (system_id, name, description, status, start_date, end_date, budget, customer_id, created_at, updated_at, tenant_id) 
VALUES 
  ('PRJ-001', 'Website Redesign', 'Complete website redesign with modern UI/UX and responsive design', 'in_progress', NOW() - INTERVAL '30 days', NOW() + INTERVAL '60 days', 25000.00, 'CUS-001', NOW(), NOW(), 'TEN-001'),
  ('PRJ-002', 'Mobile App Development', 'Native iOS and Android app for customer portal', 'planning', NOW(), NOW() + INTERVAL '120 days', 50000.00, 'CUS-002', NOW(), NOW(), 'TEN-001'),
  ('PRJ-003', 'E-commerce Platform', 'Custom e-commerce solution with payment integration', 'completed', NOW() - INTERVAL '90 days', NOW() - INTERVAL '10 days', 35000.00, 'CUS-003', NOW(), NOW(), 'TEN-001'),
  ('PRJ-004', 'Data Migration', 'Legacy system data migration to cloud infrastructure', 'in_progress', NOW() - INTERVAL '15 days', NOW() + INTERVAL '30 days', 15000.00, 'CUS-004', NOW(), NOW(), 'TEN-001'),
  ('PRJ-005', 'API Development', 'RESTful API development for third-party integrations', 'on_hold', NOW() + INTERVAL '30 days', NOW() + INTERVAL '90 days', 20000.00, 'CUS-005', NOW(), NOW(), 'TEN-001')
ON CONFLICT (system_id) DO NOTHING;

-- Add some invoices
INSERT INTO invoices (system_id, invoice_number, customer_id, project_id, amount, tax_amount, total_amount, status, issue_date, due_date, created_at, updated_at, tenant_id) 
VALUES 
  ('INV-001', 'INV-2024-001', 'CUS-001', 'PRJ-001', 5000.00, 450.00, 5450.00, 'paid', NOW() - INTERVAL '45 days', NOW() - INTERVAL '15 days', NOW(), NOW(), 'TEN-001'),
  ('INV-002', 'INV-2024-002', 'CUS-002', 'PRJ-002', 12500.00, 1125.00, 13625.00, 'pending', NOW() - INTERVAL '15 days', NOW() + INTERVAL '15 days', NOW(), NOW(), 'TEN-001'),
  ('INV-003', 'INV-2024-003', 'CUS-003', 'PRJ-003', 35000.00, 3150.00, 38150.00, 'paid', NOW() - INTERVAL '60 days', NOW() - INTERVAL '30 days', NOW(), NOW(), 'TEN-001'),
  ('INV-004', 'INV-2024-004', 'CUS-004', 'PRJ-004', 7500.00, 675.00, 8175.00, 'sent', NOW() - INTERVAL '5 days', NOW() + INTERVAL '25 days', NOW(), NOW(), 'TEN-001'),
  ('INV-005', 'INV-2024-005', 'CUS-001', 'PRJ-001', 8500.00, 765.00, 9265.00, 'draft', NULL, NULL, NOW(), NOW(), 'TEN-001')
ON CONFLICT (system_id) DO NOTHING;

-- Add some customer interactions
INSERT INTO customer_interactions (system_id, customer_id, type, subject, notes, interaction_date, created_at, updated_at, tenant_id) 
VALUES 
  ('INT-001', 'CUS-001', 'email', 'Project kickoff meeting', 'Scheduled initial meeting to discuss website redesign requirements. Client very enthusiastic about the project.', NOW() - INTERVAL '30 days', NOW(), NOW(), 'TEN-001'),
  ('INT-002', 'CUS-001', 'call', 'Design approval', 'Client approved the wireframes and mockups. Ready to proceed with development phase.', NOW() - INTERVAL '20 days', NOW(), NOW(), 'TEN-001'),
  ('INT-003', 'CUS-002', 'meeting', 'Budget discussion', 'Discussed project budget and payment milestones. Agreed on 50% upfront, 30% at beta, 20% at completion.', NOW() - INTERVAL '25 days', NOW(), NOW(), 'TEN-001'),
  ('INT-004', 'CUS-003', 'email', 'Project completion', 'E-commerce platform successfully launched. Client very satisfied with the results.', NOW() - INTERVAL '10 days', NOW(), NOW(), 'TEN-001'),
  ('INT-005', 'CUS-004', 'call', 'Migration progress update', 'Data migration is 60% complete. Discussed timeline for remaining phases.', NOW() - INTERVAL '5 days', NOW(), NOW(), 'TEN-001')
ON CONFLICT (system_id) DO NOTHING;

-- Add some customer notes
INSERT INTO customer_notes (system_id, customer_id, title, content, created_at, updated_at, tenant_id) 
VALUES 
  ('NOTE-001', 'CUS-001', 'Technical Requirements', 'Client needs responsive design, SEO optimization, and CMS integration. Prefers WordPress as CMS platform.', NOW() - INTERVAL '35 days', NOW(), 'TEN-001'),
  ('NOTE-002', 'CUS-002', 'Contact Preferences', 'Best to reach via email between 9 AM - 5 PM PST. Prefers detailed project updates weekly.', NOW() - INTERVAL '28 days', NOW(), 'TEN-001'),
  ('NOTE-003', 'CUS-003', 'Payment Terms', 'Always pays invoices promptly. Excellent client for long-term partnership opportunities.', NOW() - INTERVAL '45 days', NOW(), 'TEN-001'),
  ('NOTE-004', 'CUS-004', 'Technical Constraints', 'Legacy system is on SQL Server 2008. Need to ensure compatibility during migration process.', NOW() - INTERVAL '20 days', NOW(), 'TEN-001')
ON CONFLICT (system_id) DO NOTHING;

-- Add some lead interactions
INSERT INTO lead_interactions (system_id, lead_id, type, subject, notes, interaction_date, created_at, updated_at, tenant_id) 
VALUES 
  ('LINT-001', 'LED-001', 'email', 'Initial contact', 'Sent welcome email and company portfolio. Lead showed interest in our web development services.', NOW() - INTERVAL '7 days', NOW(), NOW(), 'TEN-001'),
  ('LINT-002', 'LED-002', 'call', 'Discovery call', 'Had detailed discussion about their mobile app requirements. Very promising lead with substantial budget.', NOW() - INTERVAL '5 days', NOW(), NOW(), 'TEN-001'),
  ('LINT-003', 'LED-003', 'meeting', 'Proposal presentation', 'Presented our proposal for website and SEO services. Lead requested some modifications to the timeline.', NOW() - INTERVAL '3 days', NOW(), NOW(), 'TEN-001'),
  ('LINT-004', 'LED-004', 'email', 'Follow-up', 'Sent revised proposal with custom software development timeline and pricing.', NOW() - INTERVAL '1 day', NOW(), NOW(), 'TEN-001')
ON CONFLICT (system_id) DO NOTHING;

-- Display summary of added data
SELECT 'Data Summary' as info;
SELECT 'Customers' as table_name, COUNT(*) as record_count FROM customers
UNION ALL
SELECT 'Leads', COUNT(*) FROM leads  
UNION ALL
SELECT 'Projects', COUNT(*) FROM projects
UNION ALL
SELECT 'Invoices', COUNT(*) FROM invoices
UNION ALL
SELECT 'Customer Interactions', COUNT(*) FROM customer_interactions
UNION ALL
SELECT 'Customer Notes', COUNT(*) FROM customer_notes
UNION ALL
SELECT 'Lead Interactions', COUNT(*) FROM lead_interactions;
