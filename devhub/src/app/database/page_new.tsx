'use client'

import { useState } from 'react'
import Layout from '@/components/Layout'
import useAuth from '@/hooks/useAuth'
import DatabaseStats from '@/components/database/DatabaseStats'
import DatabaseTableBrowser from '@/components/database/DatabaseTableBrowser'
import DatabaseTableDetails from '@/components/database/DatabaseTableDetails'
import DatabaseQueryEditor from '@/components/database/DatabaseQueryEditor'
import type { QueryResult } from '@/types/database'

export default function DatabasePage() {
  const { user, logout } = useAuth()
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'tables' | 'query'>('overview')

  const handleTableSelect = (tableName: string) => {
    setSelectedTable(tableName)
    setActiveTab('tables')
  }

  const handleQueryExecute = async (query: string) => {
    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/database/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      })
      const result = await response.json()
      setQueryResult(result)
    } catch (error) {
      console.error('Query execution failed:', error)
    }
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'tables', name: 'Tables', icon: '🗃️' },
    { id: 'query', name: 'Query', icon: '💻' }
  ] as const

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Database Management</h1>
          <p className="mt-2 text-gray-600">Monitor, browse, and query your database</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && <DatabaseStats />}
          
          {activeTab === 'tables' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DatabaseTableBrowser 
                onTableSelect={handleTableSelect}
                selectedTable={selectedTable}
              />
              <DatabaseTableDetails tableName={selectedTable} />
            </div>
          )}
          
          {activeTab === 'query' && (
            <div className="space-y-6">
              <DatabaseQueryEditor onQueryExecute={handleQueryExecute} />
              
              {queryResult && (
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Query Results</h3>
                    <p className="text-sm text-gray-500">
                      {queryResult.row_count} rows returned in {queryResult.execution_time}ms
                    </p>
                  </div>
                  <div className="p-6">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            {queryResult.columns.map((column) => (
                              <th
                                key={column}
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                {column}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {queryResult.rows.slice(0, 100).map((row, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              {queryResult.columns.map((column) => (
                                <td
                                  key={column}
                                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                >
                                  {row[column] !== null ? String(row[column]) : <span className="text-gray-400">NULL</span>}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {queryResult.rows.length > 100 && (
                      <div className="mt-4 text-center">
                        <p className="text-sm text-gray-500">
                          Showing first 100 rows of {queryResult.row_count} total
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
