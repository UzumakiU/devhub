// Types and constants for Invoice List module

import { Invoice as ApiInvoice } from '@/types/api';

export interface InvoiceListItem extends ApiInvoice {
  id?: number;
  currency?: string;
  issue_date?: string;
  due_date?: string;
  paid_date?: string;
  updated_at?: string;
}

export interface InvoiceListProps {
  limit?: number;
  showCreateButton?: boolean;
  refresh?: number;
  onEdit?: (invoice: InvoiceListItem) => void;
}

export interface InvoiceListHeaderProps {
  totalInvoices: number;
  limit?: number;
  showCreateButton: boolean;
  onCreateInvoice?: () => void;
}

export interface InvoiceCardProps {
  invoice: InvoiceListItem;
  onEdit?: (invoice: InvoiceListItem) => void;
  onDelete: (systemId: string) => void;
}

export interface StatusInfo {
  value: string;
  label: string;
  colorClass: string;
}

export const INVOICE_STATUSES: StatusInfo[] = [
  { value: 'paid', label: 'Paid', colorClass: 'bg-green-100 text-green-800' },
  { value: 'overdue', label: 'Overdue', colorClass: 'bg-red-100 text-red-800' },
  { value: 'pending', label: 'Pending', colorClass: 'bg-yellow-100 text-yellow-800' },
  { value: 'draft', label: 'Draft', colorClass: 'bg-gray-100 text-gray-800' }
];
