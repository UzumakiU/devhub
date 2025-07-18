import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import { ToastProvider, useToast, toast, Button } from '../index'

const meta: Meta = {
  title: 'UI/Feedback/Toast',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Toast notifications for displaying temporary messages to users. Supports different variants and auto-dismissal.'
      }
    }
  },
  tags: ['autodocs']
}

export default meta

const ToastDemo = () => {
  const { addToast } = useToast()

  const showInfoToast = () => {
    addToast({
      title: 'Information',
      description: 'This is an informational toast message.',
      variant: 'default'
    })
  }

  const showSuccessToast = () => {
    addToast({
      title: 'Success!',
      description: 'Your action was completed successfully.',
      variant: 'success'
    })
  }

  const showWarningToast = () => {
    addToast({
      title: 'Warning',
      description: 'Please pay attention to this warning message.',
      variant: 'warning'
    })
  }

  const showErrorToast = () => {
    addToast({
      title: 'Error',
      description: 'An error occurred while processing your request.',
      variant: 'error'
    })
  }

  const showPersistentToast = () => {
    addToast({
      title: 'Persistent Toast',
      description: 'This toast will not auto-dismiss.',
      variant: 'default',
      duration: 0 // 0 means it won't auto-dismiss
    })
  }

  const showToastWithAction = () => {
    addToast({
      title: 'Action Required',
      description: 'Click the action button to proceed.',
      variant: 'warning',
      action: {
        label: 'Undo',
        onClick: () => {
          addToast({
            title: 'Undone',
            description: 'Action was undone successfully.',
            variant: 'success'
          })
        }
      }
    })
  }

  const showQuickToasts = () => {
    addToast(toast.success('Quick Success', 'This uses the helper function'))
    setTimeout(() => {
      addToast(toast.info('Quick Info', 'Another helper toast'))
    }, 500)
    setTimeout(() => {
      addToast(toast.warning('Quick Warning', 'And another one'))
    }, 1000)
  }

  return (
    <div className="space-y-4 p-6">
      <h2 className="text-xl font-bold mb-4">Toast Notifications Demo</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <Button onClick={showInfoToast} variant="secondary">
          Show Info Toast
        </Button>
        
        <Button onClick={showSuccessToast} variant="success">
          Show Success Toast
        </Button>
        
        <Button onClick={showWarningToast} variant="secondary">
          Show Warning Toast
        </Button>
        
        <Button onClick={showErrorToast} variant="danger">
          Show Error Toast
        </Button>
        
        <Button onClick={showPersistentToast} variant="secondary">
          Show Persistent Toast
        </Button>
        
        <Button onClick={showToastWithAction} variant="secondary">
          Show Toast with Action
        </Button>
      </div>
      
      <div className="pt-4 border-t">
        <Button onClick={showQuickToasts} variant="primary">
          Show Multiple Toasts
        </Button>
      </div>
    </div>
  )
}

export const Default: StoryObj = {
  render: () => (
    <ToastProvider>
      <ToastDemo />
    </ToastProvider>
  )
}

export const HelperFunctions: StoryObj = {
  render: () => {
    const ToastHelperDemo = () => {
      const { addToast } = useToast()

      return (
        <div className="space-y-4 p-6">
          <h3 className="text-lg font-semibold">Toast Helper Functions</h3>
          <p className="text-gray-600 mb-4">
            Use the helper functions for quick toast creation:
          </p>
          
          <div className="space-y-2">
            <Button 
              onClick={() => addToast(toast.success('Success!', 'Operation completed'))}
              variant="success"
              size="sm"
            >
              toast.success()
            </Button>
            
            <Button 
              onClick={() => addToast(toast.error('Error!', 'Something went wrong'))}
              variant="danger"
              size="sm"
            >
              toast.error()
            </Button>
            
            <Button 
              onClick={() => addToast(toast.warning('Warning!', 'Please be careful'))}
              variant="secondary"
              size="sm"
            >
              toast.warning()
            </Button>
            
            <Button 
              onClick={() => addToast(toast.info('Info', 'Just so you know'))}
              variant="secondary"
              size="sm"
            >
              toast.info()
            </Button>
          </div>
        </div>
      )
    }

    return (
      <ToastProvider>
        <ToastHelperDemo />
      </ToastProvider>
    )
  }
}

export const CustomDuration: StoryObj = {
  render: () => {
    const CustomDurationDemo = () => {
      const { addToast } = useToast()

      return (
        <div className="space-y-4 p-6">
          <h3 className="text-lg font-semibold">Custom Duration</h3>
          <div className="space-y-2">
            <Button 
              onClick={() => addToast({
                title: 'Quick Toast',
                description: 'Disappears in 2 seconds',
                variant: 'default',
                duration: 2000
              })}
              size="sm"
            >
              2 Second Toast
            </Button>
            
            <Button 
              onClick={() => addToast({
                title: 'Long Toast',
                description: 'Stays for 10 seconds',
                variant: 'default',
                duration: 10000
              })}
              size="sm"
            >
              10 Second Toast
            </Button>
            
            <Button 
              onClick={() => addToast({
                title: 'Manual Dismiss',
                description: 'Must be dismissed manually',
                variant: 'warning',
                duration: 0
              })}
              size="sm"
            >
              Manual Dismiss Only
            </Button>
          </div>
        </div>
      )
    }

    return (
      <ToastProvider>
        <CustomDurationDemo />
      </ToastProvider>
    )
  }
}
