class ApiClient {
  private baseUrl = 'http://localhost:8005';
  
  private getAuthHeaders() {
    const token = localStorage.getItem('auth_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const authHeaders = this.getAuthHeaders();
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...options.headers,
      } as HeadersInit,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Request failed' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Database table operations
  async getTableData(tableName: string) {
    return this.request(`/api/database/table/${tableName}`);
  }

  async createRecord(tableName: string, data: any) {
    return this.request(`/api/database/table/${tableName}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRecord(tableName: string, systemId: string, data: any) {
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
  async getProjects() {
    return this.getTableData('projects');
  }

  async createProject(data: any) {
    return this.createRecord('projects', data);
  }

  async updateProject(systemId: string, data: any) {
    return this.updateRecord('projects', systemId, data);
  }

  async deleteProject(systemId: string) {
    return this.deleteRecord('projects', systemId);
  }

  // Customer methods
  async getCustomers() {
    return this.getTableData('customers');
  }

  async createCustomer(data: any) {
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

  // Auth methods
  async getCurrentUser() {
    return this.request('/api/auth/me');
  }
}

export const api = new ApiClient();
