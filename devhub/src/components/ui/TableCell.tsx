'use client'

import React from 'react'

export interface TableCellProps {
  children: React.ReactNode
  className?: string
  align?: 'left' | 'center' | 'right'
  width?: string
  component?: 'td' | 'th'
  sortable?: boolean
  onSort?: () => void
  sortDirection?: 'asc' | 'desc' | null
}

export const TableCell: React.FC<TableCellProps> = ({
  children,
  className = '',
  align = 'left',
  width,
  component = 'td',
  sortable = false,
  onSort,
  sortDirection = null
}) => {
  const Component = component
  
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }

  const baseClasses = component === 'th' 
    ? 'px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-border'
    : 'px-4 py-3 text-sm text-foreground border-b border-border'

  const sortableClasses = sortable 
    ? 'cursor-pointer hover:bg-gray-100 select-none' 
    : ''

  const getSortIcon = () => {
    if (!sortable) return null

    if (sortDirection === null) {
      return (
        <svg className="w-4 h-4 ml-1 text-gray-400 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      )
    }

    return sortDirection === 'asc' ? (
      <svg className="w-4 h-4 ml-1 text-blue-600 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 ml-1 text-blue-600 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    )
  }

  return (
    <Component
      className={`${baseClasses} ${alignClasses[align]} ${sortableClasses} ${className}`}
      style={{ width }}
      onClick={sortable ? onSort : undefined}
    >
      <div className={`flex items-center ${align === 'center' ? 'justify-center' : align === 'right' ? 'justify-end' : 'justify-start'}`}>
        {children}
        {getSortIcon()}
      </div>
    </Component>
  )
}

export default TableCell
