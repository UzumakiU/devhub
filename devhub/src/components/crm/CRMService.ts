import { CRMAnalytics } from './types'

export class CRMService {
  private baseUrl = 'http://localhost:8005/api/v1/crm'

  constructor(private token: string) {}

  async fetchAnalytics(): Promise<CRMAnalytics> {
    const url = `${this.baseUrl}/analytics/dashboard`
    console.log('Fetching CRM analytics from:', url)
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    // Only add Authorization header if token exists
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    console.log('Request headers:', headers)

    const response = await fetch(url, {
      headers,
    })

    console.log('Response status:', response.status)
    console.log('Response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Error response body:', errorText)
      throw new Error(`Failed to fetch CRM analytics: ${response.status} ${response.statusText}`)
    }

    const responseText = await response.text()
    console.log('Raw response:', responseText.substring(0, 200) + '...')
    
    try {
      const data = JSON.parse(responseText)
      console.log('Parsed CRM Analytics response:', data)
      return data
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      console.error('Response was not valid JSON:', responseText)
      throw new Error('Invalid JSON response from server')
    }
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
