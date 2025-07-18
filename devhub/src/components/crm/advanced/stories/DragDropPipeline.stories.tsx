import type { Meta, StoryObj } from '@storybook/react'
import DragDropPipeline from '../DragDropPipeline'

const meta: Meta<typeof DragDropPipeline> = {
  title: 'CRM/Advanced/DragDropPipeline',
  component: DragDropPipeline,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'An interactive drag-and-drop sales pipeline with lead management capabilities.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    stages: {
      description: 'Array of pipeline stages with leads',
      control: { type: 'object' }
    },
    onStageChange: {
      description: 'Callback when a lead is moved between stages',
      action: 'stage-changed'
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    stages: [],
    onStageChange: () => {}
  }
}

export const WithCustomStages: Story = {
  args: {
    stages: [
      {
        id: 'discovery',
        name: 'Discovery',
        probability: 15,
        count: 8,
        value: 120000,
        leads: [
          { id: '1', name: 'Alice Johnson', company: 'StartupABC', value: 15000, daysInStage: 5 }
        ]
      },
      {
        id: 'demo',
        name: 'Demo Scheduled',
        probability: 35,
        count: 5,
        value: 200000,
        leads: [
          { id: '2', name: 'Bob Smith', company: 'Enterprise Ltd', value: 40000, daysInStage: 12 }
        ]
      }
    ],
    onStageChange: () => {}
  }
}
