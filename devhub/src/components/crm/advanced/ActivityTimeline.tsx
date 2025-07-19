'use client'

import React, { useState } from 'react'
import { Lead } from '../../leads/types'

interface ActivityTimelineProps {
  leadId: string
}

interface Activity {
  id: string
  type: 'email' | 'call' | 'meeting' | 'note' | 'status_change' | 'score_update'
  title: string
  description: string
  timestamp: string
  user: string
  metadata?: {
    old_value?: string
    new_value?: string
    duration?: number
    outcome?: string
  }
}

export default function ActivityTimeline({ leadId }: ActivityTimelineProps) {
  const [activities] = useState<Activity[]>([
    {
      id: '1',
      type: 'email',
      title: 'Email Sent',
      description: 'Sent follow-up email with product demo link',
      timestamp: '2024-01-20T10:30:00Z',
      user: 'Jane Smith',
      metadata: { outcome: 'opened' }
    },
    {
      id: '2', 
      type: 'call',
      title: 'Phone Call',
      description: 'Discovery call to understand requirements',
      timestamp: '2024-01-19T14:15:00Z',
      user: 'Jane Smith',
      metadata: { duration: 45, outcome: 'positive' }
    },
    {
      id: '3',
      type: 'meeting',
      title: 'Demo Meeting',
      description: 'Product demonstration with technical team',
      timestamp: '2024-01-18T16:00:00Z',
      user: 'Mike Johnson',
      metadata: { duration: 60, outcome: 'very_positive' }
    },
    {
      id: '4',
      type: 'score_update',
      title: 'Score Updated',
      description: 'Lead score increased based on engagement',
      timestamp: '2024-01-18T17:30:00Z',
      user: 'System',
      metadata: { old_value: '75', new_value: '85' }
    },
    {
      id: '5',
      type: 'status_change',
      title: 'Stage Changed',
      description: 'Moved to Proposal stage',
      timestamp: '2024-01-17T11:20:00Z',
      user: 'Jane Smith',
      metadata: { old_value: 'qualified', new_value: 'proposal' }
    },
    {
      id: '6',
      type: 'note',
      title: 'Note Added',
      description: 'Strong interest in enterprise features. Budget confirmed at $50k+',
      timestamp: '2024-01-16T09:45:00Z',
      user: 'Jane Smith'
    }
  ])

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'email':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
          </svg>
        )
      case 'call':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
          </svg>
        )
      case 'meeting':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>
        )
      case 'note':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
            <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a2 2 0 002 2h4a2 2 0 002-2V3a2 2 0 012 2v6.293l-3.707 3.707A1 1 0 0011 16H6a2 2 0 01-2-2V5zm8 8v2h1.293L16 12.293V13z" clipRule="evenodd" />
          </svg>
        )
      case 'status_change':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
        )
      case 'score_update':
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        )
      default:
        return null
    }
  }

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'email':
        return 'bg-blue-100 text-blue-600'
      case 'call':
        return 'bg-green-100 text-green-600'
      case 'meeting':
        return 'bg-purple-100 text-purple-600'
      case 'note':
        return 'bg-yellow-100 text-yellow-600'
      case 'status_change':
        return 'bg-indigo-100 text-indigo-600'
      case 'score_update':
        return 'bg-orange-100 text-orange-600'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (diffInHours < 168) { // 7 days
      return `${Math.floor(diffInHours / 24)} days ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Activity Timeline</h3>
      
      <div className="flow-root">
        <ul className="-mb-8">
          {activities.map((activity, activityIdx) => (
            <li key={activity.id}>
              <div className="relative pb-8">
                {activityIdx !== activities.length - 1 ? (
                  <span
                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  />
                ) : null}
                
                <div className="relative flex space-x-3">
                  <div>
                    <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${getActivityColor(activity.type)}`}>
                      {getActivityIcon(activity.type)}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">
                        {activity.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatTimestamp(activity.timestamp)}
                      </p>
                    </div>
                    
                    <p className="text-sm text-gray-600 mt-1">
                      {activity.description}
                    </p>
                    
                    {activity.metadata && (
                      <div className="mt-2 text-xs text-gray-500">
                        {activity.metadata.duration && (
                          <span className="mr-4">Duration: {activity.metadata.duration}m</span>
                        )}
                        {activity.metadata.outcome && (
                          <span className="mr-4">Outcome: {activity.metadata.outcome}</span>
                        )}
                        {activity.metadata.old_value && activity.metadata.new_value && (
                          <span>{activity.metadata.old_value} → {activity.metadata.new_value}</span>
                        )}
                      </div>
                    )}
                    
                    <p className="text-xs text-gray-400 mt-1">
                      by {activity.user}
                    </p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Add Activity Button */}
      <div className="mt-4 pt-4 border-t border-border">
        <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
          + Add Activity
        </button>
      </div>
    </div>
  )
}
