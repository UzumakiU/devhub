'use client'

import { useState, useEffect, useMemo } from 'react'
import { TableData } from '@/types/database'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'

interface ColumnFilter {
  column: string
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan'
  value: string
}

interface SortConfig {
  column: string
  direction: 'asc' | 'desc'
  priority: number
}

interface EnhancedTableManagerProps {
  tableData: TableData
  onUpdateData: (data: Record<string, any>[]) => void
  onUpdateColumns: (columns: any[]) => void
  onCreateEndpoint: (endpoint: any) => void
}

export default function EnhancedTableManager({
  tableData,
  onUpdateData,
  onUpdateColumns,
  onCreateEndpoint
}: EnhancedTableManagerProps) {
  const [localData, setLocalData] = useState(tableData.data || [])
  const [columns, setColumns] = useState(tableData.columns || [])
  const [filters, setFilters] = useState<ColumnFilter[]>([])
  const [sorts, setSorts] = useState<SortConfig[]>([])
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())
  const [showFilters, setShowFilters] = useState(false)
  const [showColumnManager, setShowColumnManager] = useState(false)
  const [showEndpointBuilder, setShowEndpointBuilder] = useState(false)

  // Filtered and sorted data
  const processedData = useMemo(() => {
    let data = [...localData]

    // Apply filters
    filters.forEach(filter => {
      if (filter.value) {
        data = data.filter(row => {
          const cellValue = String(row[filter.column] || '').toLowerCase()
          const filterValue = filter.value.toLowerCase()
          
          switch (filter.operator) {
            case 'equals':
              return cellValue === filterValue
            case 'contains':
              return cellValue.includes(filterValue)
            case 'startsWith':
              return cellValue.startsWith(filterValue)
            case 'endsWith':
              return cellValue.endsWith(filterValue)
            case 'greaterThan':
              return parseFloat(cellValue) > parseFloat(filterValue)
            case 'lessThan':
              return parseFloat(cellValue) < parseFloat(filterValue)
            default:
              return true
          }
        })
      }
    })

    // Apply sorting
    if (sorts.length > 0) {
      data.sort((a, b) => {
        for (const sort of sorts.sort((x, y) => x.priority - y.priority)) {
          const aVal = a[sort.column] as any
          const bVal = b[sort.column] as any
          
          if (aVal < bVal) return sort.direction === 'asc' ? -1 : 1
          if (aVal > bVal) return sort.direction === 'asc' ? 1 : -1
        }
        return 0
      })
    }

    return data
  }, [localData, filters, sorts])

  // Handle column reordering
  const handleColumnDragEnd = (result: any) => {
    if (!result.destination) return

    const reorderedColumns = Array.from(columns)
    const [movedColumn] = reorderedColumns.splice(result.source.index, 1)
    reorderedColumns.splice(result.destination.index, 0, movedColumn)

    setColumns(reorderedColumns)
    onUpdateColumns(reorderedColumns)
  }

  // Add filter
  const addFilter = () => {
    setFilters([...filters, { column: columns[0]?.column_name || '', operator: 'contains', value: '' }])
  }

  // Remove filter
  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index))
  }

  // Add sort
  const addSort = (column: string) => {
    const existingSort = sorts.find(s => s.column === column)
    if (existingSort) {
      if (existingSort.direction === 'asc') {
        setSorts(sorts.map(s => s.column === column ? { ...s, direction: 'desc' } : s))
      } else {
        setSorts(sorts.filter(s => s.column !== column))
      }
    } else {
      setSorts([...sorts, { column, direction: 'asc', priority: sorts.length }])
    }
  }

  // Bulk operations
  const handleBulkDelete = () => {
    const newData = localData.filter((_, index) => !selectedRows.has(index))
    setLocalData(newData)
    setSelectedRows(new Set())
    onUpdateData(newData)
  }

  const handleBulkEdit = (field: string, value: any) => {
    const newData = localData.map((row, index) => 
      selectedRows.has(index) ? { ...row, [field]: value } : row
    )
    setLocalData(newData)
    onUpdateData(newData)
  }

  // Generate API endpoint
  const generateEndpoint = (type: 'GET' | 'POST' | 'PUT' | 'DELETE') => {
    const endpoint = {
      method: type,
      path: `/api/v1/${tableData.table_name}`,
      description: `${type} ${tableData.table_name}`,
      parameters: type === 'GET' ? ['limit', 'offset', 'search'] : [],
      requestBody: ['POST', 'PUT'].includes(type) ? columns.reduce((acc, col) => {
        acc[col.column_name] = col.data_type
        return acc
      }, {} as Record<string, string>) : null
    }
    
    onCreateEndpoint(endpoint)
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 bg-background rounded-lg">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold">{tableData.table_name}</h2>
          <div className="text-sm text-gray-600">
            {processedData.length} of {localData.length} rows
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-1 rounded transition-colors ${
              showFilters ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Filters ({filters.length})
          </button>
          
          <button
            onClick={() => setShowColumnManager(!showColumnManager)}
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
          >
            Columns
          </button>
          
          <button
            onClick={() => setShowEndpointBuilder(!showEndpointBuilder)}
            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            API Builder
          </button>
          
          {selectedRows.size > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">{selectedRows.size} selected</span>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Filters</h3>
            <button
              onClick={addFilter}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Add Filter
            </button>
          </div>
          
          <div className="space-y-2">
            {filters.map((filter, index) => (
              <div key={index} className="flex items-center space-x-2">
                <select
                  value={filter.column}
                  onChange={(e) => {
                    const newFilters = [...filters]
                    newFilters[index].column = e.target.value
                    setFilters(newFilters)
                  }}
                  className="px-3 py-1 border rounded"
                >
                  {columns.map(col => (
                    <option key={col.column_name} value={col.column_name}>
                      {col.column_name}
                    </option>
                  ))}
                </select>
                
                <select
                  value={filter.operator}
                  onChange={(e) => {
                    const newFilters = [...filters]
                    newFilters[index].operator = e.target.value as any
                    setFilters(newFilters)
                  }}
                  className="px-3 py-1 border rounded"
                >
                  <option value="contains">Contains</option>
                  <option value="equals">Equals</option>
                  <option value="startsWith">Starts with</option>
                  <option value="endsWith">Ends with</option>
                  <option value="greaterThan">Greater than</option>
                  <option value="lessThan">Less than</option>
                </select>
                
                <input
                  type="text"
                  value={filter.value}
                  onChange={(e) => {
                    const newFilters = [...filters]
                    newFilters[index].value = e.target.value
                    setFilters(newFilters)
                  }}
                  placeholder="Filter value"
                  className="px-3 py-1 border rounded flex-1"
                />
                
                <button
                  onClick={() => removeFilter(index)}
                  className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Column Manager */}
      {showColumnManager && (
        <div className="p-4 bg-background rounded-lg">
          <h3 className="font-semibold mb-4">Column Management</h3>
          <DragDropContext onDragEnd={handleColumnDragEnd}>
            <Droppable droppableId="columns">
              {(provided: any) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                  {columns.map((column, index) => (
                    <Draggable key={column.column_name} draggableId={column.column_name} index={index}>
                      {(provided: any) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="flex items-center justify-between p-3 bg-card rounded border"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                            <span className="font-medium">{column.column_name}</span>
                            <span className="text-sm text-gray-500">{column.data_type}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => addSort(column.column_name)}
                              className={`px-2 py-1 rounded text-sm ${
                                sorts.find(s => s.column === column.column_name)
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              Sort
                            </button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      )}

      {/* API Endpoint Builder */}
      {showEndpointBuilder && (
        <div className="p-4 bg-green-50 rounded-lg">
          <h3 className="font-semibold mb-4">API Endpoint Builder</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['GET', 'POST', 'PUT', 'DELETE'].map(method => (
              <button
                key={method}
                onClick={() => generateEndpoint(method as any)}
                className={`p-4 rounded-lg border-2 border-dashed transition-colors ${
                  method === 'GET' ? 'border-blue-300 hover:bg-blue-50' :
                  method === 'POST' ? 'border-green-300 hover:bg-green-50' :
                  method === 'PUT' ? 'border-yellow-300 hover:bg-yellow-50' :
                  'border-red-300 hover:bg-red-50'
                }`}
              >
                <div className="text-center">
                  <div className="font-bold text-lg">{method}</div>
                  <div className="text-sm text-gray-600">
                    {method === 'GET' ? 'Read data' :
                     method === 'POST' ? 'Create new' :
                     method === 'PUT' ? 'Update existing' :
                     'Delete records'}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-border">
          <thead>
            <tr className="bg-background">
              <th className="border border-border p-2">
                <input
                  type="checkbox"
                  checked={selectedRows.size === processedData.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedRows(new Set(processedData.map((_, i) => i)))
                    } else {
                      setSelectedRows(new Set())
                    }
                  }}
                  className="rounded"
                />
              </th>
              {columns.map(column => (
                <th
                  key={column.column_name}
                  className="border border-border p-2 text-left cursor-pointer hover:bg-gray-100"
                  onClick={() => addSort(column.column_name)}
                >
                  <div className="flex items-center justify-between">
                    <span>{column.column_name}</span>
                    {sorts.find(s => s.column === column.column_name) && (
                      <span className="text-blue-600">
                        {sorts.find(s => s.column === column.column_name)?.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {processedData.map((row, rowIndex) => (
              <tr key={rowIndex} className={selectedRows.has(rowIndex) ? 'bg-blue-50' : 'hover:bg-background'}>
                <td className="border border-border p-2">
                  <input
                    type="checkbox"
                    checked={selectedRows.has(rowIndex)}
                    onChange={(e) => {
                      const newSelected = new Set(selectedRows)
                      if (e.target.checked) {
                        newSelected.add(rowIndex)
                      } else {
                        newSelected.delete(rowIndex)
                      }
                      setSelectedRows(newSelected)
                    }}
                    className="rounded"
                  />
                </td>
                {columns.map(column => (
                  <td key={column.column_name} className="border border-border p-2">
                    {String(row[column.column_name] || '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
