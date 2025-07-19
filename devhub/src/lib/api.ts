import { ApiResponse, RecordData, CreateRecordData, UpdateRecordData, Customer, Project } from '@/types/api'

class ApiClient {
  private baseUrl = 'http://localhost:8005';
  
  private getAuthHeaders() {
    // Check if we're in browser environment
    if (typeof window === 'undefined') {
      return {};
    }
    const token = localStorage.getItem('auth_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const authHeaders = this.getAuthHeaders();
    const url = `${this.baseUrl}${endpoint}`;
    
    console.log('API Request:', { 
      url, 
      method: options.method || 'GET',
      hasAuthHeader: !!authHeaders.Authorization,
      headers: authHeaders
    });

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...options.headers,
      } as HeadersInit,
    });

    console.log('API Response:', { 
      url, 
      status: response.status, 
      statusText: response.statusText,
      ok: response.ok 
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Request failed' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Database table operations - deprecated, use specific resource endpoints
  async getTableData(tableName: string): Promise<ApiResponse<RecordData[]>> {
    // Map table names to correct endpoints
    switch (tableName) {
      case 'projects':
        return this.getProjects() as Promise<ApiResponse<RecordData[]>>;
      case 'customers':
        return this.getCustomers() as Promise<ApiResponse<RecordData[]>>;
      case 'invoices':
        return this.request('/api/v1/invoices/');
      case 'users':
        return this.getUsers() as Promise<ApiResponse<RecordData[]>>;
      default:
        return Promise.resolve({ success: false, error: `Table ${tableName} not supported` });
    }
  }

  async createRecord(tableName: string, data: CreateRecordData): Promise<ApiResponse> {
    // Map table names to correct endpoints
    switch (tableName) {
      case 'projects':
        return this.createProject(data);
      case 'customers':
        return this.createCustomer(data);
      default:
        return Promise.resolve({ success: false, error: `Create operation for ${tableName} not supported` });
    }
  }

  async updateRecord(tableName: string, systemId: string, data: UpdateRecordData): Promise<ApiResponse> {
    // Map table names to correct endpoints
    switch (tableName) {
      case 'projects':
        return this.updateProject(systemId, data);
      default:
        return Promise.resolve({ success: false, error: `Update operation for ${tableName} not supported` });
    }
  }

  async deleteRecord(tableName: string, systemId: string) {
    // Map table names to correct endpoints
    switch (tableName) {
      case 'projects':
        return this.deleteProject(systemId);
      default:
        return Promise.resolve({ success: false, error: `Delete operation for ${tableName} not supported` });
    }
  }

  // Project methods
  async getProjects(): Promise<ApiResponse<Project[]>> {
    return this.request('/api/v1/projects/');
  }

  async createProject(data: CreateRecordData): Promise<ApiResponse> {
    return this.request('/api/v1/projects/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProject(systemId: string, data: UpdateRecordData): Promise<ApiResponse> {
    return this.request(`/api/v1/projects/${systemId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProject(systemId: string): Promise<ApiResponse> {
    return this.request(`/api/v1/projects/${systemId}`, {
      method: 'DELETE',
    });
  }

  // Customer methods - using CRM endpoints (to be implemented)
  async getCustomers(): Promise<ApiResponse<Customer[]>> {
    // For now, return empty data since customers endpoint doesn't exist yet
    return Promise.resolve({ success: true, data: [], message: 'Customers endpoint not implemented yet' });
  }

  async createCustomer(data: CreateRecordData): Promise<ApiResponse> {
    // Placeholder - will need CRM endpoint implementation
    return Promise.resolve({ success: true, message: 'Customer creation not implemented yet' });
  }

  // User methods - placeholder since users endpoint doesn't exist yet
  async getUsers() {
    // For now, return empty data since users endpoint doesn't exist yet
    return Promise.resolve({ success: true, data: [], message: 'Users endpoint not implemented yet' });
  }

  // Database schema
  async getDatabaseSchema() {
    return Promise.resolve({ success: true, data: {}, message: 'Database schema endpoint not implemented yet' });
  }

  // Database management methods
  async getDatabaseOverview() {
    return Promise.resolve({ success: true, data: {}, message: 'Database overview endpoint not implemented yet' });
  }

  async validateDatabase() {
    return this.request('/api/v1/database/validate');
  }

  async validateDatabaseSilent() {
    return this.validateDatabase();
  }

  async repairDatabase() {
    return Promise.resolve({ success: true, message: 'Database repair endpoint not implemented yet' });
  }

  // New database monitoring methods
  async getDatabaseHealth() {
    return this.request('/api/v1/database/health');
  }

  async getMonitoringStatus() {
    return Promise.resolve({ success: true, data: {}, message: 'Monitoring status endpoint not implemented yet' });
  }

  async getDatabaseRelationships() {
    return Promise.resolve({ success: true, data: {}, message: 'Database relationships endpoint not implemented yet' });
  }

  async createMonitoringAlert(alertData: Record<string, unknown>): Promise<ApiResponse> {
    return Promise.resolve({ success: true, message: 'Monitoring alert endpoint not implemented yet' });
  }

  // Auth methods
  async getCurrentUser() {
    return Promise.resolve({ success: true, data: { id: 'temp_user', name: 'Demo User' }, message: 'Auth endpoint not fully implemented yet' });
  }
}

export const api = new ApiClient();
