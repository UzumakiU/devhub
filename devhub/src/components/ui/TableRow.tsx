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
    default: 'bg-card border-b border-border',
    hover: 'bg-card hover:bg-background border-b border-border cursor-pointer',
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
