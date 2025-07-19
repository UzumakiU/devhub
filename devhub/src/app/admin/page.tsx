'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import useAuth from '@/hooks/useAuth'
import Layout from '@/components/Layout'
import Link from 'next/link'

export default function AdminPage() {
  const { user, isLoading, isAuthenticated, isFounder } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated()) {
        router.push('/auth/login')
        return
      }
      
      if (!isFounder()) {
        router.push('/dashboard')
        return
      }
    }
  }, [isLoading, isAuthenticated, isFounder, router])

  if (isLoading) {
    return (
      <Layout>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Layout>
    )
  }

  if (!isAuthenticated() || !isFounder()) {
    return null
  }

  const adminModules = [
    {
      title: 'User Management',
      description: 'Manage users, roles, and permissions',
      href: '/admin/users',
      icon: '👥',
      color: 'bg-blue-500'
    },
    {
      title: 'Password Vault',
      description: '🔐 SECURE: Access user password vault (requires 4-digit code)',
      href: '/admin/vault',
      icon: '🔐',
      color: 'bg-red-500'
    },
    {
      title: 'Database',
      description: 'Database management and administration',
      href: '/database',
      icon: '🗄️',
      color: 'bg-green-500'
    },
    {
      title: 'System Settings',
      description: 'Configure system-wide settings',
      href: '#',
      icon: '⚙️',
      color: 'bg-background0',
      disabled: true
    }
  ]

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Administrative tools and system management for founders
          </p>
        </div>

        {/* Admin Access Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-amber-800">
                Founder Access Required
              </h3>
              <div className="mt-2 text-sm text-amber-700">
                <p>
                  You have access to these administrative functions because you are logged in as a founder.
                  Please use these tools responsibly.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminModules.map((module) => (
            <div key={module.title} className="relative">
              {module.disabled ? (
                <div className="bg-card overflow-hidden shadow rounded-lg opacity-50 cursor-not-allowed">
                  <div className="p-6">
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 p-3 rounded-lg ${module.color}`}>
                        <span className="text-2xl">{module.icon}</span>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-foreground">{module.title}</h3>
                        <p className="text-sm text-gray-500">{module.description}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <span className="text-sm text-gray-400">Coming Soon</span>
                    </div>
                  </div>
                </div>
              ) : (
                <Link href={module.href} className="block">
                  <div className="bg-card overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow">
                    <div className="p-6">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 p-3 rounded-lg ${module.color}`}>
                          <span className="text-2xl">{module.icon}</span>
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-foreground">{module.title}</h3>
                          <p className="text-sm text-gray-500">{module.description}</p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <span className="text-blue-600 text-sm font-medium">
                          Access Module →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="bg-card shadow rounded-lg">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="text-lg font-medium text-foreground">System Overview</h3>
          </div>
          <div className="px-6 py-4">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Your Access Level</dt>
                <dd className="mt-1 text-sm text-foreground">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Founder
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">User ID</dt>
                <dd className="mt-1 text-sm text-foreground">{user?.display_id}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-foreground">{user?.email}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </Layout>
  )
}
