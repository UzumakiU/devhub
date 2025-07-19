import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LeadCard from '../LeadCard'
import { Lead } from '../types'

// Mock the utils functions
jest.mock('../utils', () => ({
  getStageColor: jest.fn(() => 'bg-blue-100 text-blue-800'),
  getScoreColor: jest.fn(() => 'text-green-600'),
  formatDate: jest.fn((date: string) => new Date(date).toLocaleDateString()),
  formatCurrency: jest.fn((amount: string | undefined) => amount ? `$${amount}` : '$0'),
}))

describe('LeadCard', () => {
  const mockLead: Lead = {
    system_id: 'lead-1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    company: 'Tech Corp',
    job_title: 'CTO',
    source: 'website',
    lead_score: 85,
    qualification_status: 'qualified',
    stage: 'proposal',
    estimated_value: '50000',
    probability: 75,
    expected_close_date: '2024-12-31',
    assigned_to: {
      system_id: 'user-1',
      name: 'Jane Smith'
    },
    converted_to_customer: false,
    last_contacted: '2024-01-15',
    created_at: '2024-01-01'
  }

  const mockOnConvert = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    // Mock window.confirm
    global.confirm = jest.fn(() => true)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('renders lead information correctly', () => {
    render(<LeadCard lead={mockLead} onConvert={mockOnConvert} />)
    
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
    expect(screen.getByText('Tech Corp')).toBeInTheDocument()
    expect(screen.getByText('PROPOSAL')).toBeInTheDocument()
    expect(screen.getByText('85%')).toBeInTheDocument()
    expect(screen.getByText('WEBSITE')).toBeInTheDocument()
    expect(screen.getByText('75%')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
  })

  it('displays formatted estimated value and dates', () => {
    render(<LeadCard lead={mockLead} onConvert={mockOnConvert} />)
    
    expect(screen.getByText('$50000')).toBeInTheDocument()
  })

  it('shows convert button for unconverted leads', () => {
    render(<LeadCard lead={mockLead} onConvert={mockOnConvert} />)
    
    const convertButton = screen.getByText('Convert to Customer')
    expect(convertButton).toBeInTheDocument()
    expect(convertButton).not.toBeDisabled()
  })

  it('handles convert button click with confirmation', async () => {
    const user = userEvent.setup()
    render(<LeadCard lead={mockLead} onConvert={mockOnConvert} />)
    
    const convertButton = screen.getByText('Convert to Customer')
    await user.click(convertButton)
    
    expect(global.confirm).toHaveBeenCalledWith('Convert this lead to a customer?')
    expect(mockOnConvert).toHaveBeenCalledWith('lead-1')
  })

  it('does not convert when confirmation is cancelled', async () => {
    global.confirm = jest.fn(() => false)
    const user = userEvent.setup()
    render(<LeadCard lead={mockLead} onConvert={mockOnConvert} />)
    
    const convertButton = screen.getByText('Convert to Customer')
    await user.click(convertButton)
    
    expect(global.confirm).toHaveBeenCalled()
    expect(mockOnConvert).not.toHaveBeenCalled()
  })

  it('shows converting state when isConverting is true', () => {
    render(<LeadCard lead={mockLead} onConvert={mockOnConvert} isConverting={true} />)
    
    const convertButton = screen.getByText('Converting...')
    expect(convertButton).toBeInTheDocument()
    expect(convertButton).toBeDisabled()
  })

  it('shows converted status for converted leads', () => {
    const convertedLead = { ...mockLead, converted_to_customer: true }
    render(<LeadCard lead={convertedLead} onConvert={mockOnConvert} />)
    
    expect(screen.getByText('✓ Converted to Customer')).toBeInTheDocument()
    expect(screen.queryByText('Convert to Customer')).not.toBeInTheDocument()
  })

  it('hides convert button for closed lost leads', () => {
    const closedLead = { ...mockLead, stage: 'closed_lost' }
    render(<LeadCard lead={closedLead} onConvert={mockOnConvert} />)
    
    expect(screen.queryByText('Convert to Customer')).not.toBeInTheDocument()
  })

  it('handles optional fields gracefully', () => {
    const minimalLead: Lead = {
      ...mockLead,
      company: undefined,
      estimated_value: undefined,
      expected_close_date: undefined,
      last_contacted: undefined,
    }
    
    render(<LeadCard lead={minimalLead} onConvert={mockOnConvert} />)
    
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.queryByText('Tech Corp')).not.toBeInTheDocument()
  })

  it('applies correct CSS classes', () => {
    const { container } = render(<LeadCard lead={mockLead} onConvert={mockOnConvert} />)
    
    const card = container.firstChild as HTMLElement
    expect(card).toHaveClass('bg-background', 'p-4', 'rounded-lg')
  })
})
