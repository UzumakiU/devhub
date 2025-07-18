'use client'

import React from 'react'
import { colors } from './theme'

export interface FormFieldProps {
  children: React.ReactNode
  label?: string
  error?: string
  hint?: string
  required?: boolean
  disabled?: boolean
  className?: string
}

export const FormField: React.FC<FormFieldProps> = ({
  children,
  label,
  error,
  hint,
  required = false,
  disabled = false,
  className = ''
}) => {
  const fieldId = React.useId()
  
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label 
          htmlFor={fieldId}
          className={`block text-sm font-medium ${
            disabled 
              ? 'text-gray-400' 
              : error 
                ? 'text-red-700' 
                : 'text-gray-700'
          }`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
          id: fieldId,
          'aria-invalid': !!error,
          'aria-describedby': error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined,
          disabled,
        })}
      </div>
      
      {error && (
        <p 
          id={`${fieldId}-error`}
          className="text-sm text-red-600 flex items-center"
          role="alert"
        >
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      
      {hint && !error && (
        <p 
          id={`${fieldId}-hint`}
          className="text-sm text-gray-500"
        >
          {hint}
        </p>
      )}
    </div>
  )
}

export default FormField
