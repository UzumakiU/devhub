import type { Meta, StoryObj } from '@storybook/react'
import Button from '../Button'

const meta: Meta<typeof Button> = {
  title: 'Design System/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A versatile button component with multiple variants, sizes, and states.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'success', 'danger'],
      description: 'Visual style variant of the button'
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'Size of the button'
    },
    isLoading: {
      control: { type: 'boolean' },
      description: 'Shows loading spinner when true'
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Disables the button when true'
    },
    fullWidth: {
      control: { type: 'boolean' },
      description: 'Makes button take full width of container'
    },
    onClick: {
      action: 'clicked',
      description: 'Click event handler'
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button'
  }
}

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button'
  }
}

export const Success: Story = {
  args: {
    variant: 'success',
    children: 'Success Button'
  }
}

export const Danger: Story = {
  args: {
    variant: 'danger',
    children: 'Danger Button'
  }
}

export const Sizes: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="space-x-4">
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
        <Button size="lg">Large</Button>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different button sizes available'
      }
    }
  }
}

export const Loading: Story = {
  args: {
    variant: 'primary',
    isLoading: true,
    children: 'Loading...'
  }
}

export const Disabled: Story = {
  args: {
    variant: 'primary',
    disabled: true,
    children: 'Disabled Button'
  }
}

export const WithIcons: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="space-x-4">
        <Button 
          leftIcon={<span>→</span>}
        >
          With Left Icon
        </Button>
        <Button 
          rightIcon={<span>←</span>}
        >
          With Right Icon
        </Button>
        <Button 
          leftIcon={<span>+</span>}
          rightIcon={<span>→</span>}
        >
          Both Icons
        </Button>
      </div>
    </div>
  )
}

export const FullWidth: Story = {
  args: {
    variant: 'primary',
    fullWidth: true,
    children: 'Full Width Button'
  },
  parameters: {
    layout: 'padded'
  }
}

export const AllVariants: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 max-w-md">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="success">Success</Button>
      <Button variant="danger">Danger</Button>
      <Button variant="primary" disabled>Disabled</Button>
      <Button variant="secondary" isLoading>Loading</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Showcase of all button variants and states'
      }
    }
  }
}
