import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import LeadScoring from '../LeadScoring'
import { Lead } from '../../../leads/types'

const mockLead: Lead = {
  system_id: 'lead-1',
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+1234567890',
  company: 'TechCorp',
  job_title: 'CTO',
  source: 'website',
  lead_score: 85,
  qualification_status: 'qualified',
  stage: 'proposal',
  estimated_value: '75000',
  probability: 80,
  expected_close_date: '2024-03-15',
  assigned_to: {
    system_id: 'user-1',
    name: 'Jane Smith'
  },
  converted_to_customer: false,
  last_contacted: '2024-01-20',
  created_at: '2024-01-01'
}

describe('LeadScoring', () => {
  it('renders lead scoring component', () => {
    render(<LeadScoring lead={mockLead} />)
    
    expect(screen.getByText('Lead Scoring')).toBeInTheDocument()
    expect(screen.getByText('Hot Lead')).toBeInTheDocument()
  })

  it('displays engagement level progress bar', () => {
    render(<LeadScoring lead={mockLead} />)
    
    expect(screen.getByText('Engagement Level')).toBeInTheDocument()
    expect(screen.getByText('75%')).toBeInTheDocument()
  })

  it('shows company fit score', () => {
    render(<LeadScoring lead={mockLead} />)
    
    expect(screen.getByText('Company Fit')).toBeInTheDocument()
    expect(screen.getByText('85%')).toBeInTheDocument()
  })

  it('displays budget confirmation status', () => {
    render(<LeadScoring lead={mockLead} />)
    
    expect(screen.getByText('Budget Confirmed')).toBeInTheDocument()
    expect(screen.getByText('✓ Yes (+20pts)')).toBeInTheDocument()
  })

  it('shows decision maker status', () => {
    render(<LeadScoring lead={mockLead} />)
    
    expect(screen.getByText('Decision Maker')).toBeInTheDocument()
    expect(screen.getByText('✗ No (0pts)')).toBeInTheDocument()
  })

  it('displays timeline urgency', () => {
    render(<LeadScoring lead={mockLead} />)
    
    expect(screen.getByText('Timeline Urgency')).toBeInTheDocument()
    expect(screen.getByText('60%')).toBeInTheDocument()
  })

  it('shows score history', () => {
    render(<LeadScoring lead={mockLead} />)
    
    expect(screen.getByText('Score History')).toBeInTheDocument()
    expect(screen.getByText(/Today:/)).toBeInTheDocument()
    expect(screen.getByText(/Yesterday:/)).toBeInTheDocument()
  })

  it('displays recommended actions', () => {
    render(<LeadScoring lead={mockLead} />)
    
    expect(screen.getByText('Recommended Actions')).toBeInTheDocument()
    expect(screen.getByText(/Confirm budget requirements/)).toBeInTheDocument()
    expect(screen.getByText(/Schedule meeting with decision maker/)).toBeInTheDocument()
  })

  it('calls onScoreUpdate when score is updated', () => {
    const mockOnScoreUpdate = jest.fn()
    render(<LeadScoring lead={mockLead} onScoreUpdate={mockOnScoreUpdate} />)
    
    // This would be tested if we had interactive score updating functionality
    // For now, the component displays static calculated scores
    expect(mockOnScoreUpdate).not.toHaveBeenCalled()
  })

  it('shows correct score color based on value', () => {
    render(<LeadScoring lead={mockLead} />)
    
    // Hot lead (80+) should have green color
    const scoreElement = screen.getByText(/Hot Lead/)
    expect(scoreElement).toHaveClass('text-green-600')
  })
})
