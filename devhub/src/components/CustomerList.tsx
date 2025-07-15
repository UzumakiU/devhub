'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'

interface Customer {
  id: number
  system_id: string
  name: string
  email?: string
  phone?: string
  company?: string
  address_line1?: string
  city?: string
  state?: string
  country?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface CustomerListProps {
  limit?: number
  showCreateButton?: boolean
  refresh?: number
  onEdit?: (customer: Customer) => void
  onViewInteractions?: (customerId: string) => void
}

export default function CustomerList({ 
  limit, 
  showCreateButton = true, 
  refresh, 
  onEdit,
  onViewInteractions
}: CustomerListProps) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadCustomers()
  }, [refresh])

  const loadCustomers = async () => {
    try {
      setLoading(true)
      const response = await api.getCustomers()
      
      if (response.success && response.data) {
        let customerList = response.data
        if (limit) {
          customerList = customerList.slice(0, limit)
        }
        setCustomers(customerList)
      } else {
        setCustomers([])
      }
      setError(null)
    } catch (err) {
      console.error('Error loading customers:', err)
      setError(err instanceof Error ? err.message : 'Failed to load customers')
      setCustomers([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (systemId: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) return
    
    try {
      await api.deleteRecord('customers', systemId)
      await loadCustomers() // Refresh list
    } catch (err) {
      console.error('Error deleting customer:', err)
      alert('Failed to delete customer')
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="text-red-800">
          <strong>Error loading customers:</strong> {error}
        </div>
        <button 
          onClick={loadCustomers}
          className="mt-2 text-red-600 hover:text-red-800 underline"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">
          {limit ? `Recent Customers (${customers.length})` : `All Customers (${customers.length})`}
        </h3>
        {showCreateButton && (
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
            Add Customer
          </button>
        )}
      </div>

      {/* Customer List */}
      {customers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <div className="text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No customers</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first customer.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {customers.map((customer) => (
            <div key={customer.system_id} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">
                      {customer.name || 'Unnamed Customer'}
                    </h4>
                    <span className="text-sm text-gray-500">({customer.system_id})</span>
                    {!customer.is_active && (
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                        Inactive
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-600">
                    {customer.company && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Company:</span>
                        <span>{customer.company}</span>
                      </div>
                    )}
                    {customer.email && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Email:</span>
                        <a href={`mailto:${customer.email}`} className="text-blue-600 hover:text-blue-800">
                          {customer.email}
                        </a>
                      </div>
                    )}
                    {customer.phone && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Phone:</span>
                        <a href={`tel:${customer.phone}`} className="text-blue-600 hover:text-blue-800">
                          {customer.phone}
                        </a>
                      </div>
                    )}
                    {(customer.city || customer.state || customer.country) && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Location:</span>
                        <span>
                          {[customer.city, customer.state, customer.country].filter(Boolean).join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-3 text-xs text-gray-500">
                    Created: {new Date(customer.created_at).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="flex gap-2 ml-4">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(customer)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Edit
                    </button>
                  )}
                  {onViewInteractions && (
                    <button
                      onClick={() => onViewInteractions(customer.system_id)}
                      className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                    >
                      Interactions
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(customer.system_id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
