// Types and constants for Recent Activity module

export interface ActivityItem {
  id: string;
  type: 'project' | 'customer' | 'invoice';
  title: string;
  description: string;
  timestamp: string;
  status?: string;
}

export interface RecentActivityProps {
  maxItems?: number;
  showHeader?: boolean;
  className?: string;
}

export interface ActivityIconProps {
  type: string;
}

export interface ActivityCardProps {
  activity: ActivityItem;
  isLast: boolean;
}

export interface ActivityStatusBadgeProps {
  status?: string;
}

export interface ActivityTypeInfo {
  type: string;
  icon: string;
  color: string;
  label: string;
}

export interface StatusInfo {
  status: string;
  label: string;
  colorClass: string;
}

export const ACTIVITY_TYPES: ActivityTypeInfo[] = [
  { type: 'project', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', color: 'bg-blue-500', label: 'Project' },
  { type: 'customer', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', color: 'bg-green-500', label: 'Customer' },
  { type: 'invoice', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', color: 'bg-purple-500', label: 'Invoice' }
];

export const STATUS_INFO: StatusInfo[] = [
  { status: 'active', label: 'Active', colorClass: 'bg-green-100 text-green-800' },
  { status: 'inactive', label: 'Inactive', colorClass: 'bg-gray-100 text-gray-800' },
  { status: 'draft', label: 'Draft', colorClass: 'bg-gray-100 text-gray-800' },
  { status: 'pending', label: 'Pending', colorClass: 'bg-yellow-100 text-yellow-800' },
  { status: 'paid', label: 'Paid', colorClass: 'bg-green-100 text-green-800' },
  { status: 'overdue', label: 'Overdue', colorClass: 'bg-red-100 text-red-800' }
];
