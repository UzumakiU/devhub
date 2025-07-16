import { LeadService } from '../LeadService'
import { Lead, LeadFormData } from '../types'

// Mock fetch globally
global.fetch = jest.fn()

describe('LeadService', () => {
  let leadService: LeadService
  const mockToken = 'test-token'
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

  beforeEach(() => {
    leadService = new LeadService(mockToken)
    jest.clearAllMocks()
  })

  describe('fetchLeads', () => {
    const mockLeads: Lead[] = [
      {
        system_id: 'lead-1',
        name: 'John Doe',
        email: 'john@example.com',
        source: 'website',
        lead_score: 85,
        qualification_status: 'qualified',
        stage: 'proposal',
        probability: 75,
        assigned_to: {
          system_id: 'user-1',
          name: 'Jane Smith'
        },
        converted_to_customer: false,
        created_at: '2024-01-01'
      }
    ]

    it('fetches leads successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ leads: mockLeads }),
      } as Response)

      const result = await leadService.fetchLeads()

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8005/api/crm/leads',
        {
          headers: {
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json',
          },
        }
      )
      expect(result).toEqual(mockLeads)
    })

    it('fetches leads with stage filter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ leads: mockLeads }),
      } as Response)

      await leadService.fetchLeads('proposal')

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8005/api/crm/leads?stage=proposal',
        expect.any(Object)
      )
    })

    it('returns empty array when no leads in response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as Response)

      const result = await leadService.fetchLeads()

      expect(result).toEqual([])
    })

    it('throws error when fetch fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as Response)

      await expect(leadService.fetchLeads()).rejects.toThrow('Failed to fetch leads')
    })

    it('throws error when network request fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(leadService.fetchLeads()).rejects.toThrow('Network error')
    })
  })

  describe('createLead', () => {
    const mockFormData: LeadFormData = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      company: 'Tech Corp',
      job_title: 'CTO',
      source: 'website',
      estimated_value: '50000',
      expected_close_date: '2024-12-31'
    }

    it('creates lead successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
      } as Response)

      await leadService.createLead(mockFormData)

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8005/api/crm/leads',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(mockFormData),
        }
      )
    })

    it('throws error when creation fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
      } as Response)

      await expect(leadService.createLead(mockFormData)).rejects.toThrow('Failed to create lead')
    })
  })

  describe('convertLead', () => {
    const leadId = 'lead-1'

    it('converts lead successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
      } as Response)

      await leadService.convertLead(leadId)

      expect(mockFetch).toHaveBeenCalledWith(
        `http://localhost:8005/api/crm/leads/${leadId}/convert`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${mockToken}`,
            'Content-Type': 'application/json',
          },
        }
      )
    })

    it('throws error when conversion fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
      } as Response)

      await expect(leadService.convertLead(leadId)).rejects.toThrow('Failed to convert lead')
    })
  })

  describe('constructor', () => {
    it('sets the token correctly', () => {
      const service = new LeadService('custom-token')
      expect(service).toBeInstanceOf(LeadService)
    })
  })

  describe('error handling', () => {
    it('handles different HTTP status codes', async () => {
      const testCases = [
        { status: 401, expectedError: 'Failed to fetch leads' },
        { status: 404, expectedError: 'Failed to fetch leads' },
        { status: 500, expectedError: 'Failed to fetch leads' },
      ]

      for (const { status, expectedError } of testCases) {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status,
        } as Response)

        await expect(leadService.fetchLeads()).rejects.toThrow(expectedError)
      }
    })
  })
})
