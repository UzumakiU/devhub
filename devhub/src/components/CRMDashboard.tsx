'use client'

import { useState, useEffect } from 'react'
import useAuth from '@/hooks/useAuth'

interface CRMAnalytics {
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

interface CRMDashboardProps {
  onViewCustomers: () => void
  onViewLeads: () => void
  onViewInteractions: () => void
}

export default function CRMDashboard({ onViewCustomers, onViewLeads, onViewInteractions }: CRMDashboardProps) {
  const { token } = useAuth()
  const [analytics, setAnalytics] = useState<CRMAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (token) {
      fetchAnalytics()
    }
  }, [token])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:8005/api/crm/analytics/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch CRM analytics')
      }

      const data = await response.json()
      setAnalytics(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center text-red-600">
          <p>Error loading CRM analytics</p>
          <button 
            onClick={fetchAnalytics}
            className="mt-2 text-blue-600 hover:text-blue-800 underline"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  if (!analytics) return null

  return (
    <div className="space-y-6">
      {/* CRM Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Customer Metrics */}
        <div className="bg-white shadow rounded-lg p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={onViewCustomers}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Customers</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.customer_metrics.total_customers}</p>
              <p className="text-sm text-green-600">+{analytics.customer_metrics.new_customers_this_month} this month</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Lead Metrics */}
        <div className="bg-white shadow rounded-lg p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={onViewLeads}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Leads</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.lead_metrics.total_leads}</p>
              <p className="text-sm text-blue-600">{analytics.lead_metrics.conversion_rate}% conversion rate</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Interaction Metrics */}
        <div className="bg-white shadow rounded-lg p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onViewInteractions()}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Interactions</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.interaction_metrics.total_interactions}</p>
              <p className="text-sm text-purple-600">{analytics.interaction_metrics.interactions_this_week} this week</p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Pipeline */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Sales Pipeline</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {Object.entries(analytics.pipeline_stages).map(([stage, count]) => (
            <div key={stage} className="text-center">
              <div className="bg-gray-100 rounded-lg p-3 mb-2">
                <p className="text-2xl font-bold text-gray-900">{count}</p>
              </div>
              <p className="text-sm font-medium text-gray-600 capitalize">
                {stage.replace('_', ' ')}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Lead Sources */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Lead Sources</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(analytics.lead_sources).map(([source, count]) => (
            <div key={source} className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-xl font-bold text-gray-900">{count}</p>
              <p className="text-sm text-gray-600 capitalize">{source.replace('_', ' ')}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={onViewLeads}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            View All Leads
          </button>
          <button 
            onClick={onViewCustomers}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            View All Customers
          </button>
          <button 
            onClick={() => onViewInteractions()}
            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
          >
            View Interactions
          </button>
          <button 
            onClick={fetchAnalytics}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
          >
            Refresh Data
          </button>
        </div>
      </div>
    </div>
  )
}
