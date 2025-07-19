'use client'

import { useState, useEffect } from 'react'
import { TableData } from '@/types/database'
import TableDataModal from './TableDataModal'
import ToastContainer from '@/components/common/ToastContainer'
import { useToast } from '@/hooks/useToast'

interface DatabaseTableDetailsProps {
  tableName: string | null
}

interface ExpandedSections {
  columns: boolean
  data: boolean
  relationships: boolean
  constraints: boolean
}

export default function DatabaseTableDetails({ tableName }: DatabaseTableDetailsProps) {
  const [tableData, setTableData] = useState<TableData | null>(null)
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState<ExpandedSections>({
    columns: true,
    data: true,
    relationships: true,
    constraints: true
  })
  const [editingColumn, setEditingColumn] = useState<string | null>(null)
  const [isAddingColumn, setIsAddingColumn] = useState(false)
  const [newColumn, setNewColumn] = useState({
    column_name: '',
    data_type: 'VARCHAR(255)',
    is_nullable: 'YES',
    column_default: ''
  })
  
  const { toasts, success, error: showError, removeToast } = useToast()

  useEffect(() => {
    if (tableName) {
      fetchTableDetails(tableName)
    }
  }, [tableName])

  const fetchTableDetails = async (table: string) => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:8005/api/v1/database/table/${table}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Ensure the data has the expected structure
      const normalizedData: TableData = {
        table_name: data.table || data.table_name || table,
        columns: Array.isArray(data.columns) ? data.columns : [],
        total_rows: typeof data.total_rows === 'number' ? data.total_rows : 0,
        relationships: Array.isArray(data.relationships) ? data.relationships : [],
        data: Array.isArray(data.data) ? data.data : [],
        displayed_rows: typeof data.displayed_rows === 'number' ? data.displayed_rows : undefined,
        ...data
      }
      
      setTableData(normalizedData)
    } catch (error) {
      console.error('Error fetching table details:', error)
      setTableData(null)
    } finally {
      setLoading(false)
    }
  }

  const toggleSection = (section: keyof ExpandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handleAddColumn = async () => {
    if (!tableName || !newColumn.column_name.trim()) return

    try {
      const response = await fetch(`http://localhost:8005/api/v1/database/table/${tableName}/column`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newColumn)
      })

      if (response.ok) {
        await fetchTableDetails(tableName)
        setIsAddingColumn(false)
        setNewColumn({
          column_name: '',
          data_type: 'VARCHAR(255)',
          is_nullable: 'YES',
          column_default: ''
        })
        success(`Column "${newColumn.column_name}" added successfully!`)
      } else {
        showError('Failed to add column. Please try again.')
      }
    } catch (error) {
      console.error('Error adding column:', error)
      showError('Failed to add column. Please check your connection.')
    }
  }

  const handleDeleteColumn = async (columnName: string) => {
    if (!tableName || !confirm(`Are you sure you want to delete column "${columnName}"?`)) return

    try {
      const response = await fetch(`http://localhost:8005/api/v1/database/table/${tableName}/column/${columnName}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchTableDetails(tableName)
        success(`Column "${columnName}" deleted successfully!`)
      } else {
        showError('Failed to delete column. Please try again.')
      }
    } catch (error) {
      console.error('Error deleting column:', error)
      showError('Failed to delete column. Please check your connection.')
    }
  }

  const handleUpdateColumn = async (columnName: string, updates: any) => {
    if (!tableName) return

    try {
      const response = await fetch(`http://localhost:8005/api/v1/database/table/${tableName}/column/${columnName}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      if (response.ok) {
        await fetchTableDetails(tableName)
        setEditingColumn(null)
        success(`Column "${columnName}" updated successfully!`)
      } else {
        showError('Failed to update column. Please try again.')
      }
    } catch (error) {
      console.error('Error updating column:', error)
      showError('Failed to update column. Please check your connection.')
    }
  }

  if (!tableName) {
    return (
      <div className="bg-card rounded-lg shadow-lg border border-border p-6">
        <div className="text-center py-8">
          <div className="mx-auto h-12 w-12 text-muted-foreground">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 1.79 4 4 4h8c0-1.1.9-2 2-2V7c0-2.21-1.79-4-4-4H6c-1.1 0-2 .9-2 2z" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-foreground">No table selected</h3>
          <p className="mt-1 text-sm text-muted-foreground">Choose a table from the left panel to view its details</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-card rounded-lg shadow-lg border border-border p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-4 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!tableData) {
    return (
      <div className="bg-card rounded-lg shadow-lg border border-border p-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Failed to load table details</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-lg shadow-lg border border-border">
      <div className="px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-foreground">{tableData.table_name}</h3>
            <p className="text-sm text-muted-foreground">{tableData.total_rows?.toLocaleString() || 0} records</p>
          </div>
          
          <div className="flex space-x-2">
            {/* Edit Data Button */}
            {tableData.data && Array.isArray(tableData.data) && tableData.data.length > 0 && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Data
              </button>
            )}
            
            {/* Add Column Button */}
            <button
              onClick={() => setIsAddingColumn(true)}
              className="inline-flex items-center px-4 py-2 border border-border text-sm font-medium rounded-md text-secondary-foreground bg-secondary hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Column
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-6 space-y-6">
        {/* Columns Section */}
        <div className="border border-border rounded-lg">
          <button
            onClick={() => toggleSection('columns')}
            className="w-full px-4 py-3 bg-secondary/50 rounded-t-lg text-left flex items-center justify-between hover:bg-secondary/70 transition-colors"
          >
            <div className="flex items-center">
              <svg className="h-5 w-5 text-muted-foreground mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
              <h4 className="text-md font-medium text-foreground">
                Columns ({tableData.columns?.length || 0})
              </h4>
            </div>
            <svg 
              className={`h-5 w-5 text-muted-foreground transform transition-transform ${expandedSections.columns ? 'rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {expandedSections.columns && (
            <div className="p-4">
              {/* Add Column Form */}
              {isAddingColumn && (
                <div className="mb-4 p-4 bg-accent/50 rounded-lg border border-primary/20 shadow-lg">
                  <h5 className="font-medium text-accent-foreground mb-3">Add New Column</h5>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <input
                      type="text"
                      placeholder="Column name"
                      value={newColumn.column_name}
                      onChange={(e) => setNewColumn(prev => ({ ...prev, column_name: e.target.value }))}
                      className="px-3 py-2 bg-input border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    />
                    <select
                      value={newColumn.data_type}
                      onChange={(e) => setNewColumn(prev => ({ ...prev, data_type: e.target.value }))}
                      className="px-3 py-2 bg-input border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    >
                      <option value="VARCHAR(255)">VARCHAR(255)</option>
                      <option value="TEXT">TEXT</option>
                      <option value="INTEGER">INTEGER</option>
                      <option value="BIGINT">BIGINT</option>
                      <option value="DECIMAL">DECIMAL</option>
                      <option value="BOOLEAN">BOOLEAN</option>
                      <option value="DATE">DATE</option>
                      <option value="TIMESTAMP">TIMESTAMP</option>
                      <option value="JSON">JSON</option>
                    </select>
                    <select
                      value={newColumn.is_nullable}
                      onChange={(e) => setNewColumn(prev => ({ ...prev, is_nullable: e.target.value }))}
                      className="px-3 py-2 bg-input border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    >
                      <option value="YES">Nullable</option>
                      <option value="NO">Not Null</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Default value"
                      value={newColumn.column_default}
                      onChange={(e) => setNewColumn(prev => ({ ...prev, column_default: e.target.value }))}
                      className="px-3 py-2 bg-input border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    />
                  </div>
                  <div className="flex space-x-2 mt-3">
                    <button
                      onClick={handleAddColumn}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-sm transition-all shadow-md hover:shadow-lg"
                    >
                      Add Column
                    </button>
                    <button
                      onClick={() => setIsAddingColumn(false)}
                      className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-accent text-sm transition-all shadow-md hover:shadow-lg"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Nullable</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Default</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-card divide-y divide-border">
                    {tableData.columns && Array.isArray(tableData.columns) ? tableData.columns.map((column, index) => (
                      <tr key={index} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                          {column.column_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {column.data_type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            column.is_nullable === 'YES' 
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' 
                              : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                          }`}>
                            {column.is_nullable === 'YES' ? 'Nullable' : 'Not Null'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {column.column_default || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setEditingColumn(column.column_name)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteColumn(column.column_name)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                          No columns found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Data Overview Section */}
        <div className="border border-border rounded-lg">
          <button
            onClick={() => toggleSection('data')}
            className="w-full px-4 py-3 bg-background rounded-t-lg text-left flex items-center justify-between hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center">
              <svg className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h4 className="text-md font-medium text-foreground">
                Data Overview ({tableData.total_rows?.toLocaleString() || 0} records)
              </h4>
            </div>
            <svg 
              className={`h-5 w-5 text-gray-500 transform transition-transform ${expandedSections.data ? 'rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {expandedSections.data && (
            <div className="p-4">
              {tableData.data && Array.isArray(tableData.data) && tableData.data.length > 0 ? (
                <div className="space-y-4">
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-green-800">
                            This table contains {tableData.data.length} records
                          </p>
                          <p className="text-sm text-green-700">
                            Click "Edit Data" above to manage records
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex items-center px-3 py-1 border border-green-300 text-sm font-medium rounded-md text-green-800 bg-green-100 hover:bg-green-200 transition-colors"
                      >
                        Manage Data
                      </button>
                    </div>
                  </div>

                  {/* Quick data preview */}
                  {tableData.data.length > 0 && (
                    <div className="bg-background rounded-lg p-4">
                      <h5 className="text-sm font-medium text-foreground mb-2">Sample Data (first 3 rows)</h5>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-card">
                            <tr>
                              {tableData.columns?.slice(0, 4).map((column) => (
                                <th key={column.column_name} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                  {column.column_name}
                                </th>
                              ))}
                              {tableData.columns && tableData.columns.length > 4 && (
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">...</th>
                              )}
                            </tr>
                          </thead>
                          <tbody className="bg-card divide-y divide-gray-200">
                            {tableData.data.slice(0, 3).map((row, index) => (
                              <tr key={index}>
                                {tableData.columns?.slice(0, 4).map((column) => (
                                  <td key={column.column_name} className="px-3 py-2 text-sm text-foreground">
                                    <div className="max-w-20 truncate">
                                      {row[column.column_name] !== null ? String(row[column.column_name]) : 
                                        <span className="text-gray-400">NULL</span>}
                                    </div>
                                  </td>
                                ))}
                                {tableData.columns && tableData.columns.length > 4 && (
                                  <td className="px-3 py-2 text-sm text-gray-400">...</td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-background rounded-lg p-4 border border-border">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8l-4 4m0 0l-4-4m4 4V3" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-800">No records found</p>
                      <p className="text-sm text-gray-600">This table exists but contains no data</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Relationships Section */}
        {tableData.relationships && Array.isArray(tableData.relationships) && tableData.relationships.length > 0 && (
          <div className="border border-border rounded-lg">
            <button
              onClick={() => toggleSection('relationships')}
              className="w-full px-4 py-3 bg-background rounded-t-lg text-left flex items-center justify-between hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center">
                <svg className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.102m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <h4 className="text-md font-medium text-foreground">
                  Relationships ({tableData.relationships.length})
                </h4>
              </div>
              <svg 
                className={`h-5 w-5 text-gray-500 transform transition-transform ${expandedSections.relationships ? 'rotate-180' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {expandedSections.relationships && (
              <div className="p-4">
                <div className="space-y-3">
                  {tableData.relationships.map((rel, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                      <div className="flex items-center">
                        <svg className="h-5 w-5 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.102m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        <span className="text-sm text-gray-700">
                          References <span className="font-medium text-blue-600">{rel.foreign_table_name}.{rel.foreign_column_name}</span>
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-800 text-sm">
                          View
                        </button>
                        <button className="text-red-600 hover:text-red-800 text-sm">
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <button className="mt-3 inline-flex items-center px-3 py-1 border border-dashed border-border text-sm text-gray-600 rounded-md hover:border-gray-400 hover:text-gray-700 transition-colors">
                  <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Relationship
                </button>
              </div>
            )}
          </div>
        )}

        {/* Constraints Section */}
        <div className="border border-border rounded-lg">
          <button
            onClick={() => toggleSection('constraints')}
            className="w-full px-4 py-3 bg-background rounded-t-lg text-left flex items-center justify-between hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center">
              <svg className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <h4 className="text-md font-medium text-foreground">Constraints & Indexes</h4>
            </div>
            <svg 
              className={`h-5 w-5 text-gray-500 transform transition-transform ${expandedSections.constraints ? 'rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {expandedSections.constraints && (
            <div className="p-4">
              <div className="space-y-3">
                {/* Primary Key */}
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        PRIMARY KEY
                      </span>
                      <span className="ml-2 text-sm text-gray-700">
                        {tableData.columns?.find(col => col.column_name.includes('id'))?.column_name || 'Not detected'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Unique Constraints */}
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        UNIQUE
                      </span>
                      <span className="ml-2 text-sm text-gray-700">No unique constraints found</span>
                    </div>
                    <button className="text-green-600 hover:text-green-800 text-sm">
                      Add
                    </button>
                  </div>
                </div>

                {/* Indexes */}
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        INDEX
                      </span>
                      <span className="ml-2 text-sm text-gray-700">Auto-generated indexes</span>
                    </div>
                    <button className="text-purple-600 hover:text-purple-800 text-sm">
                      Manage
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Table Data Modal */}
      {tableData && (
        <TableDataModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          tableData={tableData}
        />
      )}

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </div>
  )
}
