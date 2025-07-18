'use client'

import React from 'react';
import { ActivityStatusBadgeProps } from './types';
import { RecentActivityUtils } from './RecentActivityUtils';

export const ActivityStatusBadge: React.FC<ActivityStatusBadgeProps> = ({ status }) => {
  if (!status) return null;

  const statusInfo = RecentActivityUtils.getStatusInfo(status);

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusInfo.colorClass}`}>
      {RecentActivityUtils.capitalizeStatus(status)}
    </span>
  );
};
