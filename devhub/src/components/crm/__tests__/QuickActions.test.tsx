import { render, screen, fireEvent } from '@testing-library/react'
import QuickActions from '../QuickActions'

describe('QuickActions', () => {
  const mockProps = {
    onViewLeads: jest.fn(),
    onViewCustomers: jest.fn(),
    onViewInteractions: jest.fn(),
    onRefresh: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders all quick action buttons', () => {
    render(<QuickActions {...mockProps} />)
    
    expect(screen.getByText('Quick Actions')).toBeInTheDocument()
    expect(screen.getByText('View All Leads')).toBeInTheDocument()
    expect(screen.getByText('View All Customers')).toBeInTheDocument()
    expect(screen.getByText('View Interactions')).toBeInTheDocument()
    expect(screen.getByText('Refresh Data')).toBeInTheDocument()
  })

  it('calls correct functions when buttons are clicked', () => {
    render(<QuickActions {...mockProps} />)
    
    fireEvent.click(screen.getByText('View All Leads'))
    expect(mockProps.onViewLeads).toHaveBeenCalledTimes(1)
    
    fireEvent.click(screen.getByText('View All Customers'))
    expect(mockProps.onViewCustomers).toHaveBeenCalledTimes(1)
    
    fireEvent.click(screen.getByText('View Interactions'))
    expect(mockProps.onViewInteractions).toHaveBeenCalledTimes(1)
    
    fireEvent.click(screen.getByText('Refresh Data'))
    expect(mockProps.onRefresh).toHaveBeenCalledTimes(1)
  })

  it('renders buttons with correct count', () => {
    render(<QuickActions {...mockProps} />)
    
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(4)
  })

  it('has proper accessibility attributes', () => {
    render(<QuickActions {...mockProps} />)
    
    const buttons = screen.getAllByRole('button')
    
    buttons.forEach(button => {
      expect(button).toBeInTheDocument()
      expect(button).toBeVisible()
    })
  })

  it('renders in a flex layout', () => {
    const { container } = render(<QuickActions {...mockProps} />)
    
    const flexContainer = container.querySelector('.flex')
    expect(flexContainer).toBeInTheDocument()
    expect(flexContainer).toHaveClass('flex-wrap')
    expect(flexContainer).toHaveClass('gap-3')
  })
})
