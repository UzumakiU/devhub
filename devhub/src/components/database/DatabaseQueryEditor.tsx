'use client'

import { useState } from 'react'

interface DatabaseQueryEditorProps {
  onQueryExecute: (query: string) => void
}

export default function DatabaseQueryEditor({ onQueryExecute }: DatabaseQueryEditorProps) {
  const [query, setQuery] = useState('')
  const [isExecuting, setIsExecuting] = useState(false)

  const handleExecuteQuery = async () => {
    if (!query.trim()) return
    
    setIsExecuting(true)
    try {
      await onQueryExecute(query)
    } catch (error) {
      console.error('Query execution error:', error)
    } finally {
      setIsExecuting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleExecuteQuery()
    }
  }

  const commonQueries = [
    'SELECT * FROM users LIMIT 10;',
    'SELECT COUNT(*) FROM customers;',
    'SHOW TABLES;',
    'SELECT table_name, table_rows FROM information_schema.tables WHERE table_schema = DATABASE();'
  ]

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">SQL Query Editor</h3>
          <div className="text-sm text-gray-500">
            Ctrl/Cmd + Enter to execute
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="mb-4">
          <label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-2">
            SQL Query
          </label>
          <textarea
            id="query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            placeholder="Enter your SQL query here..."
          />
        </div>

        <div className="flex justify-between items-center mb-4">
          <button
            onClick={handleExecuteQuery}
            disabled={!query.trim() || isExecuting}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isExecuting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Executing...
              </>
            ) : (
              <>
                <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6-8h1m4 0h1M8 21l4-7 4 7M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
                Execute Query
              </>
            )}
          </button>
          
          <button
            onClick={() => setQuery('')}
            className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Clear
          </button>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Common Queries</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {commonQueries.map((commonQuery, index) => (
              <button
                key={index}
                onClick={() => setQuery(commonQuery)}
                className="text-left p-3 bg-gray-50 rounded-lg text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              >
                {commonQuery}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
