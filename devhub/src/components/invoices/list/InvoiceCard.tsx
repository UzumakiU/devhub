'use client'

import React from 'react';
import { InvoiceCardProps } from './types';
import { InvoiceListService } from './InvoiceListService';
import { InvoiceListUtils } from './InvoiceListUtils';

export const InvoiceCard: React.FC<InvoiceCardProps> = ({
  invoice,
  onEdit,
  onDelete
}) => {
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;
    onDelete(invoice.system_id);
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(invoice);
    }
  };

  return (
    <div className="bg-card p-6 rounded-lg shadow hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <h4 className="text-lg font-semibold text-foreground">
              {InvoiceListUtils.getInvoiceTitle(invoice)}
            </h4>
            <span className={`text-xs px-2 py-1 rounded-full ${InvoiceListUtils.getStatusColor(invoice.status)}`}>
              {InvoiceListUtils.capitalizeStatus(invoice.status)}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            {/* Amount */}
            <div>
              <span className="font-medium text-foreground">Amount:</span>
              <div className="text-lg font-semibold text-green-600">
                {InvoiceListService.formatAmount(invoice.amount, invoice.currency)}
              </div>
            </div>
            
            {/* Customer */}
            <div>
              <span className="font-medium text-foreground">Customer:</span>
              <div>{InvoiceListUtils.getCustomerDisplay(invoice)}</div>
            </div>
            
            {/* Issue Date */}
            <div>
              <span className="font-medium text-foreground">Issue Date:</span>
              <div>{InvoiceListService.formatDate(invoice.issue_date)}</div>
            </div>
            
            {/* Due Date */}
            <div>
              <span className="font-medium text-foreground">Due Date:</span>
              <div className={InvoiceListUtils.getDateClassName(invoice)}>
                {InvoiceListService.formatDate(invoice.due_date)}
                {InvoiceListUtils.shouldHighlightOverdue(invoice) && (
                  <span className="ml-1 text-xs">⚠️ Overdue</span>
                )}
              </div>
            </div>
            
            {/* Paid Date (if applicable) */}
            {invoice.paid_date && (
              <div>
                <span className="font-medium text-foreground">Paid Date:</span>
                <div className="text-green-600">
                  {InvoiceListService.formatDate(invoice.paid_date)}
                </div>
              </div>
            )}
            
            {/* Created Date */}
            <div>
              <span className="font-medium text-foreground">Created:</span>
              <div>{InvoiceListService.formatDate(invoice.created_at)}</div>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2 ml-4">
          {onEdit && (
            <button
              onClick={handleEdit}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
              title="Edit invoice"
            >
              Edit
            </button>
          )}
          <button
            onClick={handleDelete}
            className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
            title="Delete invoice"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
