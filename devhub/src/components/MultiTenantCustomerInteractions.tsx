'use client'

import { useState, useEffect } from 'react'
import { crmService, Customer, CustomerInteraction } from '@/lib/multitenant-crm'

interface MultiTenantCustomerInteractionsProps {
  customerId: string
  onBack: () => void
}

export default function MultiTenantCustomerInteractions({ 
  customerId, 
  onBack 
}: MultiTenantCustomerInteractionsProps) {
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [interactions, setInteractions] = useState<CustomerInteraction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newInteraction, setNewInteraction] = useState({
    type: 'Email',
    subject: '',
    description: ''
  })

  useEffect(() => {
    loadCustomerData()
  }, [customerId])

  const loadCustomerData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Load customer info
      const customers = await crmService.getCustomers()
      const foundCustomer = customers.find(c => c.id === customerId)
      setCustomer(foundCustomer || null)
      
      // Load interactions
      const interactionsData = await crmService.getCustomerInteractions(customerId)
      setInteractions(interactionsData)
    } catch (err) {
      console.error('Error loading customer data:', err)
      setError('Failed to load customer data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateInteraction = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await crmService.createCustomerInteraction(customerId, newInteraction)
      setNewInteraction({
        type: 'Email',
        subject: '',
        description: ''
      })
      setShowCreateForm(false)
      await loadCustomerData()
    } catch (err) {
      console.error('Error creating interaction:', err)
      setError('Failed to create interaction. Please try again.')
    }
  }

  const getInteractionIcon = (type: string) => {
    switch (type) {
      case 'Email':
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        )
      case 'Phone':
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        )
      case 'Meeting':
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        )
      default:
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading customer interactions...</p>
        </div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Customer Not Found</h2>
          <p className="text-gray-600 mb-8">The customer you're looking for could not be found.</p>
          <button
            onClick={onBack}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Back to Customer List
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Customer Interactions</h1>
            <p className="mt-2 text-gray-600">
              {customer.company} - {customer.name}
            </p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={onBack}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Back to Customers
            </button>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Add Interaction
            </button>
          </div>
        </div>
      </div>

      {/* Customer Info Card */}
      <div className="mb-8 bg-card rounded-lg shadow-sm border border-border p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Company</h3>
            <p className="text-lg font-semibold text-foreground">{customer.company}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Contact</h3>
            <p className="text-lg font-semibold text-foreground">{customer.name}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Email</h3>
            <p className="text-lg font-semibold text-foreground">{customer.email}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Phone</h3>
            <p className="text-lg font-semibold text-foreground">{customer.phone || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Create Interaction Form */}
      {showCreateForm && (
        <div className="mb-8 bg-card rounded-lg shadow-sm border border-border p-6">
          <h2 className="text-lg font-medium text-foreground mb-4">Add New Interaction</h2>
          <form onSubmit={handleCreateInteraction} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={newInteraction.type}
                  onChange={(e) => setNewInteraction({...newInteraction, type: e.target.value})}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Email">Email</option>
                  <option value="Phone">Phone</option>
                  <option value="Meeting">Meeting</option>
                  <option value="Note">Note</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={newInteraction.subject}
                  onChange={(e) => setNewInteraction({...newInteraction, subject: e.target.value})}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                required
                value={newInteraction.description}
                onChange={(e) => setNewInteraction({...newInteraction, description: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Create Interaction
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Interactions List */}
      <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-lg font-medium text-foreground">Interactions ({interactions.length})</h2>
        </div>
        
        {interactions.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {interactions.map((interaction) => (
              <div key={interaction.id} className="px-6 py-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                      {getInteractionIcon(interaction.type)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-foreground">{interaction.type}</span>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-500">
                          {new Date(interaction.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-sm font-medium text-foreground mt-1">{interaction.subject}</h3>
                    <p className="text-sm text-gray-600 mt-1">{interaction.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M8 14v20c0 4.418 7.163 8 16 8 1.381 0 2.721-.087 4-.252M8 14c0 4.418 7.163 8 16 8s16-3.582 16-8M8 14c0-4.418 7.163-8 16-8s16 3.582 16 8m0 0v14m-16-4c0 4.418 7.163 8 16 8 1.381 0 2.721-.087 4-.252" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-foreground">No interactions</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by adding your first interaction with this customer.</p>
            <div className="mt-6">
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Add Interaction
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
