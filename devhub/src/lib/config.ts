export const config = {
  tenantId: process.env.NEXT_PUBLIC_TENANT_ID || 'your_business',
  tenantName: process.env.NEXT_PUBLIC_TENANT_NAME || 'DevHub Enterprise',
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8005',
};

export const routes = {
  home: '/',
  login: '/auth/login',
  register: '/auth/register',
  dashboard: '/dashboard',
  projects: '/projects',
  customers: '/customers',
  invoices: '/invoices',
  admin: '/admin',
};
