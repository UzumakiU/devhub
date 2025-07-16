import { CRMAnalytics } from './types'

export class CRMService {
  private baseUrl = 'http://localhost:8005/api/crm'

  constructor(private token: string) {}

  async fetchAnalytics(): Promise<CRMAnalytics> {
    const response = await fetch(`${this.baseUrl}/analytics/dashboard`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch CRM analytics')
    }

    return response.json()
  }

  async fetchCustomers() {
    const response = await fetch(`${this.baseUrl}/customers`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch customers')
    }

    const data = await response.json()
    return data.customers || []
  }

  async fetchInteractions() {
    const response = await fetch(`${this.baseUrl}/interactions`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch interactions')
    }

    const data = await response.json()
    return data.interactions || []
  }
}
