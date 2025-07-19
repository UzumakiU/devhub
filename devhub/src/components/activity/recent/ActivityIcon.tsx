'use client'

import React from 'react';
import { ActivityIconProps } from './types';
import { RecentActivityUtils } from './RecentActivityUtils';

export const ActivityIcon: React.FC<ActivityIconProps> = ({ type }) => {
  const typeInfo = RecentActivityUtils.getActivityTypeInfo(type);

  if (!typeInfo.icon) {
    return (
      <div className="w-8 h-8 bg-background0 rounded-full flex items-center justify-center">
        <span className="text-white text-xs">?</span>
      </div>
    );
  }

  return (
    <div className={`w-8 h-8 ${typeInfo.color} rounded-full flex items-center justify-center`}>
      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d={typeInfo.icon} 
        />
      </svg>
    </div>
  );
};
