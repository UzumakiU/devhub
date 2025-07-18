import type { Meta, StoryObj } from '@storybook/react'
import { FormGroup, FormField, Input, Button } from '../index'

const meta: Meta<typeof FormGroup> = {
  title: 'UI/Form/FormGroup',
  component: FormGroup,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A container component for grouping related form fields with consistent spacing and optional styling variants.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Group title'
    },
    description: {
      control: 'text',
      description: 'Group description'
    },
    variant: {
      control: 'select',
      options: ['default', 'bordered', 'elevated'],
      description: 'Visual variant of the form group'
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'User Information',
    description: 'Please provide your basic information',
    children: (
      <>
        <FormField label="First Name" required>
          <Input placeholder="Enter your first name" />
        </FormField>
        <FormField label="Last Name" required>
          <Input placeholder="Enter your last name" />
        </FormField>
        <FormField label="Email Address" required>
          <Input type="email" placeholder="Enter your email" />
        </FormField>
      </>
    )
  }
}

export const Bordered: Story = {
  args: {
    title: 'Account Settings',
    description: 'Configure your account preferences',
    variant: 'bordered',
    children: (
      <>
        <FormField label="Username" required>
          <Input placeholder="Choose a username" />
        </FormField>
        <FormField label="Password" required hint="Must be at least 8 characters">
          <Input type="password" placeholder="Create a password" />
        </FormField>
      </>
    )
  }
}

export const Elevated: Story = {
  args: {
    title: 'Billing Information',
    description: 'Secure payment details',
    variant: 'elevated',
    children: (
      <>
        <FormField label="Card Number" required>
          <Input placeholder="1234 5678 9012 3456" />
        </FormField>
        <FormField label="Expiry Date" required>
          <Input placeholder="MM/YY" />
        </FormField>
        <FormField label="CVV" required>
          <Input placeholder="123" />
        </FormField>
      </>
    )
  }
}

export const WithoutHeader: Story = {
  args: {
    variant: 'bordered',
    children: (
      <>
        <FormField label="Search Query">
          <Input placeholder="Search..." />
        </FormField>
        <Button>Search</Button>
      </>
    )
  }
}

export const MultipleGroups: Story = {
  render: () => (
    <div className="space-y-6 w-96">
      <FormGroup title="Personal Information" variant="elevated">
        <FormField label="Full Name" required>
          <Input placeholder="Enter your full name" />
        </FormField>
        <FormField label="Phone Number">
          <Input placeholder="Enter your phone number" />
        </FormField>
      </FormGroup>
      
      <FormGroup title="Address" variant="bordered">
        <FormField label="Street Address" required>
          <Input placeholder="Enter street address" />
        </FormField>
        <FormField label="City" required>
          <Input placeholder="Enter city" />
        </FormField>
      </FormGroup>
    </div>
  )
}
