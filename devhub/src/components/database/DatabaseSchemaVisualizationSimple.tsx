'use client'

import React, { useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { ChevronDown, ChevronRight, Database, Key, Link, Table, Layers, GitBranch } from 'lucide-react'

// Create simple Card subcomponents
const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`px-6 py-4 ${className || ''}`}>
    {children}
  </div>
)

const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <h3 className={`text-lg font-semibold leading-none tracking-tight ${className || ''}`}>
    {children}
  </h3>
)

const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`px-6 pb-6 ${className || ''}`}>
    {children}
  </div>
)

interface DatabaseSchemaVisualizationProps {
  tables?: any[]
}

const DatabaseSchemaVisualizationSimple: React.FC<DatabaseSchemaVisualizationProps> = ({ tables = [] }) => {
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<'list' | 'category'>('list')

  // Organize tables by category based on name patterns
  const organizeTablesByCategory = (tables: any[]) => {
    const categories = {
      'Core': ['tenants', 'users'],
      'CRM': ['customers', 'leads', 'customer_interactions', 'customer_notes', 'lead_interactions'],
      'Projects': ['projects', 'project_assignments', 'project_customers'],
      'Financial': ['invoices'],
      'System': ['alembic_version', 'password_vault']
    }

    const categorized: { [key: string]: any[] } = {}
    const uncategorized: any[] = []

    tables.forEach(table => {
      let found = false
      for (const [category, tableNames] of Object.entries(categories)) {
        if (tableNames.includes(table.table_name)) {
          if (!categorized[category]) categorized[category] = []
          categorized[category].push(table)
          found = true
          break
        }
      }
      if (!found) uncategorized.push(table)
    })

    return { categorized, uncategorized }
  }

  const toggleTable = (tableName: string) => {
    const newExpanded = new Set(expandedTables)
    if (newExpanded.has(tableName)) {
      newExpanded.delete(tableName)
    } else {
      newExpanded.add(tableName)
    }
    setExpandedTables(newExpanded)
  }

  const expandAll = () => {
    setExpandedTables(new Set(tables.map(t => t.table_name)))
  }

  const collapseAll = () => {
    setExpandedTables(new Set())
  }

  const getTypeColor = (type: string) => {
    if (type.includes('VARCHAR') || type.includes('TEXT')) return 'text-green-600'
    if (type.includes('INTEGER') || type.includes('NUMERIC')) return 'text-blue-600'
    if (type.includes('BOOLEAN')) return 'text-purple-600'
    if (type.includes('DATE') || type.includes('TIMESTAMP')) return 'text-orange-600'
    return 'text-gray-600'
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Core': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'CRM': return 'bg-green-100 text-green-800 border-green-200'
      case 'Projects': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'Financial': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'System': return 'bg-gray-100 text-gray-800 border-border'
      default: return 'bg-gray-100 text-gray-800 border-border'
    }
  }

  const TableComponent: React.FC<{ table: any; category?: string }> = ({ table, category }) => (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => toggleTable(table.table_name)}
              className="p-1 h-auto"
            >
              {expandedTables.has(table.table_name) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </Button>
            <div className="flex items-center space-x-2">
              <Table size={20} className="text-gray-600" />
              <CardTitle className="text-lg">{table.table_name}</CardTitle>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {category && (
              <Badge variant="secondary" className={getCategoryColor(category)}>
                {category}
              </Badge>
            )}
            <Badge variant="secondary" className="text-xs">
              {table.columns?.length || 0} columns
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      {expandedTables.has(table.table_name) && (
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2 flex items-center">
              <Database size={16} className="mr-2" />
              Columns ({table.columns?.length || 0})
            </h4>
            <div className="space-y-1">
              {table.columns?.map((column: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-2 bg-background rounded">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm">{column.column_name}</span>
                    {column.column_name === 'id' && <Key size={14} className="text-yellow-600" />}
                    {column.column_name.includes('_id') && column.column_name !== 'id' && (
                      <Link size={14} className="text-blue-600" />
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`font-mono text-xs ${getTypeColor(column.data_type)}`}>
                      {column.data_type}
                    </span>
                    {column.is_nullable === 'NO' && (
                      <Badge variant="secondary" className="text-xs">NOT NULL</Badge>
                    )}
                  </div>
                </div>
              )) || <div className="text-sm text-gray-500">No column information available</div>}
            </div>
          </div>

          {table.relationships && table.relationships.length > 0 && (
            <div>
              <h4 className="font-medium mb-2 flex items-center">
                <GitBranch size={16} className="mr-2" />
                Relationships ({table.relationships.length})
              </h4>
              <div className="space-y-1">
                {table.relationships.map((rel: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-purple-50 rounded">
                    <span className="text-sm">{rel.description || 'Relationship'}</span>
                    <Badge variant="secondary" className="text-xs">
                      {rel.type || 'Unknown'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )

  const stats = {
    totalTables: tables.length,
    totalColumns: tables.reduce((sum, table) => sum + (table.columns?.length || 0), 0),
    totalRelationships: tables.reduce((sum, table) => sum + (table.relationships?.length || 0), 0)
  }

  const { categorized, uncategorized } = organizeTablesByCategory(tables)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Database Schema</h2>
          <p className="text-gray-600">Organized view of your database structure</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={expandAll} variant="secondary" size="sm">
            Expand All
          </Button>
          <Button onClick={collapseAll} variant="secondary" size="sm">
            Collapse All
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Table size={20} className="text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.totalTables}</p>
                <p className="text-sm text-gray-600">Tables</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Database size={20} className="text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats.totalColumns}</p>
                <p className="text-sm text-gray-600">Columns</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <GitBranch size={20} className="text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{stats.totalRelationships}</p>
                <p className="text-sm text-gray-600">Relationships</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Mode Tabs */}
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list" className="flex items-center space-x-2">
            <Layers size={16} />
            <span>All Tables</span>
          </TabsTrigger>
          <TabsTrigger value="category" className="flex items-center space-x-2">
            <Database size={16} />
            <span>By Category</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <div className="space-y-0">
            {tables.map((table) => (
              <TableComponent key={table.table_name} table={table} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="category" className="space-y-4">
          {Object.entries(categorized).map(([category, categoryTables]) => (
            <div key={category}>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Badge className={getCategoryColor(category)}>{category}</Badge>
                <span className="ml-2 text-sm text-gray-600">({categoryTables.length} tables)</span>
              </h3>
              <div className="space-y-0 ml-4">
                {categoryTables.map((table) => (
                  <TableComponent key={table.table_name} table={table} category={category} />
                ))}
              </div>
            </div>
          ))}
          
          {uncategorized.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Badge className="bg-gray-100 text-gray-800">Other</Badge>
                <span className="ml-2 text-sm text-gray-600">({uncategorized.length} tables)</span>
              </h3>
              <div className="space-y-0 ml-4">
                {uncategorized.map((table) => (
                  <TableComponent key={table.table_name} table={table} category="Other" />
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default DatabaseSchemaVisualizationSimple
