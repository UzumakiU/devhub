export interface Lead {
  system_id: string
  name: string
  email: string
  phone?: string
  company?: string
  job_title?: string
  source: string
  lead_score: number
  qualification_status: string
  stage: string
  estimated_value?: string
  probability: number
  expected_close_date?: string
  assigned_to: {
    system_id: string
    name: string
  }
  converted_to_customer: boolean
  last_contacted?: string
  created_at: string
}

export interface LeadFormData {
  name: string
  email: string
  phone: string
  company: string
  job_title: string
  source: string
  estimated_value: string
  expected_close_date: string
}

export interface LeadManagementProps {
  onBack: () => void
}

export const LEAD_STAGES = [
  { value: '', label: 'All Stages' },
  { value: 'prospect', label: 'Prospect' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'closed_won', label: 'Closed Won' },
  { value: 'closed_lost', label: 'Closed Lost' }
]

export const LEAD_SOURCES = [
  'website', 'referral', 'cold_call', 'social_media', 'email', 'event', 'other'
]
