-- Simple sample data for database demonstration
-- Using actual table schema columns

-- Add a tenant first
INSERT INTO tenants (system_id, business_name, business_email, is_active) 
VALUES ('TEN-001', 'DevHub Demo Company', 'demo@devhub.com', true)
ON CONFLICT (system_id) DO NOTHING;

-- Add some customers (using actual column names from \d customers)
INSERT INTO customers (system_id, name, email, phone, company, address_line1, city, state, country, is_active, tenant_id) 
VALUES 
  ('CUS-001', 'John Smith', 'john@acme.com', '+1-555-0101', 'Acme Corporation', '123 Business Ave', 'New York', 'NY', 'US', true, 'TEN-001'),
  ('CUS-002', 'Sarah Johnson', 'sarah@techinnovators.com', '+1-555-0102', 'Tech Innovators Inc', '456 Innovation Dr', 'San Francisco', 'CA', 'US', true, 'TEN-001'),
  ('CUS-003', 'Mike Wilson', 'mike@globalsolutions.com', '+1-555-0103', 'Global Solutions Ltd', '789 Enterprise Blvd', 'Austin', 'TX', 'US', true, 'TEN-001')
ON CONFLICT (system_id) DO NOTHING;

-- Show what we added
SELECT 'Added sample data successfully!' as message;
SELECT 'Tenants: ' || COUNT(*) as count FROM tenants;
SELECT 'Customers: ' || COUNT(*) as count FROM customers;
