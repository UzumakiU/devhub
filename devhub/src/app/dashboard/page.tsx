'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import useAuth from '@/hooks/useAuth'
import Layout from '@/components/Layout'
import StatsCard from '@/components/StatsCard'
import QuickActions from '@/components/QuickActions'
import { RecentActivityRefactored } from '@/components/activity/recent'
import ProjectList from '@/components/ProjectList'
import { api } from '@/lib/api'
import { featureFlags } from '@/lib/config'

export default function DashboardPage() {
  const { user, isLoading, isAuthenticated, isFounder } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalCustomers: 0,
    totalUsers: 0,
    totalInvoices: 0
  })
  const [statsLoading, setStatsLoading] = useState(true)
  const [statsLoaded, setStatsLoaded] = useState(false)

  // Run auth check and load stats when auth state changes
  useEffect(() => {
    if (isLoading) return
    
    if (!isAuthenticated()) {
      router.push('/auth/login')
      return
    }
    
    // Load stats only once when user is authenticated and not already loaded
    if (user && !statsLoaded) {
      loadStatsOnce()
    }
  }, [isLoading, user, isAuthenticated, router, statsLoaded])

  const loadStatsOnce = async () => {
    try {
      setStatsLoading(true)
      const [projects, customers, users, invoices] = await Promise.all([
        api.getProjects(),
        api.getCustomers(), 
        api.getUsers(),
        api.getTableData('invoices')
      ])

      setStats({
        totalProjects: projects.data?.length || 0,
        totalCustomers: customers.data?.length || 0,
        totalUsers: users.data?.length || 0,
        totalInvoices: invoices.data?.length || 0
      })
      setStatsLoaded(true)
    } catch (error) {
      console.error('Failed to load stats:', error)
      setStats({
        totalProjects: 0,
        totalCustomers: 0,
        totalUsers: 1,
        totalInvoices: 0
      })
      setStatsLoaded(true)
    } finally {
      setStatsLoading(false)
    }
  }

  if (isLoading || statsLoading) {
    return (
      <Layout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Layout>
    )
  }

  if (!isAuthenticated()) {
    return null
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* CRM Focus Banner */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-400 p-4 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>Currently Focusing on CRM Development</strong> - Projects, Customers, and Invoices modules are temporarily disabled while we perfect the CRM system. 
                <a href="/crm" className="underline hover:text-blue-800 ml-1">Go to CRM →</a>
              </p>
            </div>
          </div>
        </div>

        {/* Welcome Section */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.full_name}! 👋
            </h2>
            <p className="text-gray-600">
              You&apos;re logged in as {user?.email} ({user?.display_id})
              {isFounder() && ' - Platform Founder'}
              <br />
              Tenant: {user?.tenant_name} • Role: {user?.user_role}
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title={featureFlags.projects ? "Total Projects" : "Projects (Disabled)"}
            value={featureFlags.projects ? stats.totalProjects : "—"}
            color={featureFlags.projects ? "blue" : "red"}
            icon={
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            }
          />
          <StatsCard
            title="Total Customers"
            value={stats.totalCustomers}
            color="green"
            icon={
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
          />
          <StatsCard
            title="Team Members"
            value={stats.totalUsers}
            color="purple"
            icon={
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            }
          />
          <StatsCard
            title={featureFlags.invoices ? "Total Invoices" : "Invoices (Disabled)"}
            value={featureFlags.invoices ? stats.totalInvoices : "—"}
            color={featureFlags.invoices ? "yellow" : "red"}
            icon={
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Projects */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Recent Projects
              </h3>
              <ProjectList limit={3} showCreateButton={false} />
            </div>
          </div>

          {/* Recent Activity */}
          <RecentActivityRefactored />
        </div>

        {/* Quick Actions */}
        <QuickActions />
      </div>
    </Layout>
  )
}
