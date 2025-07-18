import { api } from '@/lib/api'
import { InvoiceFormData, Customer } from './types'

export class InvoiceService {
  /**
   * Create a new invoice
   */
  async createInvoice(invoiceData: InvoiceFormData): Promise<void> {
    const formattedData = this.formatInvoiceData(invoiceData)
    const response = await api.createRecord('invoices', formattedData)
    if (!response.success) {
      throw new Error(response.error || 'Failed to create invoice')
    }
  }

  /**
   * Update an existing invoice
   */
  async updateInvoice(systemId: string, invoiceData: InvoiceFormData): Promise<void> {
    const formattedData = this.formatInvoiceData(invoiceData)
    const response = await api.updateRecord('invoices', systemId, formattedData)
    if (!response.success) {
      throw new Error(response.error || 'Failed to update invoice')
    }
  }

  /**
   * Load customers for dropdown selection
   */
  async loadCustomers(): Promise<Customer[]> {
    try {
      const response = await api.getCustomers()
      if (response.success && response.data) {
        return response.data
      }
      return []
    } catch (error) {
      console.error('Error loading customers:', error)
      return []
    }
  }

  /**
   * Validate invoice form data
   */
  validateInvoiceData(data: InvoiceFormData): string[] {
    const errors: string[] = []

    if (!data.amount || parseFloat(data.amount) <= 0) {
      errors.push('Amount must be greater than 0')
    }

    if (!data.customer_id) {
      errors.push('Please select a customer')
    }

    if (!data.issue_date) {
      errors.push('Issue date is required')
    }

    if (data.due_date && data.issue_date && new Date(data.due_date) < new Date(data.issue_date)) {
      errors.push('Due date cannot be before issue date')
    }

    if (data.status === 'paid' && !data.paid_date) {
      errors.push('Paid date is required when status is paid')
    }

    if (data.paid_date && data.issue_date && new Date(data.paid_date) < new Date(data.issue_date)) {
      errors.push('Paid date cannot be before issue date')
    }

    return errors
  }

  /**
   * Format invoice data for submission
   */
  formatInvoiceData(data: InvoiceFormData): Record<string, unknown> {
    return {
      customer_id: data.customer_id || null,
      amount: parseFloat(data.amount) || 0,
      currency: data.currency || 'USD',
      status: data.status || 'draft',
      issue_date: data.issue_date ? new Date(data.issue_date).toISOString() : null,
      due_date: data.due_date ? new Date(data.due_date).toISOString() : null,
      paid_date: data.paid_date ? new Date(data.paid_date).toISOString() : null,
    }
  }

  /**
   * Format amount for display
   */
  formatAmount(amount: string | number, currency: string = 'USD'): string {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(numAmount || 0)
  }

  /**
   * Calculate due date based on issue date (30 days default)
   */
  calculateDueDate(issueDate: string, daysToAdd: number = 30): string {
    if (!issueDate) return ''
    
    const date = new Date(issueDate)
    date.setDate(date.getDate() + daysToAdd)
    return date.toISOString().split('T')[0]
  }

  /**
   * Check if invoice is overdue
   */
  isOverdue(dueDate: string, status: string): boolean {
    if (!dueDate || status === 'paid' || status === 'cancelled') return false
    return new Date(dueDate) < new Date()
  }
}
