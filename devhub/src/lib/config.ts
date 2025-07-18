export const config = {
  tenantId: process.env.NEXT_PUBLIC_TENANT_ID || 'your_business',
  tenantName: process.env.NEXT_PUBLIC_TENANT_NAME || 'DevHub Enterprise',
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8005',
};

// Feature flags - easily toggle modules on/off
export const featureFlags = {
  // Core modules (always enabled)
  crm: true,
  dashboard: true,
  admin: true,
  database: true,
  
  // Temporarily disabled modules (focusing on CRM first)
  projects: false,
  invoices: false,
  
  // Future modules
  reports: false,
  analytics: false,
  integrations: false,
};

export const routes = {
  home: '/',
  login: '/auth/login',
  register: '/auth/register',
  dashboard: '/dashboard',
  projects: '/projects',
  invoices: '/invoices',
  admin: '/admin',
  crm: '/crm',
  database: '/database',
};
