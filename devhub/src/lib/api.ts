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

  // Database table operations
  async getTableData(tableName: string): Promise<ApiResponse<RecordData[]>> {
    return this.request(`/api/database/table/${tableName}`);
  }

  async createRecord(tableName: string, data: CreateRecordData): Promise<ApiResponse> {
    return this.request(`/api/database/table/${tableName}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRecord(tableName: string, systemId: string, data: UpdateRecordData): Promise<ApiResponse> {
    return this.request(`/api/database/table/${tableName}/${systemId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteRecord(tableName: string, systemId: string) {
    return this.request(`/api/database/table/${tableName}/${systemId}`, {
      method: 'DELETE',
    });
  }

  // Project methods
  async getProjects(): Promise<ApiResponse<Project[]>> {
    return this.getTableData('projects') as Promise<ApiResponse<Project[]>>;
  }

  async createProject(data: CreateRecordData): Promise<ApiResponse> {
    return this.createRecord('projects', data);
  }

  async updateProject(systemId: string, data: UpdateRecordData): Promise<ApiResponse> {
    return this.updateRecord('projects', systemId, data);
  }

  async deleteProject(systemId: string): Promise<ApiResponse> {
    return this.deleteRecord('projects', systemId);
  }

  // Customer methods
  async getCustomers(): Promise<ApiResponse<Customer[]>> {
    return this.getTableData('customers') as Promise<ApiResponse<Customer[]>>;
  }

  async createCustomer(data: CreateRecordData): Promise<ApiResponse> {
    return this.createRecord('customers', data);
  }

  // User methods
  async getUsers() {
    return this.getTableData('users');
  }

  // Database schema
  async getDatabaseSchema() {
    return this.request('/api/database/schema');
  }

  // Database management methods
  async getDatabaseOverview() {
    return this.request('/api/database/overview');
  }

  async validateDatabase() {
    return this.request('/api/database/validate', { method: 'POST' });
  }

  async validateDatabaseSilent() {
    return this.request('/api/database/validate');
  }

  async repairDatabase() {
    return this.request('/api/database/repair', { method: 'POST' });
  }

  // New database monitoring methods
  async getDatabaseHealth() {
    return this.request('/api/database/health');
  }

  async getMonitoringStatus() {
    return this.request('/api/database/monitoring/status');
  }

  async getDatabaseRelationships() {
    return this.request('/api/database/relationships');
  }

  async createMonitoringAlert(alertData: Record<string, unknown>): Promise<ApiResponse> {
    return this.request('/api/database/monitoring/alert', {
      method: 'POST',
      body: JSON.stringify(alertData),
    });
  }

  // Auth methods
  async getCurrentUser() {
    return this.request('/api/auth/me');
  }
}

export const api = new ApiClient();
