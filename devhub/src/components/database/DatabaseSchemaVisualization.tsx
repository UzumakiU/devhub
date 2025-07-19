'use client'

import React, { useState, useEffect } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { ChevronDown, ChevronRight, Database, Key, Link, Eye, Table, Layers, GitBranch } from 'lucide-react'

// Create simple Card subcomponents
const CardHeader: Rconst DatabaseSchemaVisualization: React.FC<DatabaseSchemaVisualizationProps> = ({ tables: propTables }) => {
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<'hierarchical' | 'category' | 'relationships'>('hierarchical')
  
  // Use real API data if provided, otherwise fall back to hardcoded schema
  const displayTables = propTables && propTables.length > 0 ? propTables : databaseSchemat.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
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

interface Column {
  name: string
  type: string
  isPrimaryKey: boolean
  isForeignKey: boolean
  isNullable: boolean
  references?: {
    table: string
    column: string
  }
}

interface Table {
  name: string
  columns: Column[]
  level: number
  category: string
  description?: string
  relationships: {
    outgoing: Array<{
      targetTable: string
      relationship: 'one-to-many' | 'many-to-one' | 'one-to-one'
      column: string
      targetColumn: string
    }>
    incoming: Array<{
      sourceTable: string
      relationship: 'one-to-many' | 'many-to-one' | 'one-to-one'
      column: string
      sourceColumn: string
    }>
  }
}

// Define the hierarchical structure based on your database schema
const databaseSchema: Table[] = [
  {
    name: 'tenants',
    level: 0,
    category: 'Core',
    description: 'Root level - Client businesses using DevHub',
    columns: [
      { name: 'id', type: 'INTEGER', isPrimaryKey: true, isForeignKey: false, isNullable: false },
      { name: 'system_id', type: 'VARCHAR', isPrimaryKey: false, isForeignKey: false, isNullable: false },
      { name: 'business_name', type: 'VARCHAR', isPrimaryKey: false, isForeignKey: false, isNullable: true },
      { name: 'business_email', type: 'VARCHAR', isPrimaryKey: false, isForeignKey: false, isNullable: true },
      { name: 'business_phone', type: 'VARCHAR', isPrimaryKey: false, isForeignKey: false, isNullable: true },
      { name: 'subscription_plan', type: 'VARCHAR', isPrimaryKey: false, isForeignKey: false, isNullable: true },
      { name: 'is_active', type: 'BOOLEAN', isPrimaryKey: false, isForeignKey: false, isNullable: true },
      { name: 'created_at', type: 'TIMESTAMP', isPrimaryKey: false, isForeignKey: false, isNullable: true },
      { name: 'updated_at', type: 'TIMESTAMP', isPrimaryKey: false, isForeignKey: false, isNullable: true },
    ],
    relationships: {
      outgoing: [
        { targetTable: 'users', relationship: 'one-to-many', column: 'system_id', targetColumn: 'tenant_id' },
        { targetTable: 'customers', relationship: 'one-to-many', column: 'system_id', targetColumn: 'tenant_id' },
        { targetTable: 'projects', relationship: 'one-to-many', column: 'system_id', targetColumn: 'tenant_id' },
        { targetTable: 'leads', relationship: 'one-to-many', column: 'system_id', targetColumn: 'tenant_id' },
      ],
      incoming: []
    }
  },
  {
    name: 'users',
    level: 1,
    category: 'Core',
    description: 'Platform users - employees and business owners',
    columns: [
      { name: 'id', type: 'INTEGER', isPrimaryKey: true, isForeignKey: false, isNullable: false },
      { name: 'system_id', type: 'VARCHAR', isPrimaryKey: false, isForeignKey: false, isNullable: false },
      { name: 'tenant_id', type: 'VARCHAR', isPrimaryKey: false, isForeignKey: true, isNullable: true, references: { table: 'tenants', column: 'system_id' } },
      { name: 'email', type: 'VARCHAR', isPrimaryKey: false, isForeignKey: false, isNullable: false },
      { name: 'full_name', type: 'VARCHAR', isPrimaryKey: false, isForeignKey: false, isNullable: true },
      { name: 'user_role', type: 'VARCHAR', isPrimaryKey: false, isForeignKey: false, isNullable: true },
      { name: 'is_active', type: 'BOOLEAN', isPrimaryKey: false, isForeignKey: false, isNullable: true },
      { name: 'is_founder', type: 'BOOLEAN', isPrimaryKey: false, isForeignKey: false, isNullable: true },
    ],
    relationships: {
      outgoing: [
        { targetTable: 'projects', relationship: 'one-to-many', column: 'system_id', targetColumn: 'owner_id' },
        { targetTable: 'customer_interactions', relationship: 'one-to-many', column: 'system_id', targetColumn: 'user_id' },
        { targetTable: 'lead_interactions', relationship: 'one-to-many', column: 'system_id', targetColumn: 'user_id' },
        { targetTable: 'customer_notes', relationship: 'one-to-many', column: 'system_id', targetColumn: 'user_id' },
        { targetTable: 'leads', relationship: 'one-to-many', column: 'system_id', targetColumn: 'assigned_to' },
      ],
      incoming: [
        { sourceTable: 'tenants', relationship: 'many-to-one', column: 'tenant_id', sourceColumn: 'system_id' },
      ]
    }
  },
  {
    name: 'customers',
    level: 1,
    category: 'CRM',
    description: 'External clients that businesses serve',
    columns: [
      { name: 'id', type: 'INTEGER', isPrimaryKey: true, isForeignKey: false, isNullable: false },
      { name: 'system_id', type: 'VARCHAR', isPrimaryKey: false, isForeignKey: false, isNullable: false },
      { name: 'tenant_id', type: 'VARCHAR', isPrimaryKey: false, isForeignKey: true, isNullable: false, references: { table: 'tenants', column: 'system_id' } },
      { name: 'company', type: 'VARCHAR', isPrimaryKey: false, isForeignKey: false, isNullable: true },
      { name: 'name', type: 'VARCHAR', isPrimaryKey: false, isForeignKey: false, isNullable: true },
      { name: 'email', type: 'VARCHAR', isPrimaryKey: false, isForeignKey: false, isNullable: true },
      { name: 'phone', type: 'VARCHAR', isPrimaryKey: false, isForeignKey: false, isNullable: true },
      { name: 'is_active', type: 'BOOLEAN', isPrimaryKey: false, isForeignKey: false, isNullable: true },
    ],
    relationships: {
      outgoing: [
        { targetTable: 'customer_interactions', relationship: 'one-to-many', column: 'system_id', targetColumn: 'customer_id' },
        { targetTable: 'customer_notes', relationship: 'one-to-many', column: 'system_id', targetColumn: 'customer_id' },
        { targetTable: 'invoices', relationship: 'one-to-many', column: 'system_id', targetColumn: 'customer_id' },
      ],
      incoming: [
        { sourceTable: 'tenants', relationship: 'many-to-one', column: 'tenant_id', sourceColumn: 'system_id' },
      ]
    }
  },
  {
    name: 'leads',
    level: 1,
    category: 'CRM',
    description: 'Potential customers in the sales pipeline',
    columns: [
      { name: 'id', type: 'INTEGER', isPrimaryKey: true, isForeignKey: false, isNullable: false },
      { name: 'system_id', type: 'VARCHAR', isPrimaryKey: false, isForeignKey: false, isNullable: false },
      { name: 'tenant_id', type: 'VARCHAR', isPrimaryKey: false, isForeignKey: true, isNullable: false, references: { table: 'tenants', column: 'system_id' } },
      { name: 'assigned_to', type: 'VARCHAR', isPrimaryKey: false, isForeignKey: true, isNullable: true, references: { table: 'users', column: 'system_id' } },
      { name: 'company', type: 'VARCHAR', isPrimaryKey: false, isForeignKey: false, isNullable: true },
      { name: 'name', type: 'VARCHAR', isPrimaryKey: false, isForeignKey: false, isNullable: true },
      { name: 'email', type: 'VARCHAR', isPrimaryKey: false, isForeignKey: false, isNullable: true },
      { name: 'stage', type: 'VARCHAR', isPrimaryKey: false, isForeignKey: false, isNullable: true },
      { name: 'estimated_value', type: 'INTEGER', isPrimaryKey: false, isForeignKey: false, isNullable: true },
      { name: 'is_active', type: 'BOOLEAN', isPrimaryKey: false, isForeignKey: false, isNullable: true },
    ],
    relationships: {
      outgoing: [
        { targetTable: 'lead_interactions', relationship: 'one-to-many', column: 'system_id', targetColumn: 'lead_id' },
      ],
      incoming: [
        { sourceTable: 'tenants', relationship: 'many-to-one', column: 'tenant_id', sourceColumn: 'system_id' },
        { sourceTable: 'users', relationship: 'many-to-one', column: 'assigned_to', sourceColumn: 'system_id' },
      ]
    }
  },
  {
    name: 'projects',
    level: 1,
    category: 'Projects',
    description: 'Project management and tracking',
    columns: [
      { name: 'id', type: 'INTEGER', isPrimaryKey: true, isForeignKey: false, isNullable: false },
      { name: 'system_id', type: 'VARCHAR', isPrimaryKey: false, isForeignKey: false, isNullable: false },
      { name: 'tenant_id', type: 'VARCHAR', isPrimaryKey: false, isForeignKey: true, isNullable: false, references: { table: 'tenants', column: 'system_id' } },
      { name: 'owner_id', type: 'VARCHAR', isPrimaryKey: false, isForeignKey: true, isNullable: true, references: { table: 'users', column: 'system_id' } },
      { name: 'name', type: 'VARCHAR', isPrimaryKey: false, isForeignKey: false, isNullable: false },
      { name: 'description', type: 'TEXT', isPrimaryKey: false, isForeignKey: false, isNullable: true },
      { name: 'status', type: 'VARCHAR', isPrimaryKey: false, isForeignKey: false, isNullable: false },
      { name: 'start_date', type: 'DATE', isPrimaryKey: false, isForeignKey: false, isNullable: true },
      { name: 'due_date', type: 'DATE', isPrimaryKey: false, isForeignKey: false, isNullable: true },
    ],
    relationships: {
      outgoing: [],
      incoming: [
        { sourceTable: 'tenants', relationship: 'many-to-one', column: 'tenant_id', sourceColumn: 'system_id' },
        { sourceTable: 'users', relationship: 'many-to-one', column: 'owner_id', sourceColumn: 'system_id' },
      ]
    }
  },
  {
    name: 'customer_interactions',
    level: 2,
    category: 'CRM',
    description: 'Track all customer communications',
    columns: [
      { name: 'id', type: 'INTEGER', isPrimaryKey: true, isForeignKey: false, isNullable: false },
      { name: 'system_id', type: 'VARCHAR', isPrimaryKey: false, isForeignKey: false, isNullable: false },
      { name: 'customer_id', type: 'VARCHAR', isPrimaryKey: false, isForeignKey: true, isNullable: false, references: { table: 'customers', column: 'system_id' } },
      { name: 'user_id', type: 'VARCHAR', isPrimaryKey: false, isForeignKey: true, isNullable: false, references: { table: 'users', column: 'system_id' } },
      { name: 'interaction_type', type: 'VARCHAR', isPrimaryKey: false, isForeignKey: false, isNullable: true },
      { name: 'subject', type: 'VARCHAR', isPrimaryKey: false, isForeignKey: false, isNullable: true },
      { name: 'description', type: 'TEXT', isPrimaryKey: false, isForeignKey: false, isNullable: true },
      { name: 'outcome', type: 'VARCHAR', isPrimaryKey: false, isForeignKey: false, isNullable: true },
    ],
    relationships: {
      outgoing: [],
      incoming: [
        { sourceTable: 'customers', relationship: 'many-to-one', column: 'customer_id', sourceColumn: 'system_id' },
        { sourceTable: 'users', relationship: 'many-to-one', column: 'user_id', sourceColumn: 'system_id' },
      ]
    }
  },
  {
    name: 'lead_interactions',
    level: 2,
    category: 'CRM',
    description: 'Track all lead communications',
    columns: [
      { name: 'id', type: 'INTEGER', isPrimaryKey: true, isForeignKey: false, isNullable: false },
      { name: 'system_id', type: 'VARCHAR', isPrimaryKey: false, isForeignKey: false, isNullable: false },
      { name: 'lead_id', type: 'VARCHAR', isPrimaryKey: false, isForeignKey: true, isNullable: false, references: { table: 'leads', column: 'system_id' } },
      { name: 'user_id', type: 'VARCHAR', isPrimaryKey: false, isForeignKey: true, isNullable: false, references: { table: 'users', column: 'system_id' } },
      { name: 'interaction_type', type: 'VARCHAR', isPrimaryKey: false, isForeignKey: false, isNullable: true },
      { name: 'subject', type: 'VARCHAR', isPrimaryKey: false, isForeignKey: false, isNullable: true },
      { name: 'description', type: 'TEXT', isPrimaryKey: false, isForeignKey: false, isNullable: true },
      { name: 'outcome', type: 'VARCHAR', isPrimaryKey: false, isForeignKey: false, isNullable: true },
    ],
    relationships: {
      outgoing: [],
      incoming: [
        { sourceTable: 'leads', relationship: 'many-to-one', column: 'lead_id', sourceColumn: 'system_id' },
        { sourceTable: 'users', relationship: 'many-to-one', column: 'user_id', sourceColumn: 'system_id' },
      ]
    }
  },
  {
    name: 'customer_notes',
    level: 2,
    category: 'CRM',
    description: 'Customer notes and comments',
    columns: [
      { name: 'id', type: 'INTEGER', isPrimaryKey: true, isForeignKey: false, isNullable: false },
      { name: 'system_id', type: 'VARCHAR', isPrimaryKey: false, isForeignKey: false, isNullable: false },
      { name: 'customer_id', type: 'VARCHAR', isPrimaryKey: false, isForeignKey: true, isNullable: false, references: { table: 'customers', column: 'system_id' } },
      { name: 'user_id', type: 'VARCHAR', isPrimaryKey: false, isForeignKey: true, isNullable: false, references: { table: 'users', column: 'system_id' } },
      { name: 'note_type', type: 'VARCHAR', isPrimaryKey: false, isForeignKey: false, isNullable: true },
      { name: 'title', type: 'VARCHAR', isPrimaryKey: false, isForeignKey: false, isNullable: true },
      { name: 'content', type: 'TEXT', isPrimaryKey: false, isForeignKey: false, isNullable: true },
      { name: 'is_private', type: 'BOOLEAN', isPrimaryKey: false, isForeignKey: false, isNullable: true },
    ],
    relationships: {
      outgoing: [],
      incoming: [
        { sourceTable: 'customers', relationship: 'many-to-one', column: 'customer_id', sourceColumn: 'system_id' },
        { sourceTable: 'users', relationship: 'many-to-one', column: 'user_id', sourceColumn: 'system_id' },
      ]
    }
  },
  {
    name: 'invoices',
    level: 2,
    category: 'Financial',
    description: 'Customer invoices and billing',
    columns: [
      { name: 'id', type: 'INTEGER', isPrimaryKey: true, isForeignKey: false, isNullable: false },
      { name: 'system_id', type: 'VARCHAR', isPrimaryKey: false, isForeignKey: false, isNullable: false },
      { name: 'customer_id', type: 'VARCHAR', isPrimaryKey: false, isForeignKey: true, isNullable: false, references: { table: 'customers', column: 'system_id' } },
      { name: 'status', type: 'VARCHAR', isPrimaryKey: false, isForeignKey: false, isNullable: false },
      { name: 'amount', type: 'VARCHAR', isPrimaryKey: false, isForeignKey: false, isNullable: false },
      { name: 'currency', type: 'VARCHAR', isPrimaryKey: false, isForeignKey: false, isNullable: false },
      { name: 'issue_date', type: 'TIMESTAMP', isPrimaryKey: false, isForeignKey: false, isNullable: false },
      { name: 'due_date', type: 'TIMESTAMP', isPrimaryKey: false, isForeignKey: false, isNullable: false },
      { name: 'paid_date', type: 'TIMESTAMP', isPrimaryKey: false, isForeignKey: false, isNullable: true },
    ],
    relationships: {
      outgoing: [],
      incoming: [
        { sourceTable: 'customers', relationship: 'many-to-one', column: 'customer_id', sourceColumn: 'system_id' },
      ]
    }
  },
  {
    name: 'alembic_version',
    level: 3,
    category: 'System',
    description: 'Database migration version tracking',
    columns: [
      { name: 'version_num', type: 'VARCHAR', isPrimaryKey: true, isForeignKey: false, isNullable: false },
    ],
    relationships: {
      outgoing: [],
      incoming: []
    }
  }
]

const TableComponent: React.FC<{ table: Table; expanded: boolean; onToggle: () => void }> = ({ 
  table, 
  expanded, 
  onToggle 
}) => {
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

  const getTypeColor = (type: string) => {
    if (type.includes('VARCHAR') || type.includes('TEXT')) return 'text-green-600'
    if (type.includes('INTEGER') || type.includes('NUMERIC')) return 'text-blue-600'
    if (type.includes('BOOLEAN')) return 'text-purple-600'
    if (type.includes('DATE') || type.includes('TIMESTAMP')) return 'text-orange-600'
    return 'text-gray-600'
  }

  return (
    <Card className={`mb-4 ${table.level === 0 ? 'border-2 border-blue-500' : table.level === 1 ? 'border-l-4 border-blue-300 ml-4' : 'border-l-2 border-border ml-8'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={onToggle}
              className="p-1 h-auto"
            >
              {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </Button>
            <div className="flex items-center space-x-2">
              <Table size={20} className="text-gray-600" />
              <CardTitle className="text-lg">{table.name}</CardTitle>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className={getCategoryColor(table.category)}>
              {table.category}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              Level {table.level}
            </Badge>
          </div>
        </div>
        {table.description && (
          <p className="text-sm text-gray-600 mt-2">{table.description}</p>
        )}
      </CardHeader>
      
      {expanded && (
        <CardContent className="space-y-4">
          {/* Columns */}
          <div>
            <h4 className="font-medium mb-2 flex items-center">
              <Database size={16} className="mr-2" />
              Columns ({table.columns.length})
            </h4>
            <div className="space-y-1">
              {table.columns.map((column, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-background rounded">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm">{column.name}</span>
                    {column.isPrimaryKey && <Key size={14} className="text-yellow-600" />}
                    {column.isForeignKey && <Link size={14} className="text-blue-600" />}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`font-mono text-xs ${getTypeColor(column.type)}`}>
                      {column.type}
                    </span>
                    {!column.isNullable && (
                      <Badge variant="secondary" className="text-xs">NOT NULL</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Relationships */}
          {(table.relationships.outgoing.length > 0 || table.relationships.incoming.length > 0) && (
            <div>
              <h4 className="font-medium mb-2 flex items-center">
                <GitBranch size={16} className="mr-2" />
                Relationships
              </h4>
              
              {table.relationships.outgoing.length > 0 && (
                <div className="mb-3">
                  <h5 className="text-sm font-medium text-green-700 mb-1">Outgoing (One-to-Many)</h5>
                  <div className="space-y-1">
                    {table.relationships.outgoing.map((rel, index) => (
                      <div key={index} className="flex items-center p-2 bg-green-50 rounded text-sm">
                        <span className="font-mono">{rel.column}</span>
                        <span className="mx-2">→</span>
                        <span className="font-mono text-green-700">{rel.targetTable}.{rel.targetColumn}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {table.relationships.incoming.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-blue-700 mb-1">Incoming (Many-to-One)</h5>
                  <div className="space-y-1">
                    {table.relationships.incoming.map((rel, index) => (
                      <div key={index} className="flex items-center p-2 bg-blue-50 rounded text-sm">
                        <span className="font-mono text-blue-700">{rel.sourceTable}.{rel.sourceColumn}</span>
                        <span className="mx-2">→</span>
                        <span className="font-mono">{rel.column}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}

interface DatabaseSchemaVisualizationProps {
  tables?: any[]
}

const DatabaseSchemaVisualization: React.FC<DatabaseSchemaVisualizationProps> = ({ tables: propTables }) => {
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set(['tenants']))
  const [viewMode, setViewMode] = useState<'hierarchical' | 'category' | 'relationships'>('hierarchical')

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
    setExpandedTables(new Set(databaseSchema.map(t => t.name)))
  }

  const collapseAll = () => {
    setExpandedTables(new Set())
  }

  const getTablesByMode = () => {
    switch (viewMode) {
      case 'hierarchical':
        return databaseSchema.sort((a, b) => {
          if (a.level !== b.level) return a.level - b.level
          return a.name.localeCompare(b.name)
        })
      case 'category':
        return databaseSchema.sort((a, b) => {
          if (a.category !== b.category) return a.category.localeCompare(b.category)
          return a.name.localeCompare(b.name)
        })
      case 'relationships':
        return databaseSchema.sort((a, b) => {
          const aRels = a.relationships.outgoing.length + a.relationships.incoming.length
          const bRels = b.relationships.outgoing.length + b.relationships.incoming.length
          if (aRels !== bRels) return bRels - aRels
          return a.name.localeCompare(b.name)
        })
      default:
        return databaseSchema
    }
  }

  const getStats = () => {
    const totalTables = databaseSchema.length
    const totalColumns = databaseSchema.reduce((sum, table) => sum + table.columns.length, 0)
    const totalRelationships = databaseSchema.reduce((sum, table) => 
      sum + table.relationships.outgoing.length + table.relationships.incoming.length, 0) / 2
    
    return { totalTables, totalColumns, totalRelationships }
  }

  const stats = getStats()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Database Schema Visualization</h2>
          <p className="text-gray-600">Organized, hierarchical view of your database structure</p>
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="hierarchical" className="flex items-center space-x-2">
            <Layers size={16} />
            <span>Hierarchical</span>
          </TabsTrigger>
          <TabsTrigger value="category" className="flex items-center space-x-2">
            <Table size={16} />
            <span>By Category</span>
          </TabsTrigger>
          <TabsTrigger value="relationships" className="flex items-center space-x-2">
            <GitBranch size={16} />
            <span>By Relationships</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={viewMode} className="space-y-4">
          {viewMode === 'hierarchical' && (
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Hierarchical Structure</h3>
              <p className="text-sm text-blue-800">
                Tables are organized by their relationship depth:
                <br />• <strong>Level 0 (Root):</strong> Core entities that other tables depend on
                <br />• <strong>Level 1:</strong> Main business entities
                <br />• <strong>Level 2:</strong> Supporting/detail tables
                <br />• <strong>Level 3:</strong> System tables
              </p>
            </div>
          )}

          {viewMode === 'category' && (
            <div className="mb-4 p-4 bg-green-50 rounded-lg">
              <h3 className="font-medium text-green-900 mb-2">Category Organization</h3>
              <p className="text-sm text-green-800">
                Tables grouped by business function:
                <br />• <strong>Core:</strong> Fundamental platform entities
                <br />• <strong>CRM:</strong> Customer relationship management
                <br />• <strong>Projects:</strong> Project management
                <br />• <strong>Financial:</strong> Billing and invoicing
                <br />• <strong>System:</strong> Technical/infrastructure tables
              </p>
            </div>
          )}

          {viewMode === 'relationships' && (
            <div className="mb-4 p-4 bg-purple-50 rounded-lg">
              <h3 className="font-medium text-purple-900 mb-2">Relationship Intensity</h3>
              <p className="text-sm text-purple-800">
                Tables ordered by number of relationships (most connected first).
                This view helps identify central entities in your data model.
              </p>
            </div>
          )}

          <div className="space-y-0">
            {getTablesByMode().map((table) => (
              <TableComponent
                key={table.name}
                table={table}
                expanded={expandedTables.has(table.name)}
                onToggle={() => toggleTable(table.name)}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default DatabaseSchemaVisualization
