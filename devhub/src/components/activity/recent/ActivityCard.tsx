'use client'

import React from 'react';
import { ActivityCardProps } from './types';
import { ActivityIcon } from './ActivityIcon';
import { ActivityStatusBadge } from './ActivityStatusBadge';
import { RecentActivityService } from './RecentActivityService';
import { RecentActivityUtils } from './RecentActivityUtils';

export const ActivityCard: React.FC<ActivityCardProps> = ({ activity, isLast }) => {
  return (
    <li>
      <div className="relative pb-8">
        {!isLast && (
          <span
            className="absolute top-5 left-4 -ml-px h-full w-0.5 bg-gray-200"
            aria-hidden="true"
          />
        )}
        <div className="relative flex items-start space-x-3">
          <div className="relative">
            <ActivityIcon type={activity.type} />
          </div>
          <div className="min-w-0 flex-1">
            <div>
              <div className="text-sm">
                <span className="font-medium text-foreground">
                  {RecentActivityUtils.getActivityTitle(activity)}
                </span>
              </div>
              <div className="mt-1 text-sm text-gray-500">
                {RecentActivityUtils.getActivityDescription(activity)}
              </div>
              <div className="mt-2 flex items-center space-x-2">
                <p className="text-xs text-gray-500">
                  {RecentActivityService.formatTimestamp(activity.timestamp)}
                </p>
                <ActivityStatusBadge status={activity.status} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
};
