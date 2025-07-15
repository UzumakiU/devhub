'use client'

import { useState, useEffect } from 'react'
import type { DatabaseStats as DatabaseStatsType, DatabaseValidation } from '@/types/database'

export default function DatabaseStats() {
  const [stats, setStats] = useState<DatabaseStatsType | null>(null)
  const [validation, setValidation] = useState<DatabaseValidation | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDatabaseStats()
  }, [])

  const fetchDatabaseStats = async () => {
    try {
      setLoading(true)
      // Fetch both stats and validation in parallel
      const [statsResponse, validationResponse] = await Promise.all([
        fetch('/api/database/stats'),
        fetch('/api/database/validate')
      ])
      
      const statsData = await statsResponse.json()
      const validationData = await validationResponse.json()
      
      setStats(statsData)
      setValidation(validationData)
    } catch (error) {
      console.error('Error fetching database stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 1.79 4 4 4h8c0-1.1.9-2 2-2V7c0-2.21-1.79-4-4-4H6c-1.1 0-2 .9-2 2z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Tables</p>
              <p className="text-2xl font-semibold text-gray-900">{stats?.total_tables || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Records</p>
              <p className="text-2xl font-semibold text-gray-900">{stats?.total_records?.toLocaleString() || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                validation?.severity === 'critical' ? 'bg-red-500' :
                validation?.severity === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
              }`}>
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Health Status</p>
              <p className="text-2xl font-semibold text-gray-900 capitalize">
                {validation?.status || 'Unknown'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Table Stats */}
      {stats?.table_stats && stats.table_stats.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Table Statistics</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.table_stats.map((table) => (
                <div key={table.table_name} className="bg-gray-50 rounded-lg p-4">
                  <p className="font-medium text-gray-900">{table.table_name}</p>
                  <p className="text-sm text-gray-500">{table.record_count.toLocaleString()} records</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Validation Issues */}
      {validation && validation.total_issues > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Database Issues</h3>
            <p className="text-sm text-gray-500">{validation.total_issues} issues found</p>
          </div>
          <div className="p-6 space-y-4">
            {validation.issues.errors.length > 0 && (
              <div className="border-l-4 border-red-400 bg-red-50 p-4">
                <h4 className="text-sm font-medium text-red-800">Errors</h4>
                <ul className="mt-2 list-disc list-inside text-sm text-red-700">
                  {validation.issues.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {validation.issues.warnings.length > 0 && (
              <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4">
                <h4 className="text-sm font-medium text-yellow-800">Warnings</h4>
                <ul className="mt-2 list-disc list-inside text-sm text-yellow-700">
                  {validation.issues.warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}

            {validation.issues.suggestions.length > 0 && (
              <div className="border-l-4 border-blue-400 bg-blue-50 p-4">
                <h4 className="text-sm font-medium text-blue-800">Suggestions</h4>
                <ul className="mt-2 list-disc list-inside text-sm text-blue-700">
                  {validation.issues.suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
