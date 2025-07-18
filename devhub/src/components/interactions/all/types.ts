// Types and constants for All Interactions module

export interface CustomerInteraction {
  system_id: string;
  interaction_type: string;
  subject: string;
  description: string;
  outcome: string;
  priority: string;
  status: string;
  is_billable: boolean;
  billable_hours?: string;
  scheduled_at?: string;
  completed_at?: string;
  follow_up_date?: string;
  created_at: string;
  customer: {
    system_id: string;
    name: string;
    email: string;
  };
  created_by: {
    system_id: string;
    name: string;
  };
}

export interface InteractionTypeInfo {
  value: string;
  label: string;
  icon: string;
}

export interface PriorityInfo {
  value: string;
  label: string;
  color: string;
}

export interface AllInteractionsProps {
  onBack: () => void;
  onViewCustomer: (customerId: string) => void;
}

export const INTERACTION_TYPES: InteractionTypeInfo[] = [
  { value: 'call', label: 'Phone Call', icon: '📞' },
  { value: 'email', label: 'Email', icon: '✉️' },
  { value: 'meeting', label: 'Meeting', icon: '🤝' },
  { value: 'note', label: 'Note', icon: '📝' },
  { value: 'follow_up', label: 'Follow-up', icon: '⏰' }
];

export const PRIORITY_LEVELS: PriorityInfo[] = [
  { value: 'low', label: 'Low', color: 'text-green-600 bg-green-100' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-600 bg-yellow-100' },
  { value: 'high', label: 'High', color: 'text-orange-600 bg-orange-100' },
  { value: 'urgent', label: 'Urgent', color: 'text-red-600 bg-red-100' }
];
