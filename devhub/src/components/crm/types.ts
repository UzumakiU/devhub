export interface CRMAnalytics {
  customer_metrics: {
    total_customers: number
    new_customers_this_month: number
    active_customers: number
  }
  lead_metrics: {
    total_leads: number
    qualified_leads: number
    converted_leads: number
    conversion_rate: number
  }
  interaction_metrics: {
    total_interactions: number
    interactions_this_week: number
  }
  pipeline_stages: {
    [key: string]: number
  }
  lead_sources: {
    [key: string]: number
  }
}

export interface CRMDashboardProps {
  onViewCustomers: () => void
  onViewLeads: () => void
  onViewInteractions: () => void
}

export interface MetricCardProps {
  title: string
  value: number | string
  subtitle?: string
  icon: React.ReactNode
  onClick?: () => void
  color?: 'blue' | 'green' | 'purple' | 'gray'
}

export interface PipelineStageProps {
  stage: string
  count: number
}

export interface LeadSourceProps {
  source: string
  count: number
}

export interface QuickActionsProps {
  onViewLeads: () => void
  onViewCustomers: () => void
  onViewInteractions: () => void
  onRefresh: () => void
}
