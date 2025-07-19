'use client'

import { useState, useEffect } from 'react'
import { TableData } from '@/types/database'

interface TableDataModalProps {
  isOpen: boolean
  onClose: () => void
  tableData: TableData
}

interface EditingCell {
  rowIndex: number
  columnName: string
  value: any
}

export default function TableDataModal({ isOpen, onClose, tableData }: TableDataModalProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null)
  const [localData, setLocalData] = useState<Record<string, any>[]>([])
  const [isAddingRow, setIsAddingRow] = useState(false)
  const [newRow, setNewRow] = useState<Record<string, any>>({})
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())
  const [viewMode, setViewMode] = useState<'view' | 'edit'>('view')
  const rowsPerPage = 50
  
  // Reset to first page when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentPage(1)
      setLocalData([...(tableData.data || [])])
      setViewMode('view')
      setSelectedRows(new Set())
      initializeNewRow()
    }
  }, [isOpen, tableData])

  const initializeNewRow = () => {
    const row: Record<string, any> = {}
    tableData.columns?.forEach(column => {
      row[column.column_name] = column.column_default || ''
    })
    setNewRow(row)
  }

  const handleCellEdit = (rowIndex: number, columnName: string, value: any) => {
    const actualIndex = (currentPage - 1) * rowsPerPage + rowIndex
    const updatedData = [...localData]
    updatedData[actualIndex] = { ...updatedData[actualIndex], [columnName]: value }
    setLocalData(updatedData)
  }

  const handleSaveChanges = async () => {
    try {
      const response = await fetch(`http://localhost:8005/api/v1/database/table/${tableData.table_name}/data`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: localData })
      })
      
      if (response.ok) {
        // Optionally refresh the parent component
        window.location.reload()
      }
    } catch (error) {
      console.error('Error saving changes:', error)
    }
  }

  const handleAddRow = async () => {
    try {
      const response = await fetch(`http://localhost:8005/api/v1/database/table/${tableData.table_name}/row`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRow)
      })
      
      if (response.ok) {
        const addedRow = await response.json()
        setLocalData([...localData, addedRow])
        setIsAddingRow(false)
        initializeNewRow()
      }
    } catch (error) {
      console.error('Error adding row:', error)
    }
  }

  const handleDeleteRows = async () => {
    if (selectedRows.size === 0) return
    
    const rowsToDelete = Array.from(selectedRows).map(index => localData[index])
    
    try {
      const response = await fetch(`http://localhost:8005/api/v1/database/table/${tableData.table_name}/rows`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: rowsToDelete })
      })
      
      if (response.ok) {
        const updatedData = localData.filter((_, index) => !selectedRows.has(index))
        setLocalData(updatedData)
        setSelectedRows(new Set())
      }
    } catch (error) {
      console.error('Error deleting rows:', error)
    }
  }

  const toggleRowSelection = (index: number) => {
    const actualIndex = (currentPage - 1) * rowsPerPage + index
    const newSelected = new Set(selectedRows)
    if (newSelected.has(actualIndex)) {
      newSelected.delete(actualIndex)
    } else {
      newSelected.add(actualIndex)
    }
    setSelectedRows(newSelected)
  }

  const toggleAllRows = () => {
    const startIndex = (currentPage - 1) * rowsPerPage
    const endIndex = Math.min(startIndex + rowsPerPage, localData.length)
    const pageIndices = Array.from({ length: endIndex - startIndex }, (_, i) => startIndex + i)
    
    const allSelected = pageIndices.every(index => selectedRows.has(index))
    const newSelected = new Set(selectedRows)
    
    if (allSelected) {
      pageIndices.forEach(index => newSelected.delete(index))
    } else {
      pageIndices.forEach(index => newSelected.add(index))
    }
    
    setSelectedRows(newSelected)
  }

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const data = localData || []
  const totalPages = Math.ceil(data.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const currentData = data.slice(startIndex, endIndex)

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
        isOpen ? 'bg-black bg-opacity-60' : 'bg-black bg-opacity-0 pointer-events-none'
      }`}
      onClick={handleBackdropClick}
    >
      <div className={`bg-card rounded-xl shadow-2xl w-[90vw] h-[85vh] max-w-7xl flex flex-col transform transition-all duration-300 ${
        isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}>
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
          <div>
            <h2 className="text-xl font-bold text-foreground">{tableData.table_name}</h2>
            <p className="text-sm text-gray-600">
              {data.length.toLocaleString()} records total • Showing {startIndex + 1}-{Math.min(endIndex, data.length)}
              {selectedRows.size > 0 && ` • ${selectedRows.size} selected`}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {/* Mode Toggle */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('view')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  viewMode === 'view' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                View
              </button>
              <button
                onClick={() => setViewMode('edit')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  viewMode === 'edit' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Edit
              </button>
            </div>

            {/* Action Buttons */}
            {viewMode === 'edit' && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsAddingRow(true)}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                >
                  Add Row
                </button>
                {selectedRows.size > 0 && (
                  <button
                    onClick={handleDeleteRows}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
                  >
                    Delete ({selectedRows.size})
                  </button>
                )}
                <button
                  onClick={handleSaveChanges}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            )}

            <button
              onClick={onClose}
              className="p-2 hover:bg-card hover:bg-opacity-50 rounded-full transition-all duration-200"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {data.length > 0 ? (
            <>
              {/* Add Row Form */}
              {isAddingRow && (
                <div className="p-4 bg-blue-50 border-b border-blue-200">
                  <h3 className="text-sm font-medium text-blue-900 mb-3">Add New Row</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-32 overflow-y-auto">
                    {tableData.columns?.map((column) => (
                      <div key={column.column_name} className="flex flex-col">
                        <label className="text-xs text-gray-600 mb-1">{column.column_name}</label>
                        <input
                          type="text"
                          value={newRow[column.column_name] || ''}
                          onChange={(e) => setNewRow(prev => ({ ...prev, [column.column_name]: e.target.value }))}
                          className="px-2 py-1 text-sm border border-border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder={column.data_type}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex space-x-2 mt-3">
                    <button
                      onClick={handleAddRow}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      Add Row
                    </button>
                    <button
                      onClick={() => setIsAddingRow(false)}
                      className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Table Container */}
              <div className="flex-1 overflow-auto">
                <div className="h-full">
                  <table className="min-w-full divide-y divide-gray-200 h-full">
                    <thead className="bg-background sticky top-0 z-10">
                      <tr>
                        {viewMode === 'edit' && (
                          <th className="px-3 py-3 text-left">
                            <input
                              type="checkbox"
                              onChange={toggleAllRows}
                              checked={currentData.length > 0 && currentData.every((_, i) => selectedRows.has(startIndex + i))}
                              className="rounded border-border text-blue-600 focus:ring-blue-500"
                            />
                          </th>
                        )}
                        {tableData.columns?.map((column) => (
                          <th 
                            key={column.column_name}
                            className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-border last:border-r-0"
                          >
                            <div className="flex flex-col min-w-0">
                              <span className="truncate font-semibold">{column.column_name}</span>
                              <span className="text-gray-400 normal-case text-xs truncate">
                                {column.data_type}
                              </span>
                            </div>
                          </th>
                        ))}
                        {viewMode === 'edit' && (
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-gray-200">
                      {currentData.map((row, index) => {
                        const actualIndex = startIndex + index
                        return (
                          <tr key={actualIndex} className="hover:bg-background transition-colors">
                            {viewMode === 'edit' && (
                              <td className="px-3 py-2">
                                <input
                                  type="checkbox"
                                  checked={selectedRows.has(actualIndex)}
                                  onChange={() => toggleRowSelection(index)}
                                  className="rounded border-border text-blue-600 focus:ring-blue-500"
                                />
                              </td>
                            )}
                            {tableData.columns?.map((column) => (
                              <td 
                                key={column.column_name}
                                className="px-3 py-2 text-sm text-foreground border-r border-gray-100 last:border-r-0"
                              >
                                {viewMode === 'edit' ? (
                                  <input
                                    type="text"
                                    value={row[column.column_name] !== null && row[column.column_name] !== undefined ? String(row[column.column_name]) : ''}
                                    onChange={(e) => handleCellEdit(index, column.column_name, e.target.value)}
                                    className="w-full px-2 py-1 text-sm border border-transparent hover:border-border focus:border-blue-500 focus:outline-none rounded"
                                    placeholder={row[column.column_name] === null ? 'NULL' : ''}
                                  />
                                ) : (
                                  <div className="max-w-xs truncate" title={String(row[column.column_name] || '')}>
                                    {row[column.column_name] !== null && row[column.column_name] !== undefined 
                                      ? <span className="text-foreground">{String(row[column.column_name])}</span>
                                      : <span className="text-gray-400 italic text-xs">NULL</span>
                                    }
                                  </div>
                                )}
                              </td>
                            ))}
                            {viewMode === 'edit' && (
                              <td className="px-3 py-2">
                                <button
                                  onClick={() => {
                                    const newSelected = new Set(selectedRows)
                                    newSelected.add(actualIndex)
                                    setSelectedRows(newSelected)
                                    handleDeleteRows()
                                  }}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </td>
                            )}
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-3 border-t border-border bg-background rounded-b-xl">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-sm font-medium text-gray-700 bg-card border border-border rounded-md hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        ←
                      </button>
                      
                      {/* Compact page numbers */}
                      <div className="flex space-x-1">
                        {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                          let pageNum
                          if (totalPages <= 3) {
                            pageNum = i + 1
                          } else if (currentPage <= 2) {
                            pageNum = i + 1
                          } else if (currentPage >= totalPages - 1) {
                            pageNum = totalPages - 2 + i
                          } else {
                            pageNum = currentPage - 1 + i
                          }
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`px-2 py-1 text-sm font-medium rounded-md transition-colors ${
                                currentPage === pageNum
                                  ? 'bg-blue-600 text-white'
                                  : 'text-gray-700 bg-card border border-border hover:bg-background'
                              }`}
                            >
                              {pageNum}
                            </button>
                          )
                        })}
                      </div>

                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 text-sm font-medium text-gray-700 bg-card border border-border rounded-md hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        →
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center">
                <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8l-4 4m0 0l-4-4m4 4V3" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">No Data Available</h3>
                <p className="text-gray-500">This table contains no records to display</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
