import React from 'react';

interface LoadingStateProps {
  onBack: () => void;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ onBack }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">All Customer Interactions</h2>
        <button
          onClick={onBack}
          className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
        >
          ← Back to Dashboard
        </button>
      </div>
      
      <div className="animate-pulse space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-card p-6 rounded-lg shadow">
            <div className="flex items-center space-x-3 mb-3">
              <div className="h-8 w-8 bg-gray-200 rounded"></div>
              <div className="h-5 bg-gray-200 rounded w-1/3"></div>
              <div className="h-5 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="mt-3 flex space-x-4">
              <div className="h-3 bg-gray-200 rounded w-24"></div>
              <div className="h-3 bg-gray-200 rounded w-20"></div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface ErrorStateProps {
  error: string;
  onBack: () => void;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error, onBack, onRetry }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">All Customer Interactions</h2>
        <button
          onClick={onBack}
          className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
        >
          ← Back to Dashboard
        </button>
      </div>
      
      <div className="bg-red-50 border border-red-200 rounded-md p-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Error loading interactions
            </h3>
            <div className="mt-2 text-sm text-red-700">
              {error}
            </div>
            {onRetry && (
              <div className="mt-4">
                <button
                  onClick={onRetry}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface EmptyStateProps {
  onBack: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onBack }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">All Customer Interactions</h2>
          <p className="text-gray-600">0 interactions across all customers</p>
        </div>
        <button
          onClick={onBack}
          className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
        >
          ← Back to Dashboard
        </button>
      </div>

      <div className="bg-card shadow rounded-lg p-12 text-center">
        <div className="text-gray-400 text-6xl mb-4">💬</div>
        <h3 className="text-lg font-medium text-foreground mb-2">No interactions yet</h3>
        <p className="text-gray-500 max-w-sm mx-auto">
          Start engaging with your customers to see interactions here. Create interactions from individual customer pages.
        </p>
      </div>
    </div>
  );
};
