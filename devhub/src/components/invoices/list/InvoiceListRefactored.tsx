'use client'

import React, { useState, useEffect, useCallback } from 'react';
import useAuth from '@/hooks/useAuth';
import { InvoiceListItem, InvoiceListProps } from './types';
import { InvoiceListService } from './InvoiceListService';
import { InvoiceListHeader } from './InvoiceListHeader';
import { InvoiceCard } from './InvoiceCard';
import { LoadingState, ErrorState, EmptyState } from './StateComponents';

export const InvoiceListRefactored: React.FC<InvoiceListProps> = ({ 
  limit, 
  showCreateButton = true, 
  refresh, 
  onEdit 
}) => {
  const { token } = useAuth();
  const [invoices, setInvoices] = useState<InvoiceListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadInvoices = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);
      
      const service = new InvoiceListService(token);
      const fetchedInvoices = await service.fetchInvoices(limit);
      setInvoices(fetchedInvoices);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load invoices';
      setError(errorMessage);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }, [token, limit]);

  useEffect(() => {
    loadInvoices();
  }, [refresh, loadInvoices]);

  const handleDelete = async (systemId: string) => {
    if (!token) return;

    try {
      const service = new InvoiceListService(token);
      await service.deleteInvoice(systemId);
      await loadInvoices(); // Refresh list
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete invoice';
      alert(errorMessage);
    }
  };

  const handleRetry = () => {
    loadInvoices();
  };

  const handleCreateInvoice = () => {
    // This would typically navigate to create invoice page
    // For now, just log the action
    console.log('Create invoice clicked');
  };

  // Loading state
  if (loading) {
    return <LoadingState itemCount={limit || 5} />;
  }

  // Error state
  if (error) {
    return <ErrorState error={error} onRetry={handleRetry} />;
  }

  // Empty state
  if (invoices.length === 0) {
    return (
      <div className="space-y-6">
        <InvoiceListHeader 
          totalInvoices={0}
          limit={limit}
          showCreateButton={showCreateButton}
          onCreateInvoice={handleCreateInvoice}
        />
        <EmptyState 
          showCreateButton={showCreateButton}
          onCreateInvoice={handleCreateInvoice}
        />
      </div>
    );
  }

  // Main content
  return (
    <div className="space-y-6">
      <InvoiceListHeader 
        totalInvoices={invoices.length}
        limit={limit}
        showCreateButton={showCreateButton}
        onCreateInvoice={handleCreateInvoice}
      />

      {/* Invoice List */}
      <div className="grid gap-4">
        {invoices.map((invoice) => (
          <InvoiceCard
            key={invoice.system_id}
            invoice={invoice}
            onEdit={onEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
};
