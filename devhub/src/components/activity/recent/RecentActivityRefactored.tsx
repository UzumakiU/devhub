'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { ActivityItem, RecentActivityProps } from './types';
import { RecentActivityService } from './RecentActivityService';
import { ActivityCard } from './ActivityCard';
import { LoadingState, EmptyState, ErrorState } from './StateComponents';

export const RecentActivityRefactored: React.FC<RecentActivityProps> = ({
  maxItems = 6,
  showHeader = true,
  className = ''
}) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRecentActivity = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const service = new RecentActivityService(maxItems);
      const fetchedActivities = await service.fetchRecentActivity();
      setActivities(fetchedActivities);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load recent activity';
      setError(errorMessage);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, [maxItems]);

  useEffect(() => {
    loadRecentActivity();
  }, [loadRecentActivity]);

  const handleRetry = () => {
    loadRecentActivity();
  };

  // Loading state
  if (loading) {
    return <LoadingState showHeader={showHeader} itemCount={maxItems} />;
  }

  // Error state
  if (error) {
    return <ErrorState error={error} onRetry={handleRetry} showHeader={showHeader} />;
  }

  // Empty state
  if (activities.length === 0) {
    return <EmptyState showHeader={showHeader} />;
  }

  // Main content
  return (
    <div className={`bg-card shadow rounded-lg ${className}`}>
      <div className="px-4 py-5 sm:p-6">
        {showHeader && (
          <h3 className="text-lg leading-6 font-medium text-foreground mb-4">
            Recent Activity
          </h3>
        )}
        <div className="flow-root">
          <ul className="-mb-8">
            {activities.map((activity, activityIdx) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                isLast={activityIdx === activities.length - 1}
              />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
