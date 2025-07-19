'use client'

import React from 'react';

interface LoadingStateProps {
  showHeader?: boolean;
  itemCount?: number;
}

interface EmptyStateProps {
  showHeader?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ 
  showHeader = true, 
  itemCount = 4 
}) => {
  return (
    <div className="bg-card shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        {showHeader && (
          <h3 className="text-lg leading-6 font-medium text-foreground mb-4">
            Recent Activity
          </h3>
        )}
        <div className="animate-pulse space-y-4">
          {[...Array(itemCount)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="flex items-center space-x-2">
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 rounded w-12"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const EmptyState: React.FC<EmptyStateProps> = ({ showHeader = true }) => {
  return (
    <div className="bg-card shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        {showHeader && (
          <h3 className="text-lg leading-6 font-medium text-foreground mb-4">
            Recent Activity
          </h3>
        )}
        <div className="text-center py-6">
          <div className="text-gray-400 text-sm">
            No recent activity yet. Start by creating your first project, customer, or invoice!
          </div>
        </div>
      </div>
    </div>
  );
};

export const ErrorState: React.FC<{ error: string; onRetry: () => void; showHeader?: boolean }> = ({ 
  error, 
  onRetry, 
  showHeader = true 
}) => {
  return (
    <div className="bg-card shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        {showHeader && (
          <h3 className="text-lg leading-6 font-medium text-foreground mb-4">
            Recent Activity
          </h3>
        )}
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800 text-sm">
            <strong>Error loading activity:</strong> {error}
          </div>
          <button 
            onClick={onRetry}
            className="mt-2 text-red-600 hover:text-red-800 underline transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
};
