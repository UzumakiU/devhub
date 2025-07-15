'use client'

import { useState, useEffect } from 'react'
import { TableData } from '@/types/database'

interface DatabaseTableBrowserProps {
  onTableSelect: (tableName: string) => void
  selectedTable: string | null
}

export default function DatabaseTableBrowser({ onTableSelect, selectedTable }: DatabaseTableBrowserProps) {
  const [tables, setTables] = useState<TableData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTables()
  }, [])

  const fetchTables = async () => {
    try {
      setLoading(true)
      // TODO: Replace with actual API call
      const response = await fetch('/api/database/tables')
      const data = await response.json()
      setTables(data.tables || [])
    } catch (error) {
      console.error('Error fetching tables:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Database Tables</h3>
        <p className="text-sm text-gray-500">{tables.length} tables found</p>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {tables.map((table) => (
          <div
            key={table.table_name}
            className={`px-6 py-3 cursor-pointer border-b border-gray-100 hover:bg-gray-50 ${
              selectedTable === table.table_name ? 'bg-blue-50 border-blue-200' : ''
            }`}
            onClick={() => onTableSelect(table.table_name)}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-900">{table.table_name}</p>
                <p className="text-sm text-gray-500">{table.columns.length} columns</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{table.row_count.toLocaleString()}</p>
                <p className="text-sm text-gray-500">records</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {tables.length === 0 && (
        <div className="px-6 py-8 text-center">
          <p className="text-gray-500">No tables found</p>
        </div>
      )}
    </div>
  )
}
