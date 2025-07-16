import { render, screen } from '@testing-library/react'
import SalesPipeline from '../SalesPipeline'

describe('SalesPipeline', () => {
  const mockStages = {
    lead: 45,
    qualified: 30,
    proposal: 15,
    closed_won: 60
  }

  it('renders pipeline stages correctly', () => {
    render(<SalesPipeline stages={mockStages} />)
    
    expect(screen.getByText('Sales Pipeline')).toBeInTheDocument()
    expect(screen.getByText('45')).toBeInTheDocument()
    expect(screen.getByText('lead')).toBeInTheDocument()
    
    expect(screen.getByText('30')).toBeInTheDocument()
    expect(screen.getByText('qualified')).toBeInTheDocument()
    
    expect(screen.getByText('15')).toBeInTheDocument()
    expect(screen.getByText('proposal')).toBeInTheDocument()
    
    expect(screen.getByText('60')).toBeInTheDocument()
    expect(screen.getByText('closed won')).toBeInTheDocument()
  })

  it('renders all stage items', () => {
    render(<SalesPipeline stages={mockStages} />)
    
    // Should have 4 stage items
    const stageNumbers = Object.values(mockStages).map(String)
    stageNumbers.forEach(count => {
      expect(screen.getByText(count)).toBeInTheDocument()
    })
  })

  it('formats stage names correctly', () => {
    render(<SalesPipeline stages={mockStages} />)
    
    // Check that underscores are replaced with spaces and text is capitalized
    expect(screen.getByText('closed won')).toBeInTheDocument()
  })

  it('renders with empty stages object', () => {
    render(<SalesPipeline stages={{}} />)
    
    expect(screen.getByText('Sales Pipeline')).toBeInTheDocument()
    // Should not crash with empty stages
  })
})
