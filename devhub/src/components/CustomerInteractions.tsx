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
  created_by: {
    system_id: string
    name: string
  }
}

interface Customer {
  system_id: string
  name: string
  email: string
}

interface InteractionFormData {
  interaction_type: string
  subject: string
  description: string
  outcome: string
  priority: string
  status: string
  is_billable: boolean
  billable_hours: string
  scheduled_at: string
  completed_at: string
  follow_up_date: string
}

interface CustomerInteractionsProps {
  customerId: string
  onBack: () => void
}

export default function CustomerInteractions({ customerId, onBack }: CustomerInteractionsProps) {
  const { token } = useAuth()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [interactions, setInteractions] = useState<CustomerInteraction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState<InteractionFormData>({
    interaction_type: 'note',
    subject: '',
    description: '',
    outcome: '',
    priority: 'medium',
    status: 'completed',
    is_billable: false,
    billable_hours: '',
    scheduled_at: '',
    completed_at: new Date().toISOString().slice(0, 16),
    follow_up_date: ''
  })

  const interactionTypes = [
    { value: 'call', label: 'Phone Call', icon: '📞' },
    { value: 'email', label: 'Email', icon: '✉️' },
    { value: 'meeting', label: 'Meeting', icon: '🤝' },
    { value: 'note', label: 'Note', icon: '📝' },
    { value: 'follow_up', label: 'Follow-up', icon: '⏰' }
  ]

  const priorities = [
    { value: 'low', label: 'Low', color: 'text-green-600' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
    { value: 'high', label: 'High', color: 'text-orange-600' },
    { value: 'urgent', label: 'Urgent', color: 'text-red-600' }
  ]

  useEffect(() => {
    console.log('CustomerInteractions - customerId received:', customerId, 'Type:', typeof customerId)
    if (token && customerId) {
      fetchInteractions()
    }
  }, [token, customerId])

  const fetchInteractions = async () => {
    try {
      setLoading(true)
      console.log('Fetching interactions for customerId:', customerId)
      
      // Defensive check - ensure customerId is a valid string
      if (!customerId || typeof customerId !== 'string' || customerId === '[object Object]') {
        console.error('Invalid customerId received:', customerId)
        setError('Invalid customer ID. Please go back and select a customer.')
        setLoading(false)
        return
      }
      
      const response = await fetch(`http://localhost:8005/api/crm/customers/${customerId}/interactions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch customer interactions')
      }

      const data = await response.json()
      setCustomer(data.customer)
      setInteractions(data.interactions || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load interactions')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateInteraction = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch(`http://localhost:8005/api/crm/customers/${customerId}/interactions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to create interaction')
      }

      setShowCreateForm(false)
      setFormData({
        interaction_type: 'note',
        subject: '',
        description: '',
        outcome: '',
        priority: 'medium',
        status: 'completed',
        is_billable: false,
        billable_hours: '',
        scheduled_at: '',
        completed_at: new Date().toISOString().slice(0, 16),
        follow_up_date: ''
      })
      fetchInteractions()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create interaction')
    }
  }

  const getInteractionIcon = (type: string) => {
    const typeObj = interactionTypes.find(t => t.value === type)
    return typeObj?.icon || '📝'
  }

  const getPriorityColor = (priority: string) => {
    const priorityObj = priorities.find(p => p.value === priority)
    return priorityObj?.color || 'text-gray-600'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Customer Interactions</h2>
          <button onClick={onBack} className="text-gray-600 hover:text-gray-800">
            ← Back
          </button>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
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
          <button onClick={onBack} className="text-gray-600 hover:text-gray-800 mb-2">
            ← Back
          </button>
          <h2 className="text-2xl font-bold">Customer Interactions</h2>
          {customer && (
            <p className="text-gray-600">
              {customer.name} ({customer.email})
            </p>
          )}
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Add Interaction
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Interactions Timeline */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium">Interaction History ({interactions.length})</h3>
        </div>
        
        {interactions.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No interactions recorded yet. Add the first interaction to get started.
          </div>
        ) : (
          <div className="p-6">
            <div className="flow-root">
              <ul className="-mb-8">
                {interactions.map((interaction, index) => (
                  <li key={interaction.system_id}>
                    <div className="relative pb-8">
                      {index !== interactions.length - 1 && (
                        <span
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      )}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-lg">
                            {getInteractionIcon(interaction.interaction_type)}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <p className="text-sm font-medium text-gray-900">
                                {interaction.subject || `${interaction.interaction_type} interaction`}
                              </p>
                              <span className={`text-xs font-medium ${getPriorityColor(interaction.priority)}`}>
                                {interaction.priority}
                              </span>
                              {interaction.is_billable && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                  Billable
                                </span>
                              )}
                            </div>
                            {interaction.description && (
                              <p className="mt-1 text-sm text-gray-700">{interaction.description}</p>
                            )}
                            {interaction.outcome && (
                              <p className="mt-1 text-sm text-gray-600">
                                <strong>Outcome:</strong> {interaction.outcome}
                              </p>
                            )}
                            {interaction.follow_up_date && (
                              <p className="mt-1 text-sm text-orange-600">
                                <strong>Follow-up:</strong> {formatDate(interaction.follow_up_date)}
                              </p>
                            )}
                            {interaction.billable_hours && (
                              <p className="mt-1 text-sm text-green-600">
                                <strong>Hours:</strong> {interaction.billable_hours}
                              </p>
                            )}
                            <div className="mt-2 text-xs text-gray-500">
                              <span>By {interaction.created_by.name}</span>
                              <span className="mx-1">•</span>
                              <span>{formatDate(interaction.created_at)}</span>
                              {interaction.completed_at && (
                                <>
                                  <span className="mx-1">•</span>
                                  <span>Completed: {formatDate(interaction.completed_at)}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Create Interaction Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white max-h-[80vh] overflow-y-auto">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add Interaction</h3>
              <form onSubmit={handleCreateInteraction} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type *</label>
                  <select
                    value={formData.interaction_type}
                    onChange={(e) => setFormData({ ...formData, interaction_type: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    {interactionTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Subject</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Brief description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Detailed notes about the interaction"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Outcome</label>
                  <input
                    type="text"
                    value={formData.outcome}
                    onChange={(e) => setFormData({ ...formData, outcome: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="e.g., Interested, Follow-up needed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    {priorities.map((priority) => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_billable}
                      onChange={(e) => setFormData({ ...formData, is_billable: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Billable time</span>
                  </label>
                </div>
                {formData.is_billable && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Billable Hours</label>
                    <input
                      type="text"
                      value={formData.billable_hours}
                      onChange={(e) => setFormData({ ...formData, billable_hours: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="e.g., 2.5"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Completed At</label>
                  <input
                    type="datetime-local"
                    value={formData.completed_at}
                    onChange={(e) => setFormData({ ...formData, completed_at: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Follow-up Date</label>
                  <input
                    type="datetime-local"
                    value={formData.follow_up_date}
                    onChange={(e) => setFormData({ ...formData, follow_up_date: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Add Interaction
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
