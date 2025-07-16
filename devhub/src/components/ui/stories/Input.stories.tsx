import type { Meta, StoryObj } from '@storybook/react'
import Input from '../Input'

const meta: Meta<typeof Input> = {
  title: 'Design System/Input',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A flexible input component with label, error states, and icon support.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: { type: 'text' },
      description: 'Label text for the input'
    },
    error: {
      control: { type: 'text' },
      description: 'Error message to display'
    },
    helperText: {
      control: { type: 'text' },
      description: 'Helper text to display below input'
    },
    placeholder: {
      control: { type: 'text' },
      description: 'Placeholder text'
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Disables the input when true'
    },
    type: {
      control: { type: 'select' },
      options: ['text', 'email', 'password', 'number', 'tel', 'url'],
      description: 'HTML input type'
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    placeholder: 'Enter text...'
  }
}

export const WithLabel: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'you@example.com',
    type: 'email'
  }
}

export const WithError: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'you@example.com',
    error: 'Please enter a valid email address',
    type: 'email'
  }
}

export const WithHelperText: Story = {
  args: {
    label: 'Password',
    placeholder: 'Enter your password',
    helperText: 'Must be at least 8 characters',
    type: 'password'
  }
}

export const WithIcons: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <Input
        label="Search"
        placeholder="Search users..."
        leftIcon={<span>🔍</span>}
      />
      <Input
        label="Amount"
        placeholder="0.00"
        leftIcon={<span>$</span>}
        rightIcon={<span>USD</span>}
      />
      <Input
        label="Website"
        placeholder="https://example.com"
        rightIcon={<span>🌐</span>}
      />
    </div>
  )
}

export const Disabled: Story = {
  args: {
    label: 'Disabled Input',
    placeholder: 'Cannot edit this',
    disabled: true
  }
}

export const DifferentTypes: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <Input label="Text" type="text" placeholder="Enter text" />
      <Input label="Email" type="email" placeholder="you@example.com" />
      <Input label="Password" type="password" placeholder="Password" />
      <Input label="Number" type="number" placeholder="123" />
      <Input label="Phone" type="tel" placeholder="+1 (555) 123-4567" />
      <Input label="URL" type="url" placeholder="https://example.com" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different input types with appropriate placeholders'
      }
    }
  }
}

export const FormExample: Story = {
  render: () => (
    <form className="space-y-4 w-80">
      <Input
        label="First Name"
        placeholder="John"
        required
      />
      <Input
        label="Last Name"
        placeholder="Doe"
        required
      />
      <Input
        label="Email"
        type="email"
        placeholder="john@example.com"
        required
      />
      <Input
        label="Phone"
        type="tel"
        placeholder="+1 (555) 123-4567"
        helperText="Optional - for SMS notifications"
      />
      <Input
        label="Company"
        placeholder="Acme Corp"
        error="Company name is required"
      />
    </form>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Example form showing various input states and configurations'
      }
    }
  }
}
