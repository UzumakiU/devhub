import { render, screen } from '@testing-library/react'
import LeadSources from '../LeadSources'

describe('LeadSources', () => {
  const mockSources = {
    website: 45,
    referral: 30,
    social_media: 25,
    email_campaign: 20,
    trade_show: 35
  }

  it('renders lead sources correctly', () => {
    render(<LeadSources sources={mockSources} />)
    
    expect(screen.getByText('Lead Sources')).toBeInTheDocument()
    
    expect(screen.getByText('45')).toBeInTheDocument()
    expect(screen.getByText('website')).toBeInTheDocument()
    
    expect(screen.getByText('30')).toBeInTheDocument()
    expect(screen.getByText('referral')).toBeInTheDocument()
    
    expect(screen.getByText('25')).toBeInTheDocument()
    expect(screen.getByText('social media')).toBeInTheDocument()
    
    expect(screen.getByText('20')).toBeInTheDocument()
    expect(screen.getByText('email campaign')).toBeInTheDocument()
    
    expect(screen.getByText('35')).toBeInTheDocument()
    expect(screen.getByText('trade show')).toBeInTheDocument()
  })

  it('renders with empty sources object', () => {
    render(<LeadSources sources={{}} />)
    
    expect(screen.getByText('Lead Sources')).toBeInTheDocument()
    // Should not crash with empty sources
  })

  it('renders all source items', () => {
    render(<LeadSources sources={mockSources} />)
    
    // Should have 5 source items
    const sourceCounts = Object.values(mockSources).map(String)
    sourceCounts.forEach(count => {
      expect(screen.getByText(count)).toBeInTheDocument()
    })
  })

  it('formats source names correctly', () => {
    render(<LeadSources sources={mockSources} />)
    
    // Check that underscores are replaced with spaces
    expect(screen.getByText('social media')).toBeInTheDocument()
    expect(screen.getByText('email campaign')).toBeInTheDocument()
    expect(screen.getByText('trade show')).toBeInTheDocument()
  })

  it('handles large numbers correctly', () => {
    const largeSources = {
      website: 1250,
      referral: 850
    }
    
    render(<LeadSources sources={largeSources} />)
    
    expect(screen.getByText('1250')).toBeInTheDocument()
    expect(screen.getByText('850')).toBeInTheDocument()
  })
})
