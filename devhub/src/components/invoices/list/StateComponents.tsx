'use client'

import React from 'react';

interface LoadingStateProps {
  itemCount?: number;
}

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

interface EmptyStateProps {
  showCreateButton?: boolean;
  onCreateInvoice?: () => void;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ itemCount = 3 }) => {
  return (
    <div className="animate-pulse space-y-4">
      {[...Array(itemCount)].map((_, i) => (
        <div key={i} className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-5 bg-gray-200 rounded w-32"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            </div>
            <div className="flex gap-2 ml-4">
              <div className="h-4 bg-gray-200 rounded w-8"></div>
              <div className="h-4 bg-gray-200 rounded w-12"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-md p-4">
      <div className="text-red-800">
        <strong>Error loading invoices:</strong> {error}
      </div>
      <button 
        onClick={onRetry}
        className="mt-2 text-red-600 hover:text-red-800 underline transition-colors"
      >
        Try again
      </button>
    </div>
  );
};

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  showCreateButton = true, 
  onCreateInvoice 
}) => {
  const handleCreateClick = () => {
    if (onCreateInvoice) {
      onCreateInvoice();
    }
  };

  return (
    <div className="text-center py-12 bg-white rounded-lg shadow">
      <div className="text-gray-500">
        <svg 
          className="mx-auto h-12 w-12 text-gray-400" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No invoices</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by creating your first invoice.
        </p>
        {showCreateButton && onCreateInvoice && (
          <button
            onClick={handleCreateClick}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Invoice
          </button>
        )}
      </div>
    </div>
  );
};
