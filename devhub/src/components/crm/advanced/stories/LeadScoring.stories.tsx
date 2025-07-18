import type { Meta, StoryObj } from '@storybook/react'
import LeadScoring from '../LeadScoring'
import { Lead } from '../../../leads/types'

const meta: Meta<typeof LeadScoring> = {
  title: 'CRM/Advanced/LeadScoring',
  component: LeadScoring,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'An advanced lead scoring component that shows detailed scoring metrics and recommendations.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    lead: {
      description: 'Lead data object containing all lead information',
      control: { type: 'object' }
    },
    onScoreUpdate: {
      description: 'Callback function when score is updated',
      action: 'score-updated'
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

const sampleLead: Lead = {
  system_id: 'lead-1',
  name: 'John Doe',
  email: 'john.doe@techcorp.com',
  phone: '+1 (555) 123-4567',
  company: 'TechCorp Inc.',
  job_title: 'Chief Technology Officer',
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

export const Default: Story = {
  args: {
    lead: sampleLead,
    onScoreUpdate: () => {}
  }
}

export const HighScore: Story = {
  args: {
    lead: {
      ...sampleLead,
      lead_score: 95,
      stage: 'negotiation'
    },
    onScoreUpdate: () => {}
  }
}

export const LowScore: Story = {
  args: {
    lead: {
      ...sampleLead,
      lead_score: 35,
      stage: 'prospect'
    },
    onScoreUpdate: () => {}
  }
}

export const MediumScore: Story = {
  args: {
    lead: {
      ...sampleLead,
      lead_score: 60,
      stage: 'qualified'
    },
    onScoreUpdate: () => {}
  }
}
