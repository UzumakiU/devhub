import { ACTIVITY_TYPES, STATUS_INFO, ActivityTypeInfo, StatusInfo, ActivityItem } from './types';

export class RecentActivityUtils {
  static getActivityTypeInfo(type: string): ActivityTypeInfo {
    const typeInfo = ACTIVITY_TYPES.find(t => t.type === type);
    return typeInfo || { type, icon: '', color: 'bg-gray-500', label: type };
  }

  static getStatusInfo(status: string): StatusInfo {
    const statusInfo = STATUS_INFO.find(s => s.status === status);
    return statusInfo || { status, label: status, colorClass: 'bg-gray-100 text-gray-800' };
  }

  static capitalizeStatus(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  static getActivityTitle(activity: ActivityItem): string {
    return activity.title || `${this.capitalizeStatus(activity.type)} Activity`;
  }

  static getActivityDescription(activity: ActivityItem): string {
    return activity.description || `${activity.type} activity`;
  }

  static getRelativeTime(timestamp: string): string {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - activityTime.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return activityTime.toLocaleDateString();
  }

  static filterActivitiesByType(activities: ActivityItem[], type: string): ActivityItem[] {
    return activities.filter(activity => activity.type === type);
  }

  static filterActivitiesByStatus(activities: ActivityItem[], status: string): ActivityItem[] {
    return activities.filter(activity => activity.status === status);
  }

  static getActivityStats(activities: ActivityItem[]) {
    const stats = {
      total: activities.length,
      projects: 0,
      customers: 0,
      invoices: 0,
      byStatus: {} as Record<string, number>
    };

    activities.forEach(activity => {
      // Count by type
      switch (activity.type) {
        case 'project':
          stats.projects++;
          break;
        case 'customer':
          stats.customers++;
          break;
        case 'invoice':
          stats.invoices++;
          break;
      }

      // Count by status
      if (activity.status) {
        stats.byStatus[activity.status] = (stats.byStatus[activity.status] || 0) + 1;
      }
    });

    return stats;
  }

  static sortActivitiesByTimestamp(activities: ActivityItem[], descending: boolean = true): ActivityItem[] {
    return [...activities].sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return descending ? timeB - timeA : timeA - timeB;
    });
  }

  static isRecentActivity(timestamp: string, hoursThreshold: number = 24): boolean {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInHours = (now.getTime() - activityTime.getTime()) / (1000 * 60 * 60);
    return diffInHours <= hoursThreshold;
  }
}
