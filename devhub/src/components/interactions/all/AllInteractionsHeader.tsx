import React from 'react';

interface AllInteractionsHeaderProps {
  totalInteractions: number;
  onBack: () => void;
  isLoading?: boolean;
}

export const AllInteractionsHeader: React.FC<AllInteractionsHeaderProps> = ({
  totalInteractions,
  onBack,
  isLoading = false
}) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">All Customer Interactions</h2>
        <p className="text-gray-600">
          {isLoading ? (
            <span className="animate-pulse">Loading interactions...</span>
          ) : (
            <>
              {totalInteractions} interaction{totalInteractions !== 1 ? 's' : ''} across all customers
            </>
          )}
        </p>
      </div>
      <button
        onClick={onBack}
        className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
      >
        ← Back to Dashboard
      </button>
    </div>
  );
};
