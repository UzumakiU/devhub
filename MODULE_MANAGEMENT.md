# Feature Flags - Module Management

This document explains how to easily enable/disable modules in the DevHub application.

## Current Status

**Enabled Modules:**
- ✅ CRM System (focus area)
- ✅ Dashboard 
- ✅ Database Management
- ✅ Admin Panel
- ✅ Authentication

**Disabled Modules:**
- ❌ Projects (temporarily disabled)
- ❌ Customers (use CRM instead)
- ❌ Invoices (temporarily disabled)

## How to Enable/Disable Modules

### Frontend (Next.js)

Edit `/devhub/src/lib/config.ts`:

```typescript
export const featureFlags = {
  // To enable projects module:
  projects: true,  // Change from false to true
  
  // To enable customers module:
  customers: true, // Change from false to true
  
  // To enable invoices module:
  invoices: true,  // Change from false to true
}
```

### Backend (FastAPI)

Edit `/devhub-api/src/devhub_api/main.py`:

```python
FEATURE_FLAGS = {
    # To enable projects module:
    "projects": True,  # Change from False to True
    
    # To enable customers module:
    "customers": True, # Change from False to True
    
    # To enable invoices module:
    "invoices": True,  # Change from False to True
}
```

## What Happens When You Enable a Module

1. **Navigation**: Module appears in the main navigation menu
2. **Routes**: Module routes become accessible (no longer redirect to CRM)
3. **Pages**: Module pages display their full functionality
4. **API**: Backend endpoints become available (if implemented)

## Implementation Details

### Frontend Protection
- **Middleware**: `/devhub/src/middleware.ts` - Redirects disabled routes to CRM
- **Layout**: Navigation items are filtered based on feature flags
- **Pages**: Disabled pages show a "coming soon" message with CRM redirection

### Backend Protection
- **Feature Check**: `check_feature_enabled()` function for endpoint protection
- **API Response**: Disabled endpoints return 503 with helpful error message

## Why This Approach?

1. **Easy Toggle**: Single configuration change to enable/disable
2. **No Data Loss**: Original implementations are preserved
3. **User Guidance**: Clear messaging about what's available
4. **Development Focus**: Allows concentration on CRM without removing other work

## Restoring Original Functionality

When ready to restore a module:

1. Change the feature flag to `true`
2. The original page implementation will automatically become active
3. All navigation and routing will work normally
4. No code restoration needed - just configuration change

## Quick Commands

**Enable all modules:**
```bash
# Frontend
sed -i 's/: false,/: true,/g' devhub/src/lib/config.ts

# Backend  
sed -i 's/: False,/: True,/g' devhub-api/src/devhub_api/main.py
```

**Check current status:**
```bash
curl http://localhost:8005/api/features
```
