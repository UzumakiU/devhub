'use client'

import { useState, useEffect } from 'react'
import { TableData } from '@/types/database'

interface DatabaseTableDetailsProps {
  tableName: string | null
}

export default function DatabaseTableDetails({ tableName }: DatabaseTableDetailsProps) {
  const [tableData, setTableData] = useState<TableData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (tableName) {
      fetchTableDetails(tableName)
    }
  }, [tableName])

  const fetchTableDetails = async (table: string) => {
    try {
      setLoading(true)
      // TODO: Replace with actual API call
      const response = await fetch(`/api/database/table/${table}`)
      const data = await response.json()
      setTableData(data)
    } catch (error) {
      console.error('Error fetching table details:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!tableName) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 1.79 4 4 4h8c0-1.1.9-2 2-2V7c0-2.21-1.79-4-4-4H6c-1.1 0-2 .9-2 2z" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No table selected</h3>
          <p className="mt-1 text-sm text-gray-500">Choose a table from the left panel to view its details</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!tableData) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8">
          <p className="text-gray-500">Failed to load table details</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">{tableData.table_name}</h3>
        <p className="text-sm text-gray-500">{tableData.row_count.toLocaleString()} records</p>
      </div>
      
      <div className="p-6">
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-900 mb-3">Columns</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nullable</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Default</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tableData.columns.map((column, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {column.column_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {column.data_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        column.is_nullable === 'YES' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {column.is_nullable === 'YES' ? 'Nullable' : 'Not Null'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {column.column_default || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {tableData.relationships.length > 0 && (
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">Relationships</h4>
            <div className="space-y-2">
              {tableData.relationships.map((rel, index) => (
                <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <svg className="h-5 w-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.102m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <span className="text-sm text-gray-700">
                    References <span className="font-medium">{rel.foreign_table_name}.{rel.foreign_column_name}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
