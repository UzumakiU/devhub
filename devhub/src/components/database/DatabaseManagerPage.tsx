'use client'

import { useState, useEffect } from 'react'
import { TableData } from '@/types/database'
import DatabaseRelationshipViewer from '@/components/database/DatabaseRelationshipViewer'
import EnhancedTableManager from '@/components/database/EnhancedTableManager'
import DatabaseSchemaVisualizationSimple from '@/components/database/DatabaseSchemaVisualizationSimple'
import Button from '@/components/ui/Button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import Badge from '@/components/ui/Badge'
import { Database, Table, Network, Code, Settings, Filter, Eye, Plus } from 'lucide-react'

interface DatabaseManagerPageProps {
  initialTables?: TableData[]
}

export default function DatabaseManagerPage({ initialTables = [] }: DatabaseManagerPageProps) {
  const [tables, setTables] = useState<TableData[]>(initialTables)
  const [selectedTable, setSelectedTable] = useState<TableData | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(false)
  const [endpoints, setEndpoints] = useState<any[]>([])

  // Fetch tables from API
  useEffect(() => {
    const fetchTables = async () => {
      setLoading(true)
      try {
        const response = await fetch('/api/v1/database/tables')
        if (response.ok) {
          const data = await response.json()
          setTables(data.tables || [])
        }
      } catch (error) {
        console.error('Error fetching tables:', error)
      } finally {
        setLoading(false)
      }
    }

    if (initialTables.length === 0) {
      fetchTables()
    }
  }, [initialTables])

  // Handle table data updates
  const handleUpdateTableData = async (tableData: Record<string, any>[]) => {
    if (!selectedTable) return
    
    try {
      const response = await fetch(`/api/v1/database/tables/${selectedTable.table_name}/data`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tableData)
      })
      
      if (response.ok) {
        setSelectedTable({ ...selectedTable, data: tableData })
      }
    } catch (error) {
      console.error('Error updating table data:', error)
    }
  }

  // Handle column updates
  const handleUpdateColumns = async (columns: any[]) => {
    if (!selectedTable) return
    
    try {
      const response = await fetch(`/api/v1/database/tables/${selectedTable.table_name}/columns`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(columns)
      })
      
      if (response.ok) {
        setSelectedTable({ ...selectedTable, columns })
      }
    } catch (error) {
      console.error('Error updating columns:', error)
    }
  }

  // Handle endpoint creation
  const handleCreateEndpoint = (endpoint: any) => {
    setEndpoints([...endpoints, { ...endpoint, id: Date.now() }])
  }

  // Calculate stats
  const totalTables = Array.isArray(tables) ? tables.length : 0
  const totalColumns = Array.isArray(tables) ? tables.reduce((sum, table) => sum + (table.columns?.length || 0), 0) : 0
  const totalRecords = Array.isArray(tables) ? tables.reduce((sum, table) => sum + (table.data?.length || 0), 0) : 0
  const totalEndpoints = endpoints.length

  return (
    <div className="min-h-screen w-full bg-background p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Database Manager</h1>
          <p className="text-gray-600">Manage your database schema, data, and relationships</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-card rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Tables</p>
                <p className="text-2xl font-bold text-foreground">{totalTables}</p>
              </div>
              <Database className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-card rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Columns</p>
                <p className="text-2xl font-bold text-foreground">{totalColumns}</p>
              </div>
              <Table className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-card rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Records</p>
                <p className="text-2xl font-bold text-foreground">{totalRecords}</p>
              </div>
              <Filter className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          
          <div className="bg-card rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">API Endpoints</p>
                <p className="text-2xl font-bold text-foreground">{totalEndpoints}</p>
              </div>
              <Code className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Table List Sidebar */}
          <div className="lg:col-span-1 bg-card rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Table className="w-5 h-5" />
                Tables
              </h2>
            </div>
            <div className="p-4">
              <div className="space-y-2">
                {Array.isArray(tables) ? tables.map((table) => (
                  <div
                    key={table.table_name}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedTable?.table_name === table.table_name
                        ? 'bg-blue-100 border-2 border-blue-500'
                        : 'bg-background hover:bg-gray-100'
                    }`}
                    onClick={() => setSelectedTable(table)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{table.table_name}</span>
                      <Badge className="text-xs">
                        {table.columns?.length || 0} cols
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {table.data?.length || 0} records
                    </div>
                  </div>
                )) : (
                  <div className="p-4 text-center text-gray-500">
                    No tables found
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 bg-card rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                {selectedTable ? (
                  <>
                    <Eye className="w-5 h-5" />
                    {selectedTable.table_name}
                  </>
                ) : (
                  <>
                    <Database className="w-5 h-5" />
                    Database Overview
                  </>
                )}
              </h2>
            </div>
            <div className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="schema">Schema</TabsTrigger>
                  <TabsTrigger value="data">Data</TabsTrigger>
                  <TabsTrigger value="relationships">Relationships</TabsTrigger>
                  <TabsTrigger value="endpoints">API</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-6">
                  {selectedTable ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <h3 className="font-semibold text-blue-900 mb-2">Table Information</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Table Name:</span>
                              <span className="font-medium">{selectedTable.table_name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Columns:</span>
                              <span className="font-medium">{selectedTable.columns?.length || 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Records:</span>
                              <span className="font-medium">{selectedTable.data?.length || 0}</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-green-50 rounded-lg">
                          <h3 className="font-semibold text-green-900 mb-2">Column Types</h3>
                          <div className="space-y-2 text-sm">
                            {selectedTable.columns?.map((col) => (
                              <div key={col.column_name} className="flex justify-between">
                                <span>{col.column_name}</span>
                                <Badge className="text-xs">
                                  {col.data_type}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Database className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        Select a table to view details
                      </h3>
                      <p className="text-gray-600">
                        Choose a table from the sidebar to manage its data and structure
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="schema" className="mt-6">
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-900 mb-2">Enhanced Database Schema</h3>
                      <p className="text-sm text-blue-700">
                        Hierarchical view of your database structure with improved organization and relationship visualization.
                      </p>
                    </div>
                    <DatabaseSchemaVisualizationSimple tables={tables} />
                  </div>
                </TabsContent>

                <TabsContent value="data" className="mt-6">
                  {selectedTable ? (
                    <EnhancedTableManager
                      tableData={selectedTable}
                      onUpdateData={handleUpdateTableData}
                      onUpdateColumns={handleUpdateColumns}
                      onCreateEndpoint={handleCreateEndpoint}
                    />
                  ) : (
                    <div className="text-center py-12">
                      <Filter className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        No table selected
                      </h3>
                      <p className="text-gray-600">
                        Select a table to manage its data
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="relationships" className="mt-6">
                  <DatabaseRelationshipViewer tables={tables} />
                </TabsContent>

                <TabsContent value="endpoints" className="mt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Generated API Endpoints</h3>
                      <Button className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Custom Endpoint
                      </Button>
                    </div>
                    
                    {endpoints.length > 0 ? (
                      <div className="space-y-3">
                        {endpoints.map((endpoint) => (
                          <div key={endpoint.id} className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Badge className={`text-xs ${
                                  endpoint.method === 'GET' ? 'bg-blue-100 text-blue-800' : 
                                  endpoint.method === 'POST' ? 'bg-green-100 text-green-800' :
                                  endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' : 
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {endpoint.method}
                                </Badge>
                                <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                                  {endpoint.path}
                                </code>
                              </div>
                              <Button variant="secondary">
                                Test
                              </Button>
                            </div>
                            <p className="text-sm text-gray-600">{endpoint.description}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Code className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          No endpoints generated yet
                        </h3>
                        <p className="text-gray-600">
                          Use the Data tab to generate API endpoints for your tables
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
