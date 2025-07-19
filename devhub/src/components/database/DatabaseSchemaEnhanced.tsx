'use client'

import React, { useState, useEffect } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { ChevronDown, ChevronRight, Database, Key, Link, Eye, Table, Layers, GitBranch, RefreshCw, ExternalLink } from 'lucide-react'

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

interface DatabaseSchemaEnhancedProps {
  connectionString?: string
  onViewInBrowser?: () => void
  initialTables?: any[]
}

const DatabaseSchemaEnhanced: React.FC<DatabaseSchemaEnhancedProps> = ({ 
  connectionString = 'localhost:3005/database',
  onViewInBrowser,
  initialTables = []
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'hierarchical' | 'relationships' | 'visual'>('hierarchical')
  const [tables, setTables] = useState(initialTables)
  const [stats, setStats] = useState({ tables: 0, columns: 0, relationships: 0 })

  // Calculate stats from real API data
  useEffect(() => {
    if (tables && tables.length > 0) {
      const totalTables = tables.length
      const totalColumns = tables.reduce((sum: number, table: any) => sum + (table.columns?.length || 0), 0)
      const totalRelationships = tables.reduce((sum: number, table: any) => sum + (table.relationships?.length || 0), 0)
      
      setStats({
        tables: totalTables,
        columns: totalColumns,
        relationships: Math.floor(totalRelationships / 2) // Avoid double counting
      })
    }
  }, [tables])

  const openInBrowser = () => {
    if (onViewInBrowser) {
      onViewInBrowser()
    } else {
      window.open(`http://${connectionString}`, '_blank')
    }
  }

  const refreshSchema = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Enhanced Database Schema</h2>
          <p className="text-gray-600">Interactive database visualization with improved clarity</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={refreshSchema} 
            variant="secondary" 
            size="sm"
            disabled={isLoading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Refreshing...' : 'Refresh Schema'}
          </Button>
          <Button 
            onClick={openInBrowser} 
            variant="primary" 
            size="sm"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Open in Browser
          </Button>
        </div>
      </div>

      {/* Issues with Current Schema Viewer */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="text-yellow-800">Current Schema Viewer Issues</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-yellow-700">
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <strong>Overlapping Tables:</strong> Tables are positioned on top of each other making it difficult to read table names and structure.
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <strong>Poor Relationship Visibility:</strong> Relationship arrows are barely visible and hard to follow between tables.
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <strong>No Organization:</strong> Tables are not grouped by domain or hierarchy, making it hard to understand the data model.
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <strong>Limited Zoom Control:</strong> Current zoom level (81%) doesn't provide optimal viewing of all relationships.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Proposed Solutions */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-800">Proposed Improvements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-green-800">Layout Improvements</h4>
              <ul className="space-y-2 text-sm text-green-700">
                <li className="flex items-start space-x-2">
                  <Layers className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Hierarchical arrangement with core tables at the top</span>
                </li>
                <li className="flex items-start space-x-2">
                  <GitBranch className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Clear relationship lines with proper spacing</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Database className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Color-coded tables by domain (CRM, Projects, etc.)</span>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-green-800">Interactive Features</h4>
              <ul className="space-y-2 text-sm text-green-700">
                <li className="flex items-start space-x-2">
                  <Eye className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Expandable/collapsible table details</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Table className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Multiple view modes (hierarchical, domain, relationships)</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Link className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Clickable relationships to highlight connections</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={() => window.location.hash = '#schema'} 
              variant="primary" 
              className="w-full"
            >
              <Layers className="mr-2 h-4 w-4" />
              View Enhanced Schema (In Manager)
            </Button>
            <Button 
              onClick={openInBrowser} 
              variant="secondary" 
              className="w-full"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Open Original Viewer
            </Button>
            <Button 
              onClick={() => window.location.hash = '#relationships'} 
              variant="secondary" 
              className="w-full"
            >
              <GitBranch className="mr-2 h-4 w-4" />
              View Relationships (In Manager)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current Schema Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Table className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.tables}</p>
                <p className="text-sm text-gray-600">Tables</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats.columns}</p>
                <p className="text-sm text-gray-600">Columns</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Key className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{tables.filter((t: any) => t.columns?.some((c: any) => c.column_name === 'id')).length}</p>
                <p className="text-sm text-gray-600">Primary Keys</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Link className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{stats.relationships}</p>
                <p className="text-sm text-gray-600">Relationships</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommended Next Steps */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800">Recommended Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
              <div>
                <h4 className="font-semibold text-blue-800">Use the Schema Tab in Database Manager</h4>
                <p className="text-sm text-blue-700">Switch to the "Database Manager" tab, then click "Schema" to see the organized, hierarchical database structure with real data.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
              <div>
                <h4 className="font-semibold text-blue-800">Adjust Layout Settings</h4>
                <p className="text-sm text-blue-700">In the original viewer, try using "Auto Layout" and adjusting zoom to 100% for better visibility.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
              <div>
                <h4 className="font-semibold text-blue-800">Focus on Core Tables First</h4>
                <p className="text-sm text-blue-700">Start by understanding the main entities: tenants → users/customers → interactions/projects.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default DatabaseSchemaEnhanced
