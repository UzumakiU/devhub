'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { InvoiceFormProps, InvoiceFormData, Customer } from './types'
import { InvoiceService } from './InvoiceService'
import CustomerSelection from './CustomerSelection'
import AmountCurrency from './AmountCurrency'
import InvoiceStatus from './InvoiceStatus'
import InvoiceDates from './InvoiceDates'

export default function InvoiceForm({ invoice, onSuccess, onCancel }: InvoiceFormProps) {
  const [formData, setFormData] = useState<InvoiceFormData>({
    customer_id: invoice?.customer_id || '',
    amount: invoice?.amount || '',
    currency: invoice?.currency || 'USD',
    status: invoice?.status || 'draft',
    issue_date: invoice?.issue_date ? invoice.issue_date.split('T')[0] : new Date().toISOString().split('T')[0],
    due_date: invoice?.due_date ? invoice.due_date.split('T')[0] : '',
    paid_date: invoice?.paid_date ? invoice.paid_date.split('T')[0] : '',
  })
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const invoiceService = useMemo(() => new InvoiceService(), [])

  const loadCustomers = useCallback(async () => {
    const customerData = await invoiceService.loadCustomers()
    setCustomers(customerData)
  }, [invoiceService])

  useEffect(() => {
    loadCustomers()
  }, [loadCustomers])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Auto-calculate due date when issue date changes
    if (name === 'issue_date' && value && !formData.due_date) {
      const calculatedDueDate = invoiceService.calculateDueDate(value)
      setFormData(prev => ({
        ...prev,
        due_date: calculatedDueDate
      }))
    }
    
    // Clear validation errors when user starts typing
    if (validationErrors.length > 0) {
      setValidationErrors([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setValidationErrors([])

    try {
      // Validate form data
      const errors = invoiceService.validateInvoiceData(formData)
      if (errors.length > 0) {
        setValidationErrors(errors)
        setLoading(false)
        return
      }

      if (invoice?.system_id) {
        // Update existing invoice
        await invoiceService.updateInvoice(invoice.system_id, formData)
      } else {
        // Create new invoice
        await invoiceService.createInvoice(formData)
      }
      
      onSuccess()
    } catch (err) {
      console.error('Error saving invoice:', err)
      setError(err instanceof Error ? err.message : 'Failed to save invoice')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {invoice ? 'Edit Invoice' : 'Create New Invoice'}
            </h3>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CustomerSelection
                customers={customers}
                selectedCustomerId={formData.customer_id}
                onChange={handleChange}
              />
              <InvoiceStatus
                status={formData.status}
                onChange={handleChange}
              />
            </div>

            <AmountCurrency
              amount={formData.amount}
              currency={formData.currency}
              onChange={handleChange}
            />

            <InvoiceDates
              issueDate={formData.issue_date}
              dueDate={formData.due_date}
              paidDate={formData.paid_date}
              status={formData.status}
              onChange={handleChange}
            />

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="text-red-800 text-sm">
                  <ul className="list-disc list-inside space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* General Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="text-red-800 text-sm">{error}</div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : (invoice ? 'Update Invoice' : 'Create Invoice')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
