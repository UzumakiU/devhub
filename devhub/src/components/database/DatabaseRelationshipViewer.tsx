'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { TableData } from '@/types/database'

interface Node {
  id: string
  name: string
  x: number
  y: number
  width: number
  height: number
  columns: Array<{
    name: string
    type: string
    isPrimaryKey?: boolean
    isForeignKey?: boolean
    referencedTable?: string
    referencedColumn?: string
  }>
}

interface Edge {
  id: string
  source: string
  target: string
  sourceColumn: string
  targetColumn: string
  type: 'one-to-one' | 'one-to-many' | 'many-to-many'
}

interface DatabaseRelationshipViewerProps {
  tables: TableData[]
  onTableClick?: (table: TableData) => void
  onRelationshipCreate?: (relationship: Edge) => void
  onRelationshipDelete?: (relationshipId: string) => void
}

export default function DatabaseRelationshipViewer({
  tables,
  onTableClick,
  onRelationshipCreate,
  onRelationshipDelete
}: DatabaseRelationshipViewerProps) {
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [draggedNode, setDraggedNode] = useState<string | null>(null)
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null)
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, width: 1200, height: 800 })
  const [zoom, setZoom] = useState(1)
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState<{ x: number; y: number } | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  // Convert tables to nodes
  useEffect(() => {
    const newNodes: Node[] = tables.map((table, index) => ({
      id: table.table_name,
      name: table.table_name,
      x: 50 + (index % 4) * 300,
      y: 50 + Math.floor(index / 4) * 250,
      width: 280,
      height: Math.max(120, 40 + (table.columns?.length || 0) * 25),
      columns: table.columns?.map(col => ({
        name: col.column_name,
        type: col.data_type,
        isPrimaryKey: col.column_name === 'id' || col.column_name.includes('_id') && col.column_name !== 'tenant_id',
        isForeignKey: col.column_name.includes('_id') && col.column_name !== 'id',
        referencedTable: col.column_name.includes('_id') ? col.column_name.replace('_id', 's') : undefined,
        referencedColumn: col.column_name.includes('_id') ? 'id' : undefined
      })) || []
    }))
    setNodes(newNodes)
  }, [tables])

  // Generate edges from foreign key relationships
  useEffect(() => {
    const newEdges: Edge[] = []
    
    tables.forEach(table => {
      table.relationships?.forEach(rel => {
        const edgeId = `${table.table_name}-${rel.foreign_table_name}`
        if (!newEdges.find(e => e.id === edgeId)) {
          newEdges.push({
            id: edgeId,
            source: table.table_name,
            target: rel.foreign_table_name,
            sourceColumn: rel.foreign_column_name || 'id',
            targetColumn: 'id',
            type: 'one-to-many'
          })
        }
      })
    })
    
    setEdges(newEdges)
  }, [tables])

  // Auto-layout algorithm
  const autoLayout = useCallback(() => {
    const layoutNodes = [...nodes]
    const centerX = viewBox.width / 2
    const centerY = viewBox.height / 2
    const radius = Math.min(viewBox.width, viewBox.height) * 0.3

    layoutNodes.forEach((node, index) => {
      const angle = (index / layoutNodes.length) * 2 * Math.PI
      node.x = centerX + Math.cos(angle) * radius - node.width / 2
      node.y = centerY + Math.sin(angle) * radius - node.height / 2
    })

    setNodes(layoutNodes)
  }, [nodes, viewBox])

  // Handle mouse events
  const handleMouseDown = (e: React.MouseEvent, nodeId?: string) => {
    if (nodeId) {
      setDraggedNode(nodeId)
      setDragStart({ x: e.clientX, y: e.clientY })
      setSelectedNode(nodeId)
    } else {
      setIsPanning(true)
      setPanStart({ x: e.clientX, y: e.clientY })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggedNode && dragStart) {
      const deltaX = (e.clientX - dragStart.x) / zoom
      const deltaY = (e.clientY - dragStart.y) / zoom
      
      setNodes(prevNodes => 
        prevNodes.map(node => 
          node.id === draggedNode 
            ? { ...node, x: node.x + deltaX, y: node.y + deltaY }
            : node
        )
      )
      setDragStart({ x: e.clientX, y: e.clientY })
    } else if (isPanning && panStart) {
      const deltaX = (e.clientX - panStart.x) / zoom
      const deltaY = (e.clientY - panStart.y) / zoom
      
      setViewBox(prev => ({
        ...prev,
        x: prev.x - deltaX,
        y: prev.y - deltaY
      }))
      setPanStart({ x: e.clientX, y: e.clientY })
    }
  }

  const handleMouseUp = () => {
    setDraggedNode(null)
    setDragStart(null)
    setIsPanning(false)
    setPanStart(null)
  }

  // Handle zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY * -0.001
    const newZoom = Math.min(Math.max(0.1, zoom + delta), 3)
    setZoom(newZoom)
  }

  // Generate SVG path for edge
  const generateEdgePath = (edge: Edge) => {
    const sourceNode = nodes.find(n => n.id === edge.source)
    const targetNode = nodes.find(n => n.id === edge.target)
    
    if (!sourceNode || !targetNode) return ''
    
    const sourceX = sourceNode.x + sourceNode.width
    const sourceY = sourceNode.y + sourceNode.height / 2
    const targetX = targetNode.x
    const targetY = targetNode.y + targetNode.height / 2
    
    const midX = (sourceX + targetX) / 2
    
    return `M ${sourceX} ${sourceY} C ${midX} ${sourceY}, ${midX} ${targetY}, ${targetX} ${targetY}`
  }

  return (
    <div className="w-full h-full bg-gray-900 rounded-lg overflow-hidden relative">
      {/* Toolbar */}
      <div className="absolute top-4 left-4 z-10 flex items-center space-x-2">
        <button
          onClick={autoLayout}
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Auto Layout
        </button>
        <button
          onClick={() => setZoom(1)}
          className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
        >
          Reset Zoom
        </button>
        <div className="px-3 py-1 bg-gray-800 text-white rounded">
          Zoom: {Math.round(zoom * 100)}%
        </div>
      </div>

      {/* Relationship Viewer */}
      <svg
        ref={svgRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
        onMouseDown={e => handleMouseDown(e)}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{ transform: `scale(${zoom})` }}
      >
        {/* Grid Background */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#374151" strokeWidth="1" opacity="0.3"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Edges */}
        {edges.map(edge => (
          <g key={edge.id}>
            <path
              d={generateEdgePath(edge)}
              fill="none"
              stroke="#10b981"
              strokeWidth="2"
              markerEnd="url(#arrowhead)"
            />
            {/* Relationship label */}
            <text
              x={(nodes.find(n => n.id === edge.source)?.x || 0) + 140}
              y={(nodes.find(n => n.id === edge.source)?.y || 0) - 10}
              fill="#10b981"
              fontSize="12"
              className="pointer-events-none"
            >
              {edge.type}
            </text>
          </g>
        ))}

        {/* Arrow marker */}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              fill="#10b981"
            />
          </marker>
        </defs>

        {/* Nodes */}
        {nodes.map(node => (
          <g
            key={node.id}
            className="cursor-pointer"
            onMouseDown={e => {
              e.stopPropagation()
              handleMouseDown(e, node.id)
            }}
          >
            {/* Table Container */}
            <rect
              x={node.x}
              y={node.y}
              width={node.width}
              height={node.height}
              fill={selectedNode === node.id ? "#1e40af" : "#1f2937"}
              stroke={selectedNode === node.id ? "#3b82f6" : "#4b5563"}
              strokeWidth="2"
              rx="8"
              className="transition-all duration-200"
            />

            {/* Table Header */}
            <rect
              x={node.x}
              y={node.y}
              width={node.width}
              height="32"
              fill="#374151"
              rx="8"
            />
            <rect
              x={node.x}
              y={node.y + 24}
              width={node.width}
              height="8"
              fill="#374151"
            />

            {/* Table Name */}
            <text
              x={node.x + 12}
              y={node.y + 20}
              fill="#f3f4f6"
              fontSize="14"
              fontWeight="bold"
              className="pointer-events-none"
            >
              {node.name}
            </text>

            {/* Columns */}
            {node.columns.slice(0, 8).map((column, index) => (
              <g key={column.name}>
                <text
                  x={node.x + 12}
                  y={node.y + 50 + index * 20}
                  fill={column.isPrimaryKey ? "#fbbf24" : column.isForeignKey ? "#10b981" : "#d1d5db"}
                  fontSize="12"
                  className="pointer-events-none"
                >
                  {column.isPrimaryKey && "🔑 "}
                  {column.isForeignKey && "🔗 "}
                  {column.name}
                </text>
                <text
                  x={node.x + node.width - 80}
                  y={node.y + 50 + index * 20}
                  fill="#9ca3af"
                  fontSize="10"
                  className="pointer-events-none"
                >
                  {column.type.split('(')[0]}
                </text>
              </g>
            ))}

            {/* Show more indicator */}
            {node.columns.length > 8 && (
              <text
                x={node.x + 12}
                y={node.y + 50 + 8 * 20}
                fill="#6b7280"
                fontSize="11"
                className="pointer-events-none"
              >
                +{node.columns.length - 8} more...
              </text>
            )}
          </g>
        ))}
      </svg>

      {/* Selected Table Info Panel */}
      {selectedNode && (
        <div className="absolute bottom-4 left-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg max-w-sm">
          <h3 className="font-bold mb-2">{selectedNode}</h3>
          <div className="space-y-1 text-sm">
            <div>Columns: {nodes.find(n => n.id === selectedNode)?.columns.length}</div>
            <div>Primary Keys: {nodes.find(n => n.id === selectedNode)?.columns.filter(c => c.isPrimaryKey).length}</div>
            <div>Foreign Keys: {nodes.find(n => n.id === selectedNode)?.columns.filter(c => c.isForeignKey).length}</div>
          </div>
          <button
            onClick={() => {
              const table = tables.find(t => t.table_name === selectedNode)
              if (table && onTableClick) onTableClick(table)
            }}
            className="mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Edit Table
          </button>
        </div>
      )}
    </div>
  )
}
