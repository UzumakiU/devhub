# DevHub ID System Documentation

## Overview

DevHub uses a dual-ID system that combines simplicity with special roles:

## ID Structure

### System IDs (Database)

- **Format**: `PREFIX-000`, `PREFIX-001`, `PREFIX-002`, etc.
- **Purpose**: Internal database tracking, relationships, sequential numbering
- **Examples**:
  - Users: `USR-000`, `USR-001`, `USR-002`
  - Projects: `PRJ-000`, `PRJ-001`, `PRJ-002`
  - Customers: `CUS-000`, `CUS-001`, `CUS-002`
  - Invoices: `INV-000`, `INV-001`, `INV-002`

### Display IDs (User-Facing)

- **Format**: Usually same as System ID, except for special roles
- **Purpose**: What users see in the interface
- **Examples**:
  - Founder: `FOUNDER` (special display, but `USR-000` in database)
  - Regular users: `USR-001`, `USR-002`, etc.

## Founder Account

- **System ID**: `USR-000` (maintains sequential system)
- **Display ID**: `FOUNDER` (special status)
- **Auth Token**: Contains `is_founder: true` flag
- **Future Multi-Tenant**: Other tenants get their own founder with different system ID

## ID Generation Process

1. **New User Created**:
   - System generates: `USR-001`
   - Display ID: `USR-001` (same, unless special role)
   - Database stores both

2. **Founder Login**:
   - Database ID: `USR-000`
   - Display ID: `FOUNDER`
   - JWT contains founder flag

3. **Project Assignment**:
   - Project: `PRJ-001`
   - Owner: `USR-000` (founder's system ID)
   - UI shows: "Owner: FOUNDER"

## Benefits

1. **Simple**: Easy to remember and reference
2. **Professional**: Clean IDs in reports and invoices
3. **Secure**: Internal IDs don't expose business volume
4. **Flexible**: Special roles can have custom display names
5. **Future-Proof**: Ready for multi-tenant expansion

## Examples in Practice

### Invoice Display

```
Invoice: INV-001
Customer: CUS-001 (ACME Corp)
Created by: FOUNDER
Project: PRJ-001 (Website Redesign)
```

### Database Relations

```sql
SELECT i.id, i.customer_id, u.display_id as created_by
FROM invoices i
JOIN users u ON i.created_by = u.id
WHERE i.id = 'INV-001';

-- Returns: INV-001, CUS-001, FOUNDER
```

This system gives you the simplicity you want while maintaining professional appearance and future scalability.
