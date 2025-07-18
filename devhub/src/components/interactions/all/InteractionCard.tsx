import React from 'react';
import { CustomerInteraction } from './types';
import { InteractionUtils } from './InteractionUtils';
import { AllInteractionsService } from './AllInteractionsService';

interface InteractionCardProps {
  interaction: CustomerInteraction;
  onViewCustomer: (customerId: string) => void;
  showCustomerInfo?: boolean;
}

export const InteractionCard: React.FC<InteractionCardProps> = ({
  interaction,
  onViewCustomer,
  showCustomerInfo = true
}) => {
  const typeInfo = InteractionUtils.getInteractionTypeInfo(interaction.interaction_type);
  const priorityInfo = InteractionUtils.getPriorityInfo(interaction.priority);
  const statusClasses = InteractionUtils.getStatusClasses(interaction.status);
  const isOverdue = InteractionUtils.isOverdue(interaction.scheduled_at, interaction.status);
  const relativeTime = InteractionUtils.getRelativeTime(interaction.created_at);

  return (
    <div className={`bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow ${
      isOverdue ? 'border-l-4 border-red-500' : ''
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center space-x-3 mb-2">
            <span className="text-2xl">{typeInfo.icon}</span>
            <h3 className="text-lg font-semibold text-gray-900">
              {InteractionUtils.formatSubject(interaction.subject)}
            </h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityInfo.color}`}>
              {priorityInfo.label}
            </span>
            {isOverdue && (
              <span className="px-2 py-1 rounded-full text-xs font-medium text-red-700 bg-red-100">
                OVERDUE
              </span>
            )}
          </div>
          
          {/* Description */}
          <div className="mb-3">
            <p className="text-gray-600">
              {InteractionUtils.formatDescription(interaction.description)}
            </p>
          </div>

          {/* Metadata */}
          <div className="flex items-center flex-wrap gap-6 text-sm text-gray-500 mb-3">
            {showCustomerInfo && (
              <span>
                <strong>Customer:</strong> 
                <button 
                  onClick={() => onViewCustomer(interaction.customer.system_id)}
                  className="text-blue-600 hover:text-blue-800 ml-1 font-medium"
                  title={`Email: ${interaction.customer.email}`}
                >
                  {interaction.customer.name}
                </button>
              </span>
            )}
            <span>
              <strong>Type:</strong> {typeInfo.label}
            </span>
            <span>
              <strong>Status:</strong> 
              <span className={`ml-1 px-2 py-0.5 rounded text-xs ${statusClasses}`}>
                {interaction.status.replace('_', ' ')}
              </span>
            </span>
            {interaction.outcome && (
              <span>
                <strong>Outcome:</strong> {interaction.outcome}
              </span>
            )}
          </div>

          {/* Scheduling and billing info */}
          {(interaction.scheduled_at || interaction.is_billable) && (
            <div className="flex items-center gap-6 text-sm text-gray-500 mb-3">
              {interaction.scheduled_at && (
                <span>
                  <strong>Scheduled:</strong> {AllInteractionsService.formatDate(interaction.scheduled_at)}
                </span>
              )}
              {interaction.completed_at && (
                <span>
                  <strong>Completed:</strong> {AllInteractionsService.formatDate(interaction.completed_at)}
                </span>
              )}
              {interaction.is_billable && interaction.billable_hours && (
                <span className="text-green-600">
                  <strong>Billable:</strong> {interaction.billable_hours} hours
                </span>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span title={AllInteractionsService.formatDate(interaction.created_at)}>
              Created {relativeTime}
            </span>
            <span>
              <strong>By:</strong> {interaction.created_by.name}
            </span>
          </div>

          {/* Follow-up indicator */}
          {interaction.follow_up_date && (
            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
              <span className="text-blue-800">
                📅 <strong>Follow-up scheduled:</strong> {AllInteractionsService.formatDate(interaction.follow_up_date)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
