import { Lead, LeadFormData } from './types'

export class LeadService {
  private baseUrl = 'http://localhost:8005/api/crm/leads'

  constructor(private token: string) {}

  async fetchLeads(stage?: string): Promise<Lead[]> {
    const url = new URL(this.baseUrl)
    if (stage) {
      url.searchParams.append('stage', stage)
    }

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch leads')
    }

    const data = await response.json()
    return data.leads || []
  }

  async createLead(formData: LeadFormData): Promise<void> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })

    if (!response.ok) {
      throw new Error('Failed to create lead')
    }
  }

  async convertLead(leadId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${leadId}/convert`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to convert lead')
    }
  }
}
