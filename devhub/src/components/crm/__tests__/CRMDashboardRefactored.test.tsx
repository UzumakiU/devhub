import { render, screen, waitFor } from '@testing-library/react'
import CRMDashboardRefactored from '../../CRMDashboardRefactored'

// Mock the CRMService
jest.mock('../CRMService', () => ({
  CRMService: jest.fn().mockImplementation(() => ({
    fetchAnalytics: jest.fn().mockResolvedValue({
      customer_metrics: {
        total_customers: 150,
        new_customers_this_month: 25,
        active_customers: 120
      },
      lead_metrics: {
        total_leads: 89,
        qualified_leads: 45,
        converted_leads: 12,
        conversion_rate: 13.5
      },
      interaction_metrics: {
        total_interactions: 245,
        interactions_this_week: 32
      },
      pipeline_stages: {
        lead: 45,
        qualified: 30,
        proposal: 15,
        closed_won: 12
      },
      lead_sources: {
        website: 45,
        referral: 30,
        social_media: 25
      }
    })
  }))
}))

// Mock useAuth hook
jest.mock('../../../hooks/useAuth', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    token: 'test-token',
    user: { id: '1', name: 'Test User' }
  }))
}))

describe('CRMDashboardRefactored', () => {
  const mockProps = {
    onViewCustomers: jest.fn(),
    onViewLeads: jest.fn(),
    onViewInteractions: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders dashboard content after loading', async () => {
    render(<CRMDashboardRefactored {...mockProps} />)
    
    // Wait for loading to complete and dashboard to render
    await waitFor(() => {
      expect(screen.getByText('Total Customers')).toBeInTheDocument()
      expect(screen.getByText('Total Leads')).toBeInTheDocument()
      expect(screen.getByText('Total Interactions')).toBeInTheDocument()
    })
  })

  it('renders loading state initially', () => {
    render(<CRMDashboardRefactored {...mockProps} />)
    
    // Check for skeleton loading animation
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('renders all dashboard components after loading', async () => {
    render(<CRMDashboardRefactored {...mockProps} />)
    
    // Wait for data to load
    await waitFor(() => {
      expect(document.querySelector('.animate-pulse')).not.toBeInTheDocument()
    })

    // Check for metric cards with correct values
    expect(screen.getByText('150')).toBeInTheDocument() // Total Customers
    expect(screen.getByText('89')).toBeInTheDocument()  // Total Leads
    expect(screen.getByText('245')).toBeInTheDocument() // Total Interactions
    expect(screen.getByText('25')).toBeInTheDocument()  // New customers this month
  })

  it('renders Quick Actions component', async () => {
    render(<CRMDashboardRefactored {...mockProps} />)
    
    await waitFor(() => {
      expect(document.querySelector('.animate-pulse')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Quick Actions')).toBeInTheDocument()
  })

  it('handles error state gracefully', async () => {
    // Mock the service to throw an error
    const { CRMService } = require('../CRMService')
    CRMService.mockImplementation(() => ({
      fetchAnalytics: jest.fn().mockRejectedValue(new Error('API Error'))
    }))

    render(<CRMDashboardRefactored {...mockProps} />)
    
    // Should render error state eventually
    await waitFor(() => {
      expect(screen.getByText('Error loading data')).toBeInTheDocument()
    })
  })

  it('has proper responsive grid layout', async () => {
    // Ensure the mock is reset to successful state
    const { CRMService } = require('../CRMService')
    CRMService.mockImplementation(() => ({
      fetchAnalytics: jest.fn().mockResolvedValue({
        customer_metrics: {
          total_customers: 150,
          new_customers_this_month: 25,
          active_customers: 120
        },
        lead_metrics: {
          total_leads: 89,
          qualified_leads: 45,
          converted_leads: 12,
          conversion_rate: 13.5
        },
        interaction_metrics: {
          total_interactions: 245,
          interactions_this_week: 32
        },
        pipeline_stages: {
          lead: 45,
          qualified: 30,
          proposal: 15,
          closed_won: 12
        },
        lead_sources: {
          website: 45,
          referral: 30,
          social_media: 25
        }
      })
    }))

    const { container } = render(<CRMDashboardRefactored {...mockProps} />)
    
    // Wait for content to load
    await waitFor(() => {
      expect(screen.getByText('Total Customers')).toBeInTheDocument()
    })

    const gridContainer = container.querySelector('.grid.grid-cols-1.md\\:grid-cols-3')
    expect(gridContainer).toBeInTheDocument()
    expect(gridContainer).toHaveClass('gap-6')
  })
})
