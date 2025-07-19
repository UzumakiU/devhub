'use client'

import React from 'react'

export interface FormGroupProps {
  children: React.ReactNode
  title?: string
  description?: string
  className?: string
  variant?: 'default' | 'bordered' | 'elevated'
}

export const FormGroup: React.FC<FormGroupProps> = ({
  children,
  title,
  description,
  className = '',
  variant = 'default'
}) => {
  const variantClasses = {
    default: '',
    bordered: 'border border-border rounded-lg p-6',
    elevated: 'bg-card shadow-sm border border-border rounded-lg p-6'
  }
  
  return (
    <div className={`space-y-6 ${variantClasses[variant]} ${className}`}>
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h3 className="text-lg font-medium text-foreground">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-gray-600">
              {description}
            </p>
          )}
        </div>
      )}
      
      <div className="space-y-4">
        {children}
      </div>
    </div>
  )
}

export default FormGroup
