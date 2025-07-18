'use client'

import React from 'react';
import { InvoiceListHeaderProps } from './types';

export const InvoiceListHeader: React.FC<InvoiceListHeaderProps> = ({
  totalInvoices,
  limit,
  showCreateButton,
  onCreateInvoice
}) => {
  const getTitle = () => {
    if (limit) {
      return `Recent Invoices (${totalInvoices})`;
    }
    return `All Invoices (${totalInvoices})`;
  };

  const handleCreateClick = () => {
    if (onCreateInvoice) {
      onCreateInvoice();
    }
  };

  return (
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-medium text-gray-900">
        {getTitle()}
      </h3>
      {showCreateButton && (
        <button 
          onClick={handleCreateClick}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create Invoice
        </button>
      )}
    </div>
  );
};
