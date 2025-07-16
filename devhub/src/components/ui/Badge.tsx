'use client'

import React from 'react'

export type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
export type BadgeSize = 'sm' | 'md' | 'lg'

export interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  size?: BadgeSize
  className?: string
  dot?: boolean
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  dot = false
}) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full'
  
  const sizeClasses = {
    sm: dot ? 'h-2 w-2' : 'px-2 py-0.5 text-xs',
    md: dot ? 'h-2.5 w-2.5' : 'px-2.5 py-0.5 text-xs',
    lg: dot ? 'h-3 w-3' : 'px-3 py-1 text-sm'
  }
  
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-blue-100 text-blue-800',
    secondary: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800'
  }
  
  const classes = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`.trim()
  
  if (dot) {
    return <span className={classes} />
  }
  
  return (
    <span className={classes}>
      {children}
    </span>
  )
}

export default Badge
