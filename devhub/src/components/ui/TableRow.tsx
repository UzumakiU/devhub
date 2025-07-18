'use client'

import React from 'react'

export interface TableRowProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'hover' | 'selected'
  onClick?: () => void
  disabled?: boolean
}

export const TableRow: React.FC<TableRowProps> = ({
  children,
  className = '',
  variant = 'default',
  onClick,
  disabled = false
}) => {
  const variantClasses = {
    default: 'bg-white border-b border-gray-200',
    hover: 'bg-white hover:bg-gray-50 border-b border-gray-200 cursor-pointer',
    selected: 'bg-blue-50 border-b border-blue-200'
  }

  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : ''

  return (
    <tr
      className={`${variantClasses[variant]} ${disabledClasses} ${className}`}
      onClick={disabled ? undefined : onClick}
    >
      {children}
    </tr>
  )
}

export default TableRow
