import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import { Loading, LoadingOverlay, Skeleton, Button, Card } from '../index'

const meta: Meta<typeof Loading> = {
  title: 'UI/Feedback/Loading',
  component: Loading,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Loading indicators and skeleton components for showing loading states and placeholder content.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['spinner', 'dots', 'pulse', 'skeleton'],
      description: 'Visual variant of the loading indicator'
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the loading indicator'
    },
    text: {
      control: 'text',
      description: 'Loading text to display'
    },
    overlay: {
      control: 'boolean',
      description: 'Whether to show as a full-screen overlay'
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Spinner: Story = {
  args: {
    variant: 'spinner',
    text: 'Loading...'
  }
}

export const Dots: Story = {
  args: {
    variant: 'dots',
    text: 'Please wait...'
  }
}

export const Pulse: Story = {
  args: {
    variant: 'pulse',
    text: 'Processing...'
  }
}

export const SkeletonVariant: Story = {
  args: {
    variant: 'skeleton'
  }
}

export const Small: Story = {
  args: {
    variant: 'spinner',
    size: 'sm',
    text: 'Loading...'
  }
}

export const Large: Story = {
  args: {
    variant: 'spinner',
    size: 'lg',
    text: 'Loading...'
  }
}

export const WithoutText: Story = {
  args: {
    variant: 'spinner'
  }
}

export const Overlay: Story = {
  args: {
    variant: 'spinner',
    size: 'lg',
    text: 'Loading application...',
    overlay: true
  }
}

// Skeleton Stories
export const SkeletonComponent: StoryObj<typeof Skeleton> = {
  render: () => <Skeleton />,
  parameters: {
    docs: {
      description: {
        story: 'Basic skeleton placeholder'
      }
    }
  }
}

export const SkeletonCircle: StoryObj<typeof Skeleton> = {
  render: () => <Skeleton circle width="w-12" height="h-12" />,
  parameters: {
    docs: {
      description: {
        story: 'Circular skeleton for avatars'
      }
    }
  }
}

export const SkeletonMultiple: StoryObj<typeof Skeleton> = {
  render: () => <Skeleton count={3} />,
  parameters: {
    docs: {
      description: {
        story: 'Multiple skeleton lines'
      }
    }
  }
}

export const SkeletonCard: StoryObj<typeof Skeleton> = {
  render: () => (
    <Card className="w-80">
      <div className="flex items-center space-x-3 mb-4">
        <Skeleton circle width="w-10" height="h-10" />
        <div className="flex-1">
          <Skeleton width="w-24" className="mb-1" />
          <Skeleton width="w-16" height="h-3" />
        </div>
      </div>
      <Skeleton count={3} className="mb-2" />
      <Skeleton width="w-1/2" />
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Skeleton placeholder for a card layout'
      }
    }
  }
}

// LoadingOverlay Stories
export const LoadingOverlayComponent: StoryObj<typeof LoadingOverlay> = {
  render: () => {
    const [loading, setLoading] = React.useState(false)

    return (
      <div className="space-y-4">
        <Button 
          onClick={() => {
            setLoading(true)
            setTimeout(() => setLoading(false), 3000)
          }}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Start Loading'}
        </Button>
        
        <LoadingOverlay loading={loading}>
          <Card className="w-96 h-64">
            <h3 className="text-lg font-semibold mb-4">Content Area</h3>
            <p className="text-gray-600 mb-4">
              This content will be overlaid with a loading indicator when the button is clicked.
            </p>
            <p className="text-gray-600">
              The overlay prevents interaction with the content while loading.
            </p>
          </Card>
        </LoadingOverlay>
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'Loading overlay that covers content during loading states'
      }
    }
  }
}

export const LoadingStates: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-6">
      <div className="space-y-4">
        <h3 className="font-semibold">Spinner Variants</h3>
        <div className="space-y-3">
          <Loading variant="spinner" size="sm" text="Small spinner" />
          <Loading variant="spinner" size="md" text="Medium spinner" />
          <Loading variant="spinner" size="lg" text="Large spinner" />
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="font-semibold">Other Variants</h3>
        <div className="space-y-3">
          <Loading variant="dots" text="Loading with dots" />
          <Loading variant="pulse" text="Pulsing indicator" />
          <div>
            <p className="text-sm text-gray-600 mb-2">Skeleton content:</p>
            <Loading variant="skeleton" />
          </div>
        </div>
      </div>
    </div>
  )
}
