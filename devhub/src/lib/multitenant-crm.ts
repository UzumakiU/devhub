/**
 * Multi-Tenant CRM Service for DevHub Frontend
 */

export interface Customer {
  id: string;
  tenant_id: string;
  company: string;
  name: string;
  email: string;
  phone?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Lead {
  id: string;
  tenant_id: string;
  lead_id: string;
  company: string;
  name: string;
  email: string;
  phone?: string;
  stage: string;
  source?: string;
  job_title?: string;
  assigned_to?: string;
  qualification_status?: string;
  converted_to_customer: boolean;
  notes?: string;
  estimated_value?: number;
  created_at: string;
  updated_at: string;
}

export interface CRMAnalytics {
  customer_metrics: {
    total_customers: number;
    active_customers: number;
    new_customers_this_month: number;
  };
  lead_metrics: {
    total_leads: number;
    qualified_leads: number;
    converted_leads: number;
    conversion_rate: number;
  };
  project_metrics: {
    total_projects: number;
    active_projects: number;
  };
}

export interface CustomerInteraction {
  id: string;
  customer_id: string;
  type: string;
  subject: string;
  description: string;
  notes?: string;
  date?: string;
  created_at: string;
  updated_at: string;
}

export class MultiTenantCRMService {
  private baseUrl: string;
  private tenantId: string;

  constructor(tenantId: string, baseUrl: string = 'http://localhost:8005') {
    this.baseUrl = baseUrl;
    this.tenantId = tenantId;
  }

  private async fetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const url = `${this.baseUrl}/api/v1/multitenant/tenants/${this.tenantId}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
  }

  // CRM Analytics
  async getCRMAnalytics(): Promise<CRMAnalytics> {
    const response = await this.fetch('/crm/analytics');
    return await response.json();
  }

  // Customer Management
  async getCustomers(): Promise<Customer[]> {
    const response = await this.fetch('/customers');
    return await response.json();
  }

  async createCustomer(customerData: Partial<Customer>): Promise<Customer> {
    const response = await this.fetch('/customers', {
      method: 'POST',
      body: JSON.stringify(customerData),
    });
    return await response.json();
  }

  async getCustomerInteractions(customerId: string): Promise<CustomerInteraction[]> {
    const response = await this.fetch(`/customers/${customerId}/interactions`);
    return await response.json();
  }

  async createCustomerInteraction(
    customerId: string,
    interactionData: Partial<CustomerInteraction>
  ): Promise<CustomerInteraction> {
    const response = await this.fetch(`/customers/${customerId}/interactions`, {
      method: 'POST',
      body: JSON.stringify(interactionData),
    });
    return await response.json();
  }

  // Lead Management
  async getLeads(): Promise<Lead[]> {
    const response = await this.fetch('/leads');
    return await response.json();
  }

  async createLead(leadData: Partial<Lead>): Promise<Lead> {
    const response = await this.fetch('/leads', {
      method: 'POST',
      body: JSON.stringify(leadData),
    });
    return await response.json();
  }

  async getLeadsByStage(stage: string): Promise<Lead[]> {
    const response = await this.fetch(`/leads?stage=${encodeURIComponent(stage)}`);
    return await response.json();
  }

  async getLeadsBySource(source: string): Promise<Lead[]> {
    const response = await this.fetch(`/leads?source=${encodeURIComponent(source)}`);
    return await response.json();
  }
}

// Default tenant ID - in a real app, this would come from user authentication
export const DEFAULT_TENANT_ID = 'TNT-001';

// Default service instance
export const crmService = new MultiTenantCRMService(DEFAULT_TENANT_ID);
