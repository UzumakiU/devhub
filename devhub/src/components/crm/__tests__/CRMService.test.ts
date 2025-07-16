import { CRMService } from '../CRMService'

// Mock fetch globally
global.fetch = jest.fn()

describe('CRMService', () => {
  const mockFetch = fetch as jest.MockedFunction<typeof fetch>
  let crmService: CRMService

  beforeEach(() => {
    jest.clearAllMocks()
    crmService = new CRMService('test-token')
  })

  describe('fetchAnalytics', () => {
    it('fetches analytics successfully', async () => {
      const mockAnalytics = {
        totalCustomers: 150,
        totalInteractions: 89,
        conversionRate: 12.5,
        averageDealSize: 5000,
        totalRevenue: 125000,
        newLeadsThisMonth: 45,
        activeDeals: 23,
        closedDealsThisMonth: 8
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAnalytics
      } as Response)

      const result = await crmService.fetchAnalytics()
      
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8005/api/crm/analytics/dashboard',
        {
          headers: {
            'Authorization': 'Bearer test-token',
            'Content-Type': 'application/json',
          },
        }
      )
      expect(result).toEqual(mockAnalytics)
    })

    it('handles fetch error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(crmService.fetchAnalytics()).rejects.toThrow('Network error')
    })

    it('handles non-ok response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      } as Response)

      await expect(crmService.fetchAnalytics()).rejects.toThrow('Failed to fetch CRM analytics')
    })
  })

  describe('fetchCustomers', () => {
    it('fetches customers successfully', async () => {
      const mockCustomers = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          company: 'Acme Corp'
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          company: 'Tech Solutions'
        }
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ customers: mockCustomers })
      } as Response)

      const result = await crmService.fetchCustomers()
      
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8005/api/crm/customers',
        {
          headers: {
            'Authorization': 'Bearer test-token',
            'Content-Type': 'application/json',
          },
        }
      )
      expect(result).toEqual(mockCustomers)
    })

    it('returns empty array when customers property is missing', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({})
      } as Response)

      const result = await crmService.fetchCustomers()
      expect(result).toEqual([])
    })
  })

  describe('fetchInteractions', () => {
    it('fetches interactions successfully', async () => {
      const mockInteractions = [
        {
          id: '1',
          type: 'call',
          customerId: '1',
          notes: 'Follow-up call',
          date: '2024-01-15'
        },
        {
          id: '2',
          type: 'email',
          customerId: '2',
          notes: 'Sent proposal',
          date: '2024-01-14'
        }
      ]

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ interactions: mockInteractions })
      } as Response)

      const result = await crmService.fetchInteractions()
      
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8005/api/crm/interactions',
        {
          headers: {
            'Authorization': 'Bearer test-token',
            'Content-Type': 'application/json',
          },
        }
      )
      expect(result).toEqual(mockInteractions)
    })

    it('returns empty array when interactions property is missing', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({})
      } as Response)

      const result = await crmService.fetchInteractions()
      expect(result).toEqual([])
    })
  })

  describe('constructor', () => {
    it('creates instance with token', () => {
      const service = new CRMService('my-token')
      expect(service).toBeInstanceOf(CRMService)
    })
  })
})
