'use client'

import { useState, useEffect } from 'react'
import { TableData } from '@/types/database'
import ToastContainer from '@/components/common/ToastContainer'
import { useToast } from '@/hooks/useToast'

interface TableGroup {
  name: string
  tables: TableData[]
  type: 'core' | 'junction' | 'metadata' | 'system'
  icon: string
  description: string
}

interface DatabaseTableBrowserProps {
  onTableSelect: (tableName: string) => void
  selectedTable: string | null
}

export default function DatabaseTableBrowser({ onTableSelect, selectedTable }: DatabaseTableBrowserProps) {
  const [tables, setTables] = useState<TableData[]>([])
  const [tableGroups, setTableGroups] = useState<TableGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'hierarchy' | 'flat'>('hierarchy')
  const [searchTerm, setSearchTerm] = useState('')
  const [showRelationships, setShowRelationships] = useState(false)
  const [selectedTableForRelationships, setSelectedTableForRelationships] = useState<string | null>(null)
  const [isCreatingTable, setIsCreatingTable] = useState(false)
  const [newTableName, setNewTableName] = useState('')
  const [showTableActions, setShowTableActions] = useState(false)
  
  const { toasts, success, error: showError, removeToast } = useToast()

  // Function to get relationships for a table
  const getTableRelationships = (tableName: string) => {
    const relationships: { table: string, type: 'references' | 'referenced_by' | 'junction', description: string }[] = []
    
    // Define known relationships based on common database patterns
    const relationshipMap: Record<string, any> = {
      users: {
        referenced_by: [
          { table: 'customers', description: 'Customers are managed by users' },
          { table: 'leads', description: 'Leads are assigned to users' },
          { table: 'projects', description: 'Projects are managed by users' },
          { table: 'customer_interactions', description: 'User interactions with customers' },
          { table: 'lead_interactions', description: 'User interactions with leads' }
        ]
      },
      customers: {
        references: [
          { table: 'users', description: 'Assigned to a user/manager' },
          { table: 'tenants', description: 'Belongs to a tenant organization' }
        ],
        referenced_by: [
          { table: 'projects', description: 'Customer projects' },
          { table: 'invoices', description: 'Customer invoices' },
          { table: 'customer_interactions', description: 'Customer communication history' }
        ]
      },
      leads: {
        references: [
          { table: 'users', description: 'Assigned to a user/salesperson' },
          { table: 'tenants', description: 'Belongs to a tenant organization' }
        ],
        referenced_by: [
          { table: 'lead_interactions', description: 'Lead communication and follow-ups' }
        ]
      },
      projects: {
        references: [
          { table: 'customers', description: 'Project belongs to a customer' },
          { table: 'users', description: 'Project managed by a user' },
          { table: 'tenants', description: 'Belongs to a tenant organization' }
        ],
        referenced_by: [
          { table: 'invoices', description: 'Project invoices and billing' },
          { table: 'project_assignments', description: 'Team member assignments' }
        ]
      },
      invoices: {
        references: [
          { table: 'customers', description: 'Invoice billed to customer' },
          { table: 'projects', description: 'Invoice for specific project' },
          { table: 'tenants', description: 'Belongs to a tenant organization' }
        ]
      },
      tenants: {
        referenced_by: [
          { table: 'users', description: 'Tenant users and staff' },
          { table: 'customers', description: 'Tenant customers' },
          { table: 'leads', description: 'Tenant leads' },
          { table: 'projects', description: 'Tenant projects' },
          { table: 'invoices', description: 'Tenant invoices' }
        ]
      },
      customer_interactions: {
        references: [
          { table: 'customers', description: 'Interaction with specific customer' },
          { table: 'users', description: 'User who had the interaction' }
        ]
      },
      lead_interactions: {
        references: [
          { table: 'leads', description: 'Interaction with specific lead' },
          { table: 'users', description: 'User who had the interaction' }
        ]
      },
      project_assignments: {
        references: [
          { table: 'projects', description: 'Assigned to specific project' },
          { table: 'users', description: 'User assigned to project' }
        ],
        junction: true,
        description: 'Many-to-many relationship between users and projects'
      }
    }

    const tableRels = relationshipMap[tableName]
    if (tableRels) {
      if (tableRels.references) {
        tableRels.references.forEach((rel: any) => {
          relationships.push({ ...rel, type: 'references' })
        })
      }
      if (tableRels.referenced_by) {
        tableRels.referenced_by.forEach((rel: any) => {
          relationships.push({ ...rel, type: 'referenced_by' })
        })
      }
      if (tableRels.junction) {
        relationships.push({ 
          table: 'Multiple Tables', 
          type: 'junction', 
          description: tableRels.description 
        })
      }
    }

    return relationships
  }

  const handleRelationshipClick = (tableName: string) => {
    setSelectedTableForRelationships(tableName)
    setShowRelationships(true)
  }

  useEffect(() => {
    fetchTables()
  }, [])

  // Filter tables based on search term
  const filteredTables = tables.filter(table => 
    table.table_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredTableGroups = tableGroups.map(group => ({
    ...group,
    tables: group.tables.filter(table => 
      table.table_name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(group => group.tables.length > 0)

  // Smart table categorization and hierarchical sorting
  const organizeTablesHierarchically = (tables: TableData[]): TableGroup[] => {
    const groups: TableGroup[] = []
    const processedTables = new Set<string>()

    // Define table categories based on naming patterns and characteristics
    const coreBusinessTables = tables.filter(table => 
      ['users', 'customers', 'leads', 'projects', 'invoices', 'tenants'].includes(table.table_name)
    )

    const junctionTables = tables.filter(table => 
      table.table_name.includes('_') && 
      (table.table_name.includes('assignment') || table.table_name.includes('customer') || table.table_name.includes('project'))
    )

    const interactionTables = tables.filter(table => 
      table.table_name.includes('interaction') || table.table_name.includes('notes')
    )

    const systemTables = tables.filter(table => 
      table.table_name.includes('alembic') || table.table_name.includes('vault') || table.table_name.includes('password')
    )

    // Core Business Entities
    if (coreBusinessTables.length > 0) {
      groups.push({
        name: 'Core Business',
        tables: coreBusinessTables.sort((a, b) => {
          const order = ['tenants', 'users', 'customers', 'leads', 'projects', 'invoices']
          return order.indexOf(a.table_name) - order.indexOf(b.table_name)
        }),
        type: 'core',
        icon: '🏢',
        description: 'Primary business entities and data'
      })
      coreBusinessTables.forEach(t => processedTables.add(t.table_name))
    }

    // Interactions & Communications
    if (interactionTables.length > 0) {
      groups.push({
        name: 'Interactions & Notes',
        tables: interactionTables.sort((a, b) => a.table_name.localeCompare(b.table_name)),
        type: 'metadata',
        icon: '💬',
        description: 'Customer and lead interactions, notes'
      })
      interactionTables.forEach(t => processedTables.add(t.table_name))
    }

    // System & Infrastructure
    if (systemTables.length > 0) {
      groups.push({
        name: 'System & Security',
        tables: systemTables.sort((a, b) => a.table_name.localeCompare(b.table_name)),
        type: 'system',
        icon: '⚙️',
        description: 'System configuration and security'
      })
      systemTables.forEach(t => processedTables.add(t.table_name))
    }

    // Catch any remaining tables
    const remainingTables = tables.filter(table => !processedTables.has(table.table_name))
    if (remainingTables.length > 0) {
      groups.push({
        name: 'Other Tables',
        tables: remainingTables.sort((a, b) => a.table_name.localeCompare(b.table_name)),
        type: 'metadata',
        icon: '📋',
        description: 'Additional tables and data'
      })
    }

    return groups
  }

  const fetchTables = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:8005/api/v1/database/tables')
      const data = await response.json()
      
      // Normalize the data to ensure consistent structure
      const normalizedTables = (data.tables || []).map((table: unknown) => {
        const tableData = table as Record<string, unknown>
        return {
          table_name: tableData.table_name || '',
          columns: Array.isArray(tableData.columns) ? tableData.columns : [],
          total_rows: typeof tableData.total_rows === 'number' ? tableData.total_rows : 
                     (typeof tableData.row_count === 'number' ? tableData.row_count : 0),
          relationships: Array.isArray(tableData.relationships) ? tableData.relationships : [],
          ...tableData
        }
      })
      
      setTables(normalizedTables)
      // Organize tables hierarchically
      setTableGroups(organizeTablesHierarchically(normalizedTables))
    } catch (error) {
      console.error('Error fetching tables:', error)
      setTables([])
      setTableGroups([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTable = async () => {
    if (!newTableName) return
    
    try {
      setLoading(true)
      const response = await fetch('http://localhost:8005/api/v1/database/tables', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ table_name: newTableName })
      })
      
      if (response.ok) {
        const newTable = await response.json()
        setTables([...tables, newTable])
        setTableGroups(organizeTablesHierarchically([...tables, newTable]))
        setNewTableName('')
        setIsCreatingTable(false)
        success(`Table "${newTableName}" created successfully!`)
      } else {
        console.error('Error creating table:', response.statusText)
        showError('Failed to create table. Please try again.')
      }
    } catch (error) {
      console.error('Error creating table:', error)
      showError('Failed to create table. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTable = async (tableName: string) => {
    if (!confirm(`Are you sure you want to delete the table "${tableName}"?`)) return
    
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:8005/api/v1/database/tables/${tableName}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setTables(tables.filter(table => table.table_name !== tableName))
        setTableGroups(organizeTablesHierarchically(tables.filter(table => table.table_name !== tableName)))
        success(`Table "${tableName}" deleted successfully!`)
      } else {
        console.error('Error deleting table:', response.statusText)
        showError('Failed to delete table. Please try again.')
      }
    } catch (error) {
      console.error('Error deleting table:', error)
      showError('Failed to delete table. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-card rounded-lg shadow p-6">
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
    <div className="bg-card rounded-lg shadow">
      <div className="px-6 py-4 border-b border-border space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-foreground">Database Tables</h3>
            <p className="text-sm text-gray-500">{tables.length} tables found</p>
          </div>
          <div className="flex items-center space-x-2">
            {/* Create Table Button */}
            <button
              onClick={() => setIsCreatingTable(true)}
              className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
            >
              <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New Table
            </button>
            
            <button
              onClick={() => setViewMode('hierarchy')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'hierarchy'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              📊 Grouped
            </button>
            <button
              onClick={() => setViewMode('flat')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'flat'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              📋 List
            </button>
          </div>
        </div>
        
        {/* Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-border rounded-md leading-5 bg-card placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
            placeholder="Search tables..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Create Table Form */}
        {isCreatingTable && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="text-sm font-medium text-green-900 mb-3">Create New Table</h4>
            <div className="flex items-center space-x-3">
              <input
                type="text"
                placeholder="Table name"
                value={newTableName}
                onChange={(e) => setNewTableName(e.target.value)}
                className="flex-1 px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              />
              <button
                onClick={handleCreateTable}
                disabled={!newTableName.trim()}
                className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setIsCreatingTable(false)
                  setNewTableName('')
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {viewMode === 'hierarchy' ? (
          // Hierarchical view
          <div className="space-y-1">
            {filteredTableGroups.map((group, groupIndex) => (
              <div key={group.name} className="border-b border-gray-100 last:border-b-0">
                {/* Group Header */}
                <div className="px-6 py-2 bg-background border-b border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{group.icon}</span>
                      <div>
                        <h4 className="text-sm font-semibold text-foreground">{group.name}</h4>
                        <p className="text-xs text-gray-500">{group.description}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">{group.tables.length} tables</span>
                  </div>
                </div>
                
                {/* Group Tables */}
                <div className="divide-y divide-gray-100">
                  {group.tables.map((table) => (
                    <div
                      key={table.table_name}
                      className={`px-6 py-3 cursor-pointer hover:bg-background transition-colors ${
                        selectedTable === table.table_name ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                      onClick={() => onTableSelect(table.table_name)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <div className={`w-1 h-6 rounded-full ${
                            group.type === 'core' ? 'bg-gradient-to-b from-blue-400 to-blue-600' :
                            group.type === 'junction' ? 'bg-gradient-to-b from-purple-400 to-purple-600' :
                            group.type === 'metadata' ? 'bg-gradient-to-b from-green-400 to-green-600' :
                            'bg-gradient-to-b from-gray-400 to-gray-600'
                          }`}></div>
                          <div>
                            <p className="font-medium text-foreground">{table.table_name}</p>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <span>{table.columns?.length || 0} columns</span>
                              {table.relationships && table.relationships.length > 0 && (
                                <>
                                  <span>•</span>
                                  <button 
                                    className="text-blue-600 font-medium hover:text-blue-800 hover:underline transition-colors"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleRelationshipClick(table.table_name)
                                    }}
                                  >
                                    {table.relationships.length} relationships
                                  </button>
                                </>
                              )}
                              {(table.total_rows || 0) > 0 && (
                                <>
                                  <span>•</span>
                                  <span className="text-green-600 font-medium">has data</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="text-right">
                            <div className="flex flex-col items-end">
                              <p className="text-sm font-medium text-foreground">
                                {(table.total_rows || 0).toLocaleString()}
                              </p>
                              <p className="text-xs text-gray-500">
                                {(table.total_rows || 0) === 0 ? 'empty' : 'records'}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteTable(table.table_name)
                            }}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete table"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Flat list view with search
          <div>
            {(searchTerm ? tables.filter(table =>
              table.table_name.toLowerCase().includes(searchTerm.toLowerCase())
            ) : tables).map((table) => (
              <div
                key={table.table_name}
                className={`px-6 py-3 cursor-pointer border-b border-gray-100 hover:bg-background ${
                  selectedTable === table.table_name ? 'bg-blue-50 border-blue-200' : ''
                }`}
                onClick={() => onTableSelect(table.table_name)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-foreground">{table.table_name}</p>
                    <div className="text-sm text-gray-500 space-x-2">
                      <span>{table.columns?.length || 0} columns</span>
                      {table.relationships && table.relationships.length > 0 && (
                        <>
                          <span>•</span>
                          <button 
                            className="text-blue-600 font-medium hover:text-blue-800 hover:underline transition-colors"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRelationshipClick(table.table_name)
                            }}
                          >
                            {table.relationships.length} relationships
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">{(table.total_rows || 0).toLocaleString()}</p>
                      <p className="text-sm text-gray-500">records</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteTable(table.table_name)
                      }}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete table"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {tables.length === 0 && (
        <div className="px-6 py-8 text-center">
          <p className="text-gray-500">No tables found</p>
        </div>
      )}
      
      {/* Relationships Popup Modal */}
      {showRelationships && selectedTableForRelationships && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground">
                Table Relationships: {selectedTableForRelationships}
              </h3>
              <button
                onClick={() => setShowRelationships(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              {(() => {
                const relationships = getTableRelationships(selectedTableForRelationships)
                
                if (relationships.length === 0) {
                  return (
                    <p className="text-gray-500 text-center py-4">
                      No known relationships found for this table.
                    </p>
                  )
                }
                
                const groupedRels = relationships.reduce((acc, rel) => {
                  if (!acc[rel.type]) acc[rel.type] = []
                  acc[rel.type].push(rel)
                  return acc
                }, {} as Record<string, typeof relationships>)
                
                return (
                  <div className="space-y-4">
                    {groupedRels.references && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                          <span className="text-blue-500 mr-2">→</span>
                          References (Foreign Keys)
                        </h4>
                        <div className="space-y-2">
                          {groupedRels.references.map((rel, idx) => (
                            <div key={idx} className="bg-blue-50 p-3 rounded-md border-l-4 border-blue-400">
                              <p className="font-medium text-blue-900">{rel.table}</p>
                              <p className="text-sm text-blue-700">{rel.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {groupedRels.referenced_by && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                          <span className="text-green-500 mr-2">←</span>
                          Referenced By (Dependent Tables)
                        </h4>
                        <div className="space-y-2">
                          {groupedRels.referenced_by.map((rel, idx) => (
                            <div key={idx} className="bg-green-50 p-3 rounded-md border-l-4 border-green-400">
                              <p className="font-medium text-green-900">{rel.table}</p>
                              <p className="text-sm text-green-700">{rel.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {groupedRels.junction && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                          <span className="text-purple-500 mr-2">⇄</span>
                          Junction Table
                        </h4>
                        <div className="space-y-2">
                          {groupedRels.junction.map((rel, idx) => (
                            <div key={idx} className="bg-purple-50 p-3 rounded-md border-l-4 border-purple-400">
                              <p className="font-medium text-purple-900">{rel.table}</p>
                              <p className="text-sm text-purple-700">{rel.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })()}
            </div>
            
            <div className="p-4 border-t border-border bg-background">
              <p className="text-xs text-gray-500">
                These relationships are inferred from common database patterns and naming conventions.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </div>
  )
}
