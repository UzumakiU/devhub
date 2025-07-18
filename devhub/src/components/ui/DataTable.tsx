'use client'

import React from 'react'

export interface Column<T = Record<string, unknown>> {
  key: string
  header: string
  accessor?: keyof T | ((item: T) => React.ReactNode)
  sortable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
  render?: (value: unknown, item: T, index: number) => React.ReactNode
}

export interface DataTableProps<T = Record<string, unknown>> {
  data: T[]
  columns: Column<T>[]
  loading?: boolean
  emptyMessage?: string
  className?: string
  variant?: 'default' | 'striped' | 'bordered'
  size?: 'sm' | 'md' | 'lg'
  sortConfig?: {
    key: string
    direction: 'asc' | 'desc'
  }
  onSort?: (key: string) => void
  onRowClick?: (item: T, index: number) => void
  selectedRows?: Set<number>
  onRowSelect?: (index: number, selected: boolean) => void
  selectable?: boolean
}

export const DataTable = <T,>({
  data,
  columns,
  loading = false,
  emptyMessage = 'No data available',
  className = '',
  variant = 'default',
  size = 'md',
  sortConfig,
  onSort,
  onRowClick,
  selectedRows = new Set(),
  onRowSelect,
  selectable = false
}: DataTableProps<T>) => {
  const variantClasses = {
    default: 'border-collapse border border-gray-200',
    striped: 'border-collapse border border-gray-200',
    bordered: 'border-collapse border-2 border-gray-300'
  }

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-sm',
    lg: 'text-base'
  }

  const cellPadding = {
    sm: 'px-3 py-2',
    md: 'px-4 py-3',
    lg: 'px-6 py-4'
  }

  const handleSort = (key: string) => {
    if (onSort) {
      onSort(key)
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (onRowSelect) {
      data.forEach((_, index) => {
        onRowSelect(index, checked)
      })
    }
  }

  const getSortIcon = (columnKey: string) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return (
        <svg className="w-4 h-4 ml-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      )
    }

    return sortConfig.direction === 'asc' ? (
      <svg className="w-4 h-4 ml-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
      </svg>
    ) : (
      <svg className="w-4 h-4 ml-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
      </svg>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading...</span>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="mt-2">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className={`w-full ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}>
        <thead className="bg-gray-50">
          <tr>
            {selectable && (
              <th className={`${cellPadding[size]} text-left font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200`}>
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  checked={selectedRows.size === data.length && data.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </th>
            )}
            {columns.map((column) => (
              <th
                key={column.key}
                className={`${cellPadding[size]} text-left font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200 ${
                  column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                }`}
                style={{ width: column.width }}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className={`flex items-center ${
                  column.align === 'center' ? 'justify-center' : 
                  column.align === 'right' ? 'justify-end' : 'justify-start'
                }`}>
                  {column.header}
                  {column.sortable && getSortIcon(column.key)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={variant === 'striped' ? 'divide-y divide-gray-200' : ''}>
          {data.map((item, index) => (
            <tr
              key={index}
              className={`
                ${variant === 'striped' && index % 2 === 1 ? 'bg-gray-50' : 'bg-white'}
                ${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
                ${selectedRows.has(index) ? 'bg-blue-50' : ''}
                border-b border-gray-200
              `}
              onClick={() => onRowClick?.(item, index)}
            >
              {selectable && (
                <td className={cellPadding[size]}>
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={selectedRows.has(index)}
                    onChange={(e) => {
                      e.stopPropagation()
                      onRowSelect?.(index, e.target.checked)
                    }}
                  />
                </td>
              )}
              {columns.map((column) => {
                let value
                if (typeof column.accessor === 'function') {
                  value = column.accessor(item)
                } else if (column.accessor) {
                  value = item[column.accessor]
                } else {
                  value = ''
                }

                const cellContent = column.render 
                  ? column.render(value, item, index)
                  : value

                return (
                  <td
                    key={column.key}
                    className={`${cellPadding[size]} text-gray-900 ${
                      column.align === 'center' ? 'text-center' : 
                      column.align === 'right' ? 'text-right' : 'text-left'
                    }`}
                  >
                    {cellContent as React.ReactNode}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default DataTable
