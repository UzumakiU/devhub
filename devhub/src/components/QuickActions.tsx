'use client'

import { useRouter } from 'next/navigation'

export default function QuickActions() {
  const router = useRouter()

  const actions = [
    {
      title: 'Create Project',
      description: 'Start a new project',
      icon: '📋',
      action: () => router.push('/projects?action=create'),
      color: 'bg-blue-50 hover:bg-blue-100 text-blue-700'
    },
    {
      title: 'Add Customer',
      description: 'Add a new customer',
      icon: '👥',
      action: () => router.push('/crm?view=customers&action=create'),
      color: 'bg-green-50 hover:bg-green-100 text-green-700'
    },
    {
      title: 'Create Invoice',
      description: 'Generate a new invoice',
      icon: '📄',
      action: () => router.push('/invoices?action=create'),
      color: 'bg-purple-50 hover:bg-purple-100 text-purple-700'
    },
    {
      title: 'View Reports',
      description: 'Access business reports',
      icon: '📊',
      action: () => router.push('/reports'),
      color: 'bg-orange-50 hover:bg-orange-100 text-orange-700'
    }
  ]

  return (
    <div className="bg-card rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-4">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.action}
            className={`p-4 rounded-lg text-left transition-colors ${action.color}`}
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{action.icon}</span>
              <div>
                <div className="font-medium">{action.title}</div>
                <div className="text-sm opacity-75">{action.description}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
