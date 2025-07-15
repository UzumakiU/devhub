'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import useAuth from '@/hooks/useAuth'
import Layout from '@/components/Layout'
import CustomerList from '@/components/CustomerList'
import CustomerForm from '@/components/CustomerForm'

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

export default function CustomersPage() {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [refreshCustomers, setRefreshCustomers] = useState(0)
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated()) {
      router.push('/auth/login')
    }
  }, [isLoading, isAuthenticated, router])

  const handleCustomerSuccess = () => {
    setShowCreateForm(false)
    setEditingCustomer(null)
    setRefreshCustomers(prev => prev + 1) // Trigger CustomerList refresh
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </Layout>
    )
  }

  if (!isAuthenticated()) {
    return null
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Customers
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage your customer relationships and contact information
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <button
              type="button"
              onClick={() => setShowCreateForm(true)}
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Customer
            </button>
          </div>
        </div>

        {/* Customer List */}
        <CustomerList 
          refresh={refreshCustomers}
          onEdit={setEditingCustomer}
          showCreateButton={false}
        />

        {/* Customer Form Modal */}
        {(showCreateForm || editingCustomer) && (
          <CustomerForm
            customer={editingCustomer}
            onSuccess={handleCustomerSuccess}
            onCancel={() => {
              setShowCreateForm(false)
              setEditingCustomer(null)
            }}
          />
        )}
      </div>
    </Layout>
  )
}
