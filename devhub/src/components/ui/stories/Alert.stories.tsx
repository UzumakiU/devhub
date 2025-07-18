import type { Meta, StoryObj } from '@storybook/react'
import { Alert, Button } from '../index'
import { useState } from 'react'

const meta: Meta<typeof Alert> = {
  title: 'UI/Feedback/Alert',
  component: Alert,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'An alert component for displaying important messages with different severity levels and optional dismissal.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['info', 'success', 'warning', 'error'],
      description: 'Visual variant of the alert'
    },
    title: {
      control: 'text',
      description: 'Alert title'
    },
    dismissible: {
      control: 'boolean',
      description: 'Whether the alert can be dismissed'
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Info: Story = {
  args: {
    variant: 'info',
    title: 'Information',
    children: 'This is an informational alert. It provides helpful information to the user.'
  }
}

export const Success: Story = {
  args: {
    variant: 'success',
    title: 'Success!',
    children: 'Your action was completed successfully. Everything went as expected.'
  }
}

export const Warning: Story = {
  args: {
    variant: 'warning',
    title: 'Warning',
    children: 'Please pay attention to this warning. Some action may be required.'
  }
}

export const Error: Story = {
  args: {
    variant: 'error',
    title: 'Error',
    children: 'An error occurred. Please check your input and try again.'
  }
}

export const WithoutTitle: Story = {
  args: {
    variant: 'info',
    children: 'This alert has no title, just the content message.'
  }
}

export const Dismissible: Story = {
  args: {
    variant: 'warning',
    title: 'Dismissible Alert',
    dismissible: true,
    children: 'This alert can be dismissed by clicking the X button.',
    onDismiss: () => alert('Alert dismissed!')
  }
}

export const LongContent: Story = {
  args: {
    variant: 'error',
    title: 'Detailed Error Message',
    children: (
      <div>
        <p className="mb-2">
          This is a more detailed error message that spans multiple lines and provides 
          comprehensive information about what went wrong.
        </p>
        <ul className="list-disc list-inside space-y-1 mb-2">
          <li>Check your network connection</li>
          <li>Verify your credentials</li>
          <li>Ensure all required fields are filled</li>
        </ul>
        <p>
          If the problem persists, please contact support.
        </p>
      </div>
    )
  }
}

export const WithActions: Story = {
  args: {
    variant: 'warning',
    title: 'Action Required',
    children: (
      <div>
        <p className="mb-3">
          Your session will expire in 5 minutes. Would you like to extend it?
        </p>
        <div className="flex space-x-2">
          <Button size="sm" variant="primary">Extend Session</Button>
          <Button size="sm" variant="secondary">Log Out</Button>
        </div>
      </div>
    )
  }
}

export const CustomIcon: Story = {
  args: {
    variant: 'info',
    title: 'Custom Icon',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    children: 'This alert uses a custom icon instead of the default one.'
  }
}

export const Interactive: Story = {
  render: () => {
    const [alerts, setAlerts] = useState([
      { id: 1, variant: 'info', title: 'Info Alert', message: 'This is an info alert' },
      { id: 2, variant: 'success', title: 'Success Alert', message: 'This is a success alert' },
      { id: 3, variant: 'warning', title: 'Warning Alert', message: 'This is a warning alert' },
      { id: 4, variant: 'error', title: 'Error Alert', message: 'This is an error alert' }
    ])

    const removeAlert = (id: number) => {
      setAlerts(alerts.filter(alert => alert.id !== id))
    }

    return (
      <div className="space-y-4">
        {alerts.map(alert => (
          <Alert
            key={alert.id}
            variant={alert.variant as 'info' | 'success' | 'warning' | 'error'}
            title={alert.title}
            dismissible
            onDismiss={() => removeAlert(alert.id)}
          >
            {alert.message}
          </Alert>
        ))}
        {alerts.length === 0 && (
          <p className="text-gray-500 text-center py-8">
            All alerts have been dismissed!
          </p>
        )}
      </div>
    )
  }
}
