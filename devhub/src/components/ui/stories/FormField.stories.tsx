import type { Meta, StoryObj } from '@storybook/react'
import { FormField, Input, Button } from '../index'

const meta: Meta<typeof FormField> = {
  title: 'UI/Form/FormField',
  component: FormField,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A wrapper component for form inputs that provides consistent labeling, error handling, and accessibility features.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Label text for the form field'
    },
    error: {
      control: 'text',
      description: 'Error message to display'
    },
    hint: {
      control: 'text',
      description: 'Helpful hint text'
    },
    required: {
      control: 'boolean',
      description: 'Whether the field is required'
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the field is disabled'
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    label: 'Email Address',
    children: <Input type="email" placeholder="Enter your email" />
  }
}

export const WithError: Story = {
  args: {
    label: 'Email Address',
    error: 'Please enter a valid email address',
    children: <Input type="email" placeholder="Enter your email" />
  }
}

export const WithHint: Story = {
  args: {
    label: 'Password',
    hint: 'Must be at least 8 characters long',
    children: <Input type="password" placeholder="Enter your password" />
  }
}

export const Required: Story = {
  args: {
    label: 'Full Name',
    required: true,
    children: <Input placeholder="Enter your full name" />
  }
}

export const Disabled: Story = {
  args: {
    label: 'Username',
    disabled: true,
    children: <Input placeholder="Username not editable" />
  }
}

export const WithButton: Story = {
  args: {
    label: 'Actions',
    children: <Button>Submit Form</Button>
  }
}
