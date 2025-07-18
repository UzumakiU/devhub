// Invoice-related TypeScript definitions and interfaces

export interface Invoice {
  id?: number
  system_id?: string
  customer_id?: string
  amount: string
  currency?: string
  status?: string
  issue_date?: string
  due_date?: string
  paid_date?: string
}

export interface Customer {
  system_id: string
  name: string
}

export interface InvoiceFormData extends Omit<Invoice, 'id' | 'system_id'> {
  customer_id: string
  amount: string
  currency: string
  status: string
  issue_date: string
  due_date: string
  paid_date: string
}

export interface InvoiceFormProps {
  invoice?: Invoice | null
  onSuccess: () => void
  onCancel: () => void
}

export interface CustomerSelectionProps {
  customers: Customer[]
  selectedCustomerId: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
}

export interface AmountCurrencyProps {
  amount: string
  currency: string
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
}

export interface InvoiceDatesProps {
  issueDate: string
  dueDate: string
  paidDate: string
  status: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export interface InvoiceStatusProps {
  status: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
}

export const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'cancelled', label: 'Cancelled' },
]

export const currencyOptions = [
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'CAD', label: 'CAD - Canadian Dollar' },
  { value: 'AUD', label: 'AUD - Australian Dollar' },
]
