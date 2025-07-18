import { INTERACTION_TYPES, PRIORITY_LEVELS, InteractionTypeInfo, PriorityInfo } from './types';

/**
 * Utility functions for interaction handling
 */
export class InteractionUtils {
  /**
   * Gets interaction type information by value
   */
  static getInteractionTypeInfo(type: string): InteractionTypeInfo {
    return INTERACTION_TYPES.find(t => t.value === type) || 
           { value: type, label: type, icon: '📄' };
  }

  /**
   * Gets priority information by value
   */
  static getPriorityInfo(priority: string): PriorityInfo {
    return PRIORITY_LEVELS.find(p => p.value === priority) || 
           { value: priority, label: priority, color: 'text-gray-600 bg-gray-100' };
  }

  /**
   * Gets CSS classes for status badges
   */
  static getStatusClasses(status: string): string {
    const statusClasses: Record<string, string> = {
      'pending': 'text-yellow-800 bg-yellow-100',
      'in_progress': 'text-blue-800 bg-blue-100',
      'completed': 'text-green-800 bg-green-100',
      'cancelled': 'text-red-800 bg-red-100',
      'scheduled': 'text-purple-800 bg-purple-100'
    };

    return statusClasses[status] || 'text-gray-800 bg-gray-100';
  }

  /**
   * Formats the interaction subject for display
   */
  static formatSubject(subject: string, maxLength: number = 60): string {
    if (subject.length <= maxLength) return subject;
    return subject.substring(0, maxLength) + '...';
  }

  /**
   * Formats description for preview
   */
  static formatDescription(description: string, maxLength: number = 120): string {
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + '...';
  }

  /**
   * Checks if an interaction is overdue (for scheduled items)
   */
  static isOverdue(scheduledAt: string | undefined, status: string): boolean {
    if (!scheduledAt || status === 'completed' || status === 'cancelled') {
      return false;
    }
    
    return new Date(scheduledAt) < new Date();
  }

  /**
   * Gets time-based display info (e.g., "2 hours ago")
   */
  static getRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  }

  /**
   * Validates interaction data
   */
  static validateInteraction(interaction: Record<string, unknown>): string[] {
    const errors: string[] = [];

    if (!interaction.subject) {
      errors.push('Subject is required');
    }

    if (!interaction.interaction_type) {
      errors.push('Interaction type is required');
    }

    const customer = interaction.customer as Record<string, unknown> | undefined;
    if (!customer?.system_id) {
      errors.push('Customer information is missing');
    }

    return errors;
  }
}
