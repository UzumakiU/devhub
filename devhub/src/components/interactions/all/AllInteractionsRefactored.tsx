'use client'

import React, { useState, useEffect, useCallback } from 'react';
import useAuth from '@/hooks/useAuth';
import { CustomerInteraction, AllInteractionsProps } from './types';
import { AllInteractionsService } from './AllInteractionsService';
import { AllInteractionsHeader } from './AllInteractionsHeader';
import { InteractionCard } from './InteractionCard';
import { LoadingState, ErrorState, EmptyState } from './StateComponents';

export const AllInteractionsRefactored: React.FC<AllInteractionsProps> = ({
  onBack,
  onViewCustomer
}) => {
  const { token } = useAuth();
  const [interactions, setInteractions] = useState<CustomerInteraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAllInteractions = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError('');
      
      const service = new AllInteractionsService(token);
      const fetchedInteractions = await service.fetchAllInteractions();
      setInteractions(fetchedInteractions);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load interactions';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAllInteractions();
  }, [fetchAllInteractions]);

  const handleRetry = () => {
    fetchAllInteractions();
  };

  // Loading state
  if (loading) {
    return <LoadingState onBack={onBack} />;
  }

  // Error state
  if (error) {
    return <ErrorState error={error} onBack={onBack} onRetry={handleRetry} />;
  }

  // Empty state
  if (interactions.length === 0) {
    return <EmptyState onBack={onBack} />;
  }

  // Main content
  return (
    <div className="space-y-6">
      <AllInteractionsHeader 
        totalInteractions={interactions.length}
        onBack={onBack}
      />

      {/* Interactions List */}
      <div className="space-y-4">
        {interactions.map((interaction) => (
          <InteractionCard
            key={interaction.system_id}
            interaction={interaction}
            onViewCustomer={onViewCustomer}
            showCustomerInfo={true}
          />
        ))}
      </div>
    </div>
  );
};
