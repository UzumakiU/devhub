'use client'

import React, { useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { ArrowRight, ArrowLeft, CornerDownRight, Users, Building, FolderOpen, FileText, CreditCard, MessageCircle, StickyNote, UserCheck, Database } from 'lucide-react'

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

interface RelationshipNode {
  id: string
  label: string
  type: 'core' | 'entity' | 'detail' | 'system'
  icon: React.ReactNode
  description: string
  level: number
  position: { x: number; y: number }
  connections: Array<{
    target: string
    type: 'one-to-many' | 'many-to-one' | 'one-to-one'
    label: string
  }>
}

const relationshipNodes: RelationshipNode[] = [
  {
    id: 'tenants',
    label: 'Tenants',
    type: 'core',
    icon: <Building className="w-5 h-5" />,
    description: 'Core business entities',
    level: 0,
    position: { x: 400, y: 50 },
    connections: [
      { target: 'users', type: 'one-to-many', label: 'has employees' },
      { target: 'customers', type: 'one-to-many', label: 'manages clients' },
      { target: 'projects', type: 'one-to-many', label: 'owns projects' },
      { target: 'leads', type: 'one-to-many', label: 'tracks leads' }
    ]
  },
  {
    id: 'users',
    label: 'Users',
    type: 'entity',
    icon: <Users className="w-5 h-5" />,
    description: 'Platform users and employees',
    level: 1,
    position: { x: 100, y: 200 },
    connections: [
      { target: 'projects', type: 'one-to-many', label: 'owns projects' },
      { target: 'customer_interactions', type: 'one-to-many', label: 'creates interactions' },
      { target: 'lead_interactions', type: 'one-to-many', label: 'manages lead interactions' },
      { target: 'customer_notes', type: 'one-to-many', label: 'writes notes' },
      { target: 'leads', type: 'one-to-many', label: 'assigned to leads' }
    ]
  },
  {
    id: 'customers',
    label: 'Customers',
    type: 'entity',
    icon: <UserCheck className="w-5 h-5" />,
    description: 'External clients',
    level: 1,
    position: { x: 400, y: 200 },
    connections: [
      { target: 'customer_interactions', type: 'one-to-many', label: 'has interactions' },
      { target: 'customer_notes', type: 'one-to-many', label: 'has notes' },
      { target: 'invoices', type: 'one-to-many', label: 'receives invoices' }
    ]
  },
  {
    id: 'leads',
    label: 'Leads',
    type: 'entity',
    icon: <UserCheck className="w-5 h-5" />,
    description: 'Potential customers',
    level: 1,
    position: { x: 700, y: 200 },
    connections: [
      { target: 'lead_interactions', type: 'one-to-many', label: 'has interactions' }
    ]
  },
  {
    id: 'projects',
    label: 'Projects',
    type: 'entity',
    icon: <FolderOpen className="w-5 h-5" />,
    description: 'Work projects',
    level: 1,
    position: { x: 100, y: 350 },
    connections: []
  },
  {
    id: 'customer_interactions',
    label: 'Customer Interactions',
    type: 'detail',
    icon: <MessageCircle className="w-5 h-5" />,
    description: 'Customer communications',
    level: 2,
    position: { x: 250, y: 350 },
    connections: []
  },
  {
    id: 'lead_interactions',
    label: 'Lead Interactions',
    type: 'detail',
    icon: <MessageCircle className="w-5 h-5" />,
    description: 'Lead communications',
    level: 2,
    position: { x: 550, y: 350 },
    connections: []
  },
  {
    id: 'customer_notes',
    label: 'Customer Notes',
    type: 'detail',
    icon: <StickyNote className="w-5 h-5" />,
    description: 'Customer notes',
    level: 2,
    position: { x: 400, y: 350 },
    connections: []
  },
  {
    id: 'invoices',
    label: 'Invoices',
    type: 'detail',
    icon: <CreditCard className="w-5 h-5" />,
    description: 'Customer invoices',
    level: 2,
    position: { x: 700, y: 350 },
    connections: []
  }
]

const RelationshipArrow: React.FC<{
  from: { x: number; y: number }
  to: { x: number; y: number }
  label: string
  type: 'one-to-many' | 'many-to-one' | 'one-to-one'
}> = ({ from, to, label, type }) => {
  const midX = (from.x + to.x) / 2
  const midY = (from.y + to.y) / 2
  
  return (
    <g>
      <line
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        stroke="#6b7280"
        strokeWidth="2"
        markerEnd="url(#arrowhead)"
      />
      <text
        x={midX}
        y={midY - 5}
        textAnchor="middle"
        fontSize="12"
        fill="#374151"
        className="font-medium"
      >
        {label}
      </text>
      <text
        x={midX}
        y={midY + 15}
        textAnchor="middle"
        fontSize="10"
        fill="#6b7280"
      >
        {type}
      </text>
    </g>
  )
}

const RelationshipNode: React.FC<{
  node: RelationshipNode
  isSelected: boolean
  onSelect: (id: string) => void
}> = ({ node, isSelected, onSelect }) => {
  const getNodeColor = (type: string) => {
    switch (type) {
      case 'core': return 'bg-blue-100 border-blue-300 text-blue-800'
      case 'entity': return 'bg-green-100 border-green-300 text-green-800'
      case 'detail': return 'bg-purple-100 border-purple-300 text-purple-800'
      case 'system': return 'bg-gray-100 border-border text-gray-800'
      default: return 'bg-gray-100 border-border text-gray-800'
    }
  }

  return (
    <div
      className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      }`}
      style={{ left: node.position.x, top: node.position.y }}
      onClick={() => onSelect(node.id)}
    >
      <div className={`px-4 py-2 rounded-lg border-2 ${getNodeColor(node.type)} shadow-md min-w-[120px] text-center`}>
        <div className="flex items-center justify-center space-x-2 mb-1">
          {node.icon}
          <span className="font-semibold text-sm">{node.label}</span>
        </div>
        <p className="text-xs">{node.description}</p>
      </div>
    </div>
  )
}

const DatabaseRelationshipsMap: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<string | null>('tenants')
  const [showAllConnections, setShowAllConnections] = useState(false)

  const getConnections = () => {
    if (showAllConnections) {
      return relationshipNodes.flatMap(node => 
        node.connections.map(conn => ({
          from: node.position,
          to: relationshipNodes.find(n => n.id === conn.target)?.position || { x: 0, y: 0 },
          label: conn.label,
          type: conn.type
        }))
      )
    } else if (selectedNode) {
      const node = relationshipNodes.find(n => n.id === selectedNode)
      return node?.connections.map(conn => ({
        from: node.position,
        to: relationshipNodes.find(n => n.id === conn.target)?.position || { x: 0, y: 0 },
        label: conn.label,
        type: conn.type
      })) || []
    }
    return []
  }

  const selectedNodeData = relationshipNodes.find(n => n.id === selectedNode)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Database Relationships Map</h2>
          <p className="text-gray-600">Interactive visualization of table relationships</p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={() => setShowAllConnections(!showAllConnections)}
            variant={showAllConnections ? "primary" : "secondary"}
            size="sm"
          >
            {showAllConnections ? 'Show Selected Only' : 'Show All Connections'}
          </Button>
        </div>
      </div>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-100 border-2 border-blue-300 rounded"></div>
              <span className="text-sm">Core Tables</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-100 border-2 border-green-300 rounded"></div>
              <span className="text-sm">Entity Tables</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-purple-100 border-2 border-purple-300 rounded"></div>
              <span className="text-sm">Detail Tables</span>
            </div>
            <div className="flex items-center space-x-2">
              <ArrowRight className="w-4 h-4 text-gray-600" />
              <span className="text-sm">One-to-Many</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Relationships Map */}
      <Card className="h-[500px] overflow-hidden">
        <CardContent className="p-0 h-full relative">
          <svg className="w-full h-full absolute inset-0" viewBox="0 0 800 500">
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
              </marker>
            </defs>
            
            {getConnections().map((conn, index) => (
              <RelationshipArrow
                key={index}
                from={conn.from}
                to={conn.to}
                label={conn.label}
                type={conn.type}
              />
            ))}
          </svg>
          
          {relationshipNodes.map(node => (
            <RelationshipNode
              key={node.id}
              node={node}
              isSelected={selectedNode === node.id}
              onSelect={setSelectedNode}
            />
          ))}
        </CardContent>
      </Card>

      {/* Selected Node Details */}
      {selectedNodeData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {selectedNodeData.icon}
              <span>{selectedNodeData.label}</span>
              <Badge variant="secondary">Level {selectedNodeData.level}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-700">{selectedNodeData.description}</p>
              
              {selectedNodeData.connections.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Relationships:</h4>
                  <div className="space-y-2">
                    {selectedNodeData.connections.map((conn, index) => {
                      const targetNode = relationshipNodes.find(n => n.id === conn.target)
                      return (
                        <div key={index} className="flex items-center space-x-2 p-2 bg-background rounded">
                          <div className="flex items-center space-x-2">
                            {targetNode?.icon}
                            <span className="font-medium">{targetNode?.label}</span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">{conn.label}</span>
                          <Badge variant="secondary" className="text-xs">
                            {conn.type}
                          </Badge>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">How to Use</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-blue-700">
            <p>• Click on any table node to see its relationships</p>
            <p>• Use "Show All Connections" to view the complete relationship map</p>
            <p>• Tables are color-coded by type: Core (blue), Entity (green), Detail (purple)</p>
            <p>• Arrows show the direction and type of relationships between tables</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default DatabaseRelationshipsMap
