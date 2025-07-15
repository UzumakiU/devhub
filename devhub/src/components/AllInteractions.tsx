'use client'

import { useState, useEffect } from 'react'
import useAuth from '@/hooks/useAuth'

interface CustomerInteraction {
  system_id: string
  interaction_type: string
  subject: string
  description: string
  outcome: string
  priority: string
  status: string
  is_billable: boolean
  billable_hours?: string
  scheduled_at?: string
  completed_at?: string
  follow_up_date?: string
  created_at: string
  customer: {
    system_id: string
    name: string
    email: string
  }
  created_by: {
    system_id: string
    name: string
  }
}

interface AllInteractionsProps {
  onBack: () => void
  onViewCustomer: (customerId: string) => void
}

export default function AllInteractions({ onBack, onViewCustomer }: AllInteractionsProps) {
  const { token } = useAuth()
  const [interactions, setInteractions] = useState<CustomerInteraction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const interactionTypes = [
    { value: 'call', label: 'Phone Call', icon: '📞' },
    { value: 'email', label: 'Email', icon: '✉️' },
    { value: 'meeting', label: 'Meeting', icon: '🤝' },
    { value: 'note', label: 'Note', icon: '📝' },
    { value: 'follow_up', label: 'Follow-up', icon: '⏰' }
  ]

  const priorities = [
    { value: 'low', label: 'Low', color: 'text-green-600 bg-green-100' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600 bg-yellow-100' },
    { value: 'high', label: 'High', color: 'text-orange-600 bg-orange-100' },
    { value: 'urgent', label: 'Urgent', color: 'text-red-600 bg-red-100' }
  ]

  useEffect(() => {
    if (token) {
      fetchAllInteractions()
    }
  }, [token])

  const fetchAllInteractions = async () => {
    try {
      setLoading(true)
      // Get all customers first, then fetch their interactions
      const customersResponse = await fetch('http://localhost:8005/api/database/table/customers', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!customersResponse.ok) {
        throw new Error(`HTTP error! status: ${customersResponse.status}`)
      }

      const customersData = await customersResponse.json()
      
      if (customersData.success && customersData.data) {
        // Fetch interactions for all customers
        const allInteractions: CustomerInteraction[] = []
        
        for (const customer of customersData.data) {
          try {
            const interactionsResponse = await fetch(`http://localhost:8005/api/crm/customers/${customer.system_id}/interactions`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            })

            if (interactionsResponse.ok) {
              const interactionsData = await interactionsResponse.json()
              if (interactionsData.success && interactionsData.data) {
                // Add customer info to each interaction
                const customerInteractions = interactionsData.data.map((interaction: any) => ({
                  ...interaction,
                  customer: {
                    system_id: customer.system_id,
                    name: customer.name,
                    email: customer.email
                  }
                }))
                allInteractions.push(...customerInteractions)
              }
            }
          } catch (err) {
            console.warn(`Failed to fetch interactions for customer ${customer.name}:`, err)
          }
        }

        // Sort by most recent first
        allInteractions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        setInteractions(allInteractions)
      }
    } catch (err) {
      console.error('Error fetching all interactions:', err)
      setError(err instanceof Error ? err.message : 'Failed to load interactions')
    } finally {
      setLoading(false)
    }
  }

  const getInteractionTypeInfo = (type: string) => {
    return interactionTypes.find(t => t.value === type) || { value: type, label: type, icon: '📄' }
  }

  const getPriorityInfo = (priority: string) => {
    return priorities.find(p => p.value === priority) || { value: priority, label: priority, color: 'text-gray-600 bg-gray-100' }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">All Customer Interactions</h2>
          <button
            onClick={onBack}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
          >
            ← Back to Dashboard
          </button>
        </div>
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">All Customer Interactions</h2>
          <button
            onClick={onBack}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
          >
            ← Back to Dashboard
          </button>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">
            <strong>Error loading interactions:</strong> {error}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">All Customer Interactions</h2>
          <p className="text-gray-600">{interactions.length} interactions across all customers</p>
        </div>
        <button
          onClick={onBack}
          className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Interactions List */}
      {interactions.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-12 text-center">
          <div className="text-gray-400 text-6xl mb-4">💬</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No interactions yet</h3>
          <p className="text-gray-500">Start engaging with your customers to see interactions here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {interactions.map((interaction) => {
            const typeInfo = getInteractionTypeInfo(interaction.interaction_type)
            const priorityInfo = getPriorityInfo(interaction.priority)

            return (
              <div key={interaction.system_id} className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-2xl">{typeInfo.icon}</span>
                      <h3 className="text-lg font-semibold text-gray-900">{interaction.subject}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityInfo.color}`}>
                        {priorityInfo.label}
                      </span>
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-gray-600">{interaction.description}</p>
                    </div>

                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <span>
                        <strong>Customer:</strong> 
                        <button 
                          onClick={() => onViewCustomer(interaction.customer.system_id)}
                          className="text-blue-600 hover:text-blue-800 ml-1"
                        >
                          {interaction.customer.name}
                        </button>
                      </span>
                      <span><strong>Type:</strong> {typeInfo.label}</span>
                      <span><strong>Status:</strong> {interaction.status}</span>
                      {interaction.outcome && <span><strong>Outcome:</strong> {interaction.outcome}</span>}
                    </div>

                    <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
                      <span>Created: {formatDate(interaction.created_at)}</span>
                      <span>By: {interaction.created_by.name}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
