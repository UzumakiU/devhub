'use client'

import { useState, useEffect, useCallback } from 'react'
import useAuth from '@/hooks/useAuth'
import { 
  MetricCard, 
  SalesPipeline, 
  LeadSources, 
  QuickActions,
  LoadingSkeleton,
  ErrorDisplay,
  CRMService,
  CRMAnalytics,
  CRMDashboardProps 
} from './crm'

export default function CRMDashboardRefactored({ onViewCustomers, onViewLeads, onViewInteractions }: CRMDashboardProps) {
  const { token } = useAuth()
  const [analytics, setAnalytics] = useState<CRMAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchAnalytics = useCallback(async () => {
    if (!token) return

    try {
      setLoading(true)
      setError('')
      const crmService = new CRMService(token)
      const data = await crmService.fetchAnalytics()
      setAnalytics(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  if (loading) {
    return <LoadingSkeleton rows={3} />
  }

  if (error) {
    return <ErrorDisplay message={error} onRetry={fetchAnalytics} />
  }

  if (!analytics) return null

  return (
    <div className="space-y-6">
      {/* CRM Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Total Customers"
          value={analytics.customer_metrics.total_customers}
          subtitle={`+${analytics.customer_metrics.new_customers_this_month} this month`}
          color="blue"
          onClick={onViewCustomers}
          icon={
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />

        <MetricCard
          title="Total Leads"
          value={analytics.lead_metrics.total_leads}
          subtitle={`${analytics.lead_metrics.conversion_rate}% conversion rate`}
          color="green"
          onClick={onViewLeads}
          icon={
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
        />

        <MetricCard
          title="Total Interactions"
          value={analytics.interaction_metrics.total_interactions}
          subtitle={`${analytics.interaction_metrics.interactions_this_week} this week`}
          color="purple"
          onClick={() => onViewInteractions()}
          icon={
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          }
        />
      </div>

      {/* Sales Pipeline */}
      <SalesPipeline stages={analytics.pipeline_stages} />

      {/* Lead Sources */}
      <LeadSources sources={analytics.lead_sources} />

      {/* Quick Actions */}
      <QuickActions
        onViewLeads={onViewLeads}
        onViewCustomers={onViewCustomers}
        onViewInteractions={() => onViewInteractions()}
        onRefresh={fetchAnalytics}
      />
    </div>
  )
}
