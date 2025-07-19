'use client'

import { useState, useEffect, useCallback } from 'react'
import useAuth from '@/hooks/useAuth'
import InteractionForm from '@/components/interactions/InteractionForm'
import InteractionList from '@/components/interactions/InteractionList'
import Alert from '@/components/common/Alert'
import type { CustomerInteraction, Customer, InteractionFormData } from '@/types/interactions'

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
  const [submitting, setSubmitting] = useState(false)

  const fetchInteractions = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      
      const response = await fetch(`http://localhost:8005/api/crm/customers/${customerId}/interactions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch interactions')
      }

      const data = await response.json()
      setCustomer(data.customer)
      setInteractions(data.interactions || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch interactions')
    } finally {
      setLoading(false)
    }
  }, [customerId, token])

  useEffect(() => {
    fetchInteractions()
  }, [fetchInteractions])

  const handleCreateInteraction = async (formData: InteractionFormData) => {
    try {
      setSubmitting(true)
      setError('')
      
      const response = await fetch(`http://localhost:8005/api/crm/customers/${customerId}/interactions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          billable_hours: formData.billable_hours ? parseFloat(formData.billable_hours) : null,
          scheduled_at: formData.scheduled_at || null,
          completed_at: formData.completed_at || null,
          follow_up_date: formData.follow_up_date || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to create interaction')
      }

      setShowCreateForm(false)
      await fetchInteractions()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create interaction')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading && !customer) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading customer interactions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Customer Interactions</h2>
            {customer && (
              <p className="text-gray-600">
                {customer.name} ({customer.system_id}) - {customer.email}
              </p>
            )}
          </div>
        </div>
        
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
        >
          {showCreateForm ? 'Cancel' : 'New Interaction'}
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert
          type="error"
          message={error}
          onClose={() => setError('')}
        />
      )}

      {/* Create Form */}
      {showCreateForm && (
        <InteractionForm
          onSubmit={handleCreateInteraction}
          onCancel={() => setShowCreateForm(false)}
          loading={submitting}
        />
      )}

      {/* Interactions List */}
      <div>
        <h3 className="text-lg font-medium text-foreground mb-4">
          All Interactions ({interactions.length})
        </h3>
        <InteractionList interactions={interactions} loading={loading && !!customer} />
      </div>
    </div>
  )
}
