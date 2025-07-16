import type { Meta, StoryObj } from '@storybook/react'
import LeadCard from '../LeadCard'
import { Lead } from '../types'

const meta: Meta<typeof LeadCard> = {
  title: 'CRM/Lead Management/LeadCard',
  component: LeadCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A card component that displays lead information with conversion functionality.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    lead: {
      description: 'Lead data object containing all lead information',
      control: { type: 'object' }
    },
    onConvert: {
      description: 'Callback function triggered when converting a lead to customer',
      action: 'convert-lead'
    },
    isConverting: {
      description: 'Loading state for conversion process',
      control: { type: 'boolean' }
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

// Sample lead data for stories
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
    onConvert: () => {},
    isConverting: false
  }
}

export const HighScore: Story = {
  args: {
    lead: {
      ...sampleLead,
      lead_score: 95,
      stage: 'negotiation'
    },
    onConvert: () => {},
    isConverting: false
  }
}

export const LowScore: Story = {
  args: {
    lead: {
      ...sampleLead,
      lead_score: 25,
      stage: 'prospect'
    },
    onConvert: () => {},
    isConverting: false
  }
}

export const Converting: Story = {
  args: {
    lead: sampleLead,
    onConvert: () => {},
    isConverting: true
  }
}

export const Converted: Story = {
  args: {
    lead: {
      ...sampleLead,
      converted_to_customer: true,
      stage: 'closed_won'
    },
    onConvert: () => {},
    isConverting: false
  }
}

export const ClosedLost: Story = {
  args: {
    lead: {
      ...sampleLead,
      stage: 'closed_lost',
      probability: 0
    },
    onConvert: () => {},
    isConverting: false
  }
}

export const MinimalData: Story = {
  args: {
    lead: {
      ...sampleLead,
      phone: undefined,
      company: undefined,
      job_title: undefined,
      estimated_value: undefined,
      expected_close_date: undefined,
      last_contacted: undefined
    },
    onConvert: () => {},
    isConverting: false
  },
  parameters: {
    docs: {
      description: {
        story: 'Lead card with minimal required data only'
      }
    }
  }
}

export const DifferentSources: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 max-w-4xl">
      {['website', 'referral', 'cold_call', 'social_media', 'email', 'event'].map((source) => (
        <LeadCard
          key={source}
          lead={{
            ...sampleLead,
            system_id: `lead-${source}`,
            source,
            name: `Lead from ${source.replace('_', ' ')}`
          }}
          onConvert={() => {}}
          isConverting={false}
        />
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Showcase of different lead sources'
      }
    }
  }
}

export const DifferentStages: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 max-w-4xl">
      {['prospect', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'].map((stage) => (
        <LeadCard
          key={stage}
          lead={{
            ...sampleLead,
            system_id: `lead-${stage}`,
            stage,
            name: `${stage.replace('_', ' ').toUpperCase()} Lead`,
            converted_to_customer: stage === 'closed_won'
          }}
          onConvert={() => {}}
          isConverting={false}
        />
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Showcase of different lead stages and their visual styling'
      }
    }
  }
}
