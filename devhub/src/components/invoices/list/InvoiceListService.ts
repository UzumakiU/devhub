import { api } from '@/lib/api';
import { InvoiceListItem } from './types';

export class InvoiceListService {
  constructor(private token: string) {}

  async fetchInvoices(limit?: number): Promise<InvoiceListItem[]> {
    try {
      const response = await api.getTableData('invoices');
      
      if (response.success && response.data) {
        let invoiceList = response.data as InvoiceListItem[];
        
        if (limit) {
          invoiceList = invoiceList.slice(0, limit);
        }
        
        return this.sortInvoicesByDate(invoiceList);
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching invoices:', error);
      throw new Error('Failed to load invoices');
    }
  }

  async deleteInvoice(systemId: string): Promise<void> {
    try {
      await api.deleteRecord('invoices', systemId);
    } catch (error) {
      console.error('Error deleting invoice:', error);
      throw new Error('Failed to delete invoice');
    }
  }

  private sortInvoicesByDate(invoices: InvoiceListItem[]): InvoiceListItem[] {
    return invoices.sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA; // Most recent first
    });
  }

  static formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  }

  static formatAmount(amount: string | number, currency: string = 'USD'): string {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(numAmount || 0);
  }

  static isOverdue(dueDate?: string, status?: string): boolean {
    if (!dueDate || status === 'paid') return false;
    return new Date(dueDate) < new Date();
  }
}
