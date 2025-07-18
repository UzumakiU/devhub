import type { Meta, StoryObj } from '@storybook/react'
import ActivityTimeline from '../ActivityTimeline'

const meta: Meta<typeof ActivityTimeline> = {
  title: 'CRM/Advanced/ActivityTimeline',
  component: ActivityTimeline,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A timeline component showing all activities related to a lead or customer.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    leadId: {
      description: 'ID of the lead to show activities for',
      control: { type: 'text' }
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    leadId: 'lead-1'
  }
}

export const WithLongId: Story = {
  args: {
    leadId: 'lead-with-very-long-identifier-123456789'
  }
}
