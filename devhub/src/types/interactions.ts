export interface CustomerInteraction {
  system_id: string
  interaction_type: string
  subject: string
  description: string
  outcome: string
  priority: string
  status: string
  is_billable: boolean
  billable_hours?: string
  scheduled_at?: string
  completed_at?: string
  follow_up_date?: string
  created_at: string
  created_by: {
    system_id: string
    name: string
  }
}

export interface Customer {
  system_id: string
  name: string
  email: string
}

export interface InteractionFormData {
  interaction_type: string
  subject: string
  description: string
  outcome: string
  priority: string
  status: string
  is_billable: boolean
  billable_hours: string
  scheduled_at: string
  completed_at: string
  follow_up_date: string
}

export const interactionTypes = [
  { value: 'call', label: '📞 Phone Call' },
  { value: 'email', label: '📧 Email' },
  { value: 'meeting', label: '🤝 Meeting' },
  { value: 'support', label: '🎧 Support' },
  { value: 'follow_up', label: '📅 Follow-up' },
  { value: 'other', label: '📝 Other' }
]

export const priorities = [
  { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'High', color: 'bg-red-100 text-red-800' },
  { value: 'urgent', label: 'Urgent', color: 'bg-purple-100 text-purple-800' }
]

export const statuses = [
  'pending',
  'in_progress',
  'completed',
  'cancelled',
  'scheduled'
]
