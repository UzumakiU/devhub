# DevHub Multi-Tenant SaaS ID System Documentation

## Overview

DevHub is a multi-tenant SaaS platform with a hierarchical ID system that provides clear separation between platform control and tenant business management.

## Architecture Clarification

### **Platform Level**

- **Platform Founder (USR-000)**: DevHub Enterprise owner who controls the entire platform
- **Platform Control**: Full access to all tenant businesses and platform administration

### **Tenant Level**

- **Tenant Businesses**: Client businesses using the platform (TNT-000, TNT-001, etc.)
- **Business Owners**: Complete control within their specific tenant business
- **Business Employees**: Role-based permissions within their tenant business
- **Data Isolation**: Complete separation between different tenant businesses

### **CRM Level**

- **Customers**: External clients that tenant businesses serve (not platform users)
- **Leads**: Potential customers in the sales pipeline

## ID Structure

### System IDs (Database)

- **Format**: `PREFIX-000`, `PREFIX-001`, `PREFIX-002`, etc.
- **Purpose**: Internal database tracking, relationships, sequential numbering
- **Examples**:
  - **Platform**:
    - Platform Founder: `USR-000` (special case)
  - **Tenants**: `TNT-000`, `TNT-001`, `TNT-002`
  - **Users**: `USR-001`, `USR-002`, `USR-003`
  - **CRM**:
    - Customers: `CUS-000`, `CUS-001`, `CUS-002`
    - Leads: `LED-000`, `LED-001`, `LED-002`
  - **Business Operations**:
    - Projects: `PRJ-000`, `PRJ-001`, `PRJ-002`
    - Invoices: `INV-000`, `INV-001`, `INV-002`

### Display IDs (User-Facing)

- **Format**: Role-based display names for clarity
- **Purpose**: What users see in the interface
- **Examples**:
  - Platform Founder: `FOUNDER` (system: `USR-000`)
  - Business Owner: `BUSINESS_OWNER` (system: `USR-XXX`)
  - Regular users: `USR-001`, `USR-002`, etc.

## User Roles & Permissions

### **Platform Level**

- **FOUNDER**:
  - Controls entire platform
  - Access to all tenant businesses
  - Platform administration
  - No tenant_id (platform-wide access)

### **Tenant Level**

- **BUSINESS_OWNER**:
  - Complete control within their tenant business
  - All modules and features (based on subscription)
  - User management within their business
  - Billing and subscription management

- **MANAGER**:
  - Department or team leadership
  - Limited administrative permissions
  - Can manage assigned employees

- **EMPLOYEE**:
  - Role-based access to specific modules
  - Department-specific permissions
  - No administrative capabilities

## Data Isolation

### **Tenant Separation**

Each tenant business has completely isolated data:

```sql
-- All tenant data is filtered by tenant_id
SELECT * FROM customers WHERE tenant_id = 'TNT-001';
SELECT * FROM projects WHERE tenant_id = 'TNT-001';
SELECT * FROM users WHERE tenant_id = 'TNT-001';
```

### **Platform vs Tenant Users**

```sql
-- Platform Founder (no tenant)
SELECT * FROM users WHERE is_founder = true AND tenant_id IS NULL;

-- Tenant Business Users
SELECT * FROM users WHERE tenant_id = 'TNT-001';
```

## Examples in Practice

### **Multi-Tenant Setup**

```
Platform Founder (USR-000, FOUNDER)
├── Tenant: ACME Corp (TNT-000)
│   ├── Business Owner (USR-001, BUSINESS_OWNER)
│   ├── Sales Manager (USR-002, MANAGER, dept: sales)
│   ├── Developer (USR-003, EMPLOYEE, dept: development)
│   ├── Customers: CUS-000, CUS-001, CUS-002
│   └── Projects: PRJ-000, PRJ-001
├── Tenant: TechFlow Solutions (TNT-001)
│   ├── Business Owner (USR-004, BUSINESS_OWNER)
│   ├── Marketing Lead (USR-005, MANAGER, dept: marketing)
│   ├── Customers: CUS-003, CUS-004, CUS-005
│   └── Projects: PRJ-002, PRJ-003
```

### **Invoice Display with Tenant Context**

```
Invoice: INV-001
Tenant: ACME Corp (TNT-000)
Customer: CUS-001 (ABC Landscaping)
Created by: John Smith (BUSINESS_OWNER)
Project: PRJ-001 (Website Redesign)
```

### **Database Relations with Tenant Isolation**

```sql
-- Get all customers for a specific tenant
SELECT c.name, c.company, u.full_name as owner_name
FROM customers c
JOIN tenants t ON c.tenant_id = t.system_id
JOIN users u ON t.system_id = u.tenant_id AND u.user_role = 'BUSINESS_OWNER'
WHERE t.system_id = 'TNT-001';
```

## Benefits

1. **Multi-Tenant SaaS**: Complete data isolation between business clients
2. **Role-Based Access**: Granular permissions within each tenant business
3. **Platform Control**: Founder maintains oversight of entire platform
4. **Professional**: Clean, sequential IDs for business documents
5. **Scalable**: Ready for unlimited tenant businesses
6. **Secure**: No cross-tenant data access possible

## Migration Strategy

The system maintains backwards compatibility while adding multi-tenant architecture:

1. **Existing Data**: Current customers become part of a default tenant
2. **New Tenants**: Created with proper isolation from day one
3. **Founder Account**: Remains USR-000 with platform-wide access
4. **ID Sequences**: Continue from current numbers
