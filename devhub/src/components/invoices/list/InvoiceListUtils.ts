import { INVOICE_STATUSES, StatusInfo, InvoiceListItem } from './types';

export class InvoiceListUtils {
  static getStatusInfo(status: string): StatusInfo {
    const statusInfo = INVOICE_STATUSES.find(s => s.value === status.toLowerCase());
    return statusInfo || { value: status, label: status, colorClass: 'bg-gray-100 text-gray-800' };
  }

  static getStatusColor(status: string): string {
    return this.getStatusInfo(status).colorClass;
  }

  static capitalizeStatus(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  static validateInvoice(invoice: InvoiceListItem): boolean {
    return !!(
      invoice.system_id &&
      invoice.amount &&
      invoice.status
    );
  }

  static getInvoiceTitle(invoice: InvoiceListItem): string {
    return `Invoice ${invoice.system_id}`;
  }

  static getCustomerDisplay(invoice: InvoiceListItem): string {
    return invoice.customer_id || 'No customer assigned';
  }

  static shouldHighlightOverdue(invoice: InvoiceListItem): boolean {
    return !!(
      invoice.due_date &&
      new Date(invoice.due_date) < new Date() &&
      invoice.status !== 'paid'
    );
  }

  static getDateClassName(invoice: InvoiceListItem): string {
    return this.shouldHighlightOverdue(invoice) ? 'text-red-600 font-medium' : '';
  }

  static filterInvoicesByStatus(invoices: InvoiceListItem[], status: string): InvoiceListItem[] {
    return invoices.filter(invoice => invoice.status.toLowerCase() === status.toLowerCase());
  }

  static getInvoiceStats(invoices: InvoiceListItem[]) {
    const stats = {
      total: invoices.length,
      paid: 0,
      pending: 0,
      overdue: 0,
      draft: 0,
      totalAmount: 0
    };

    invoices.forEach(invoice => {
      const amount = typeof invoice.amount === 'string' ? parseFloat(invoice.amount) : invoice.amount;
      stats.totalAmount += amount || 0;

      switch (invoice.status.toLowerCase()) {
        case 'paid':
          stats.paid++;
          break;
        case 'pending':
          stats.pending++;
          break;
        case 'overdue':
          stats.overdue++;
          break;
        case 'draft':
          stats.draft++;
          break;
      }
    });

    return stats;
  }
}
