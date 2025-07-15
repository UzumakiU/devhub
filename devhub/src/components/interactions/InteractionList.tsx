'use client'

import type { CustomerInteraction } from '@/types/interactions'
import { interactionTypes, priorities } from '@/types/interactions'

interface InteractionListProps {
  interactions: CustomerInteraction[]
  loading: boolean
}

export default function InteractionList({ interactions, loading }: InteractionListProps) {
  const getInteractionIcon = (type: string) => {
    const typeObj = interactionTypes.find(t => t.value === type)
    return typeObj?.label.split(' ')[0] || '📝'
  }

  const getPriorityColor = (priority: string) => {
    const priorityObj = priorities.find(p => p.value === priority)
    return priorityObj?.color || 'bg-gray-100 text-gray-800'
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (interactions.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 mb-2">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-2.506-.357c-.47-.142-.923-.364-1.335-.676L3 21l1.032-5.159A8.955 8.955 0 013 13c0-4.418 3.582-8 8-8s8 3.582 8 7z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No interactions yet</h3>
        <p className="text-gray-500">Start by creating the first interaction with this customer.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {interactions.map((interaction) => (
        <div key={interaction.system_id} className="bg-white border rounded-lg p-6 hover:shadow-sm transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start space-x-3">
              <div className="text-2xl">
                {getInteractionIcon(interaction.interaction_type)}
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-medium text-gray-900">
                  {interaction.subject}
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  {interaction.description}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(interaction.priority)}`}>
                {interaction.priority}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {interaction.status.replace('_', ' ')}
              </span>
            </div>
          </div>

          {interaction.outcome && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <h5 className="text-sm font-medium text-gray-700 mb-1">Outcome:</h5>
              <p className="text-sm text-gray-600">{interaction.outcome}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Created:</span>
              <p className="text-gray-600">{formatDate(interaction.created_at)}</p>
            </div>
            
            {interaction.scheduled_at && (
              <div>
                <span className="font-medium text-gray-700">Scheduled:</span>
                <p className="text-gray-600">{formatDate(interaction.scheduled_at)}</p>
              </div>
            )}
            
            {interaction.completed_at && (
              <div>
                <span className="font-medium text-gray-700">Completed:</span>
                <p className="text-gray-600">{formatDate(interaction.completed_at)}</p>
              </div>
            )}
            
            {interaction.follow_up_date && (
              <div>
                <span className="font-medium text-gray-700">Follow-up:</span>
                <p className="text-gray-600">{formatDate(interaction.follow_up_date)}</p>
              </div>
            )}
          </div>

          {interaction.is_billable && (
            <div className="mt-3 flex items-center space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                💰 Billable
              </span>
              {interaction.billable_hours && (
                <span className="text-sm text-gray-600">
                  {interaction.billable_hours} hours
                </span>
              )}
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Created by {interaction.created_by.name} ({interaction.created_by.system_id})
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
