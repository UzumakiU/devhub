'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'

interface ActivityItem {
  id: string
  type: 'project' | 'customer' | 'invoice'
  title: string
  description: string
  timestamp: string
  status?: string
}

export default function RecentActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRecentActivity()
  }, [])

  const loadRecentActivity = async () => {
    try {
      setLoading(true)
      
      // Load recent data from all modules
      const [projectsRes, customersRes, invoicesRes] = await Promise.allSettled([
        api.getProjects(),
        api.getCustomers(),
        api.getTableData('invoices')
      ])

      const activities: ActivityItem[] = []

      // Process projects
      if (projectsRes.status === 'fulfilled' && projectsRes.value.success) {
        projectsRes.value.data.slice(0, 3).forEach((project: any) => {
          activities.push({
            id: `project-${project.system_id}`,
            type: 'project',
            title: project.name || 'Unnamed Project',
            description: `Project ${project.system_id} created`,
            timestamp: project.created_at,
            status: project.status
          })
        })
      }

      // Process customers
      if (customersRes.status === 'fulfilled' && customersRes.value.success) {
        customersRes.value.data.slice(0, 3).forEach((customer: any) => {
          activities.push({
            id: `customer-${customer.system_id}`,
            type: 'customer',
            title: customer.name || 'Unnamed Customer',
            description: `Customer ${customer.system_id} added`,
            timestamp: customer.created_at,
            status: customer.is_active ? 'active' : 'inactive'
          })
        })
      }

      // Process invoices
      if (invoicesRes.status === 'fulfilled' && invoicesRes.value.success) {
        invoicesRes.value.data.slice(0, 3).forEach((invoice: any) => {
          activities.push({
            id: `invoice-${invoice.system_id}`,
            type: 'invoice',
            title: `Invoice ${invoice.system_id}`,
            description: `${invoice.currency || 'USD'} ${parseFloat(invoice.amount || 0).toFixed(2)} invoice created`,
            timestamp: invoice.created_at,
            status: invoice.status
          })
        })
      }

      // Sort by timestamp (most recent first) and take top 6
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      setActivities(activities.slice(0, 6))

    } catch (error) {
      console.error('Failed to load recent activity:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'project':
        return (
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
        )
      case 'customer':
        return (
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        )
      case 'invoice':
        return (
          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        )
      default:
        return (
          <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">?</span>
          </div>
        )
    }
  }

  const getStatusBadge = (status?: string) => {
    if (!status) return null

    const statusClasses = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      draft: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800'
    }

    const className = statusClasses[status as keyof typeof statusClasses] || 'bg-gray-100 text-gray-800'

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${className}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Recent Activity
          </h3>
          <div className="animate-pulse space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          Recent Activity
        </h3>
        {activities.length === 0 ? (
          <div className="text-center py-6">
            <div className="text-gray-400 text-sm">
              No recent activity yet. Start by creating your first project, customer, or invoice!
            </div>
          </div>
        ) : (
          <div className="flow-root">
            <ul className="-mb-8">
              {activities.map((activity, activityIdx) => (
                <li key={activity.id}>
                  <div className="relative pb-8">
                    {activityIdx !== activities.length - 1 ? (
                      <span
                        className="absolute top-5 left-4 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      />
                    ) : null}
                    <div className="relative flex items-start space-x-3">
                      <div className="relative">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div>
                          <div className="text-sm">
                            <span className="font-medium text-gray-900">
                              {activity.title}
                            </span>
                          </div>
                          <div className="mt-1 text-sm text-gray-500">
                            {activity.description}
                          </div>
                          <div className="mt-2 flex items-center space-x-2">
                            <p className="text-xs text-gray-500">
                              {formatTimestamp(activity.timestamp)}
                            </p>
                            {getStatusBadge(activity.status)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
