'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'

interface Invoice {
  id: number
  system_id: string
  customer_id?: string
  amount: string
  currency: string
  status: string
  issue_date?: string
  due_date?: string
  paid_date?: string
  created_at: string
  updated_at: string
}

interface InvoiceListProps {
  limit?: number
  showCreateButton?: boolean
  refresh?: number
  onEdit?: (invoice: Invoice) => void
}

export default function InvoiceList({ 
  limit, 
  showCreateButton = true, 
  refresh, 
  onEdit 
}: InvoiceListProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadInvoices()
  }, [refresh])

  const loadInvoices = async () => {
    try {
      setLoading(true)
      const response = await api.getTableData('invoices')
      
      if (response.success && response.data) {
        let invoiceList = response.data
        if (limit) {
          invoiceList = invoiceList.slice(0, limit)
        }
        setInvoices(invoiceList)
      } else {
        setInvoices([])
      }
      setError(null)
    } catch (err) {
      console.error('Error loading invoices:', err)
      setError(err instanceof Error ? err.message : 'Failed to load invoices')
      setInvoices([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (systemId: string) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return
    
    try {
      await api.deleteRecord('invoices', systemId)
      await loadInvoices() // Refresh list
    } catch (err) {
      console.error('Error deleting invoice:', err)
      alert('Failed to delete invoice')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'overdue':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString()
  }

  const formatAmount = (amount: string, currency: string = 'USD') => {
    const numAmount = parseFloat(amount) || 0
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(numAmount)
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
          <strong>Error loading invoices:</strong> {error}
        </div>
        <button 
          onClick={loadInvoices}
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
          {limit ? `Recent Invoices (${invoices.length})` : `All Invoices (${invoices.length})`}
        </h3>
        {showCreateButton && (
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Create Invoice
          </button>
        )}
      </div>

      {/* Invoice List */}
      {invoices.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <div className="text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No invoices</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first invoice.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {invoices.map((invoice) => (
            <div key={invoice.system_id} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h4 className="text-lg font-semibold text-gray-900">
                      Invoice {invoice.system_id}
                    </h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(invoice.status)}`}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium text-gray-900">Amount:</span>
                      <div className="text-lg font-semibold text-green-600">
                        {formatAmount(invoice.amount, invoice.currency)}
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium text-gray-900">Customer:</span>
                      <div>{invoice.customer_id || 'No customer assigned'}</div>
                    </div>
                    
                    <div>
                      <span className="font-medium text-gray-900">Issue Date:</span>
                      <div>{formatDate(invoice.issue_date)}</div>
                    </div>
                    
                    <div>
                      <span className="font-medium text-gray-900">Due Date:</span>
                      <div className={invoice.due_date && new Date(invoice.due_date) < new Date() && invoice.status !== 'paid' ? 'text-red-600 font-medium' : ''}>
                        {formatDate(invoice.due_date)}
                      </div>
                    </div>
                    
                    {invoice.paid_date && (
                      <div>
                        <span className="font-medium text-gray-900">Paid Date:</span>
                        <div className="text-green-600">{formatDate(invoice.paid_date)}</div>
                      </div>
                    )}
                    
                    <div>
                      <span className="font-medium text-gray-900">Created:</span>
                      <div>{formatDate(invoice.created_at)}</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 ml-4">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(invoice)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Edit
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(invoice.system_id)}
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
