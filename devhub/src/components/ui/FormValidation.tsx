'use client'

import React from 'react'

export interface ValidationRule {
  required?: boolean | string
  minLength?: { value: number; message: string }
  maxLength?: { value: number; message: string }
  pattern?: { value: RegExp; message: string }
  validate?: (value: unknown) => string | boolean
}

export interface FormValidationProps {
  rules?: ValidationRule
  value?: unknown
  onValidation?: (isValid: boolean, error?: string) => void
}

export const useFormValidation = (rules?: ValidationRule) => {
  const validate = React.useCallback((value: unknown): string | null => {
    if (!rules) return null

    // Required validation
    if (rules.required) {
      const isEmpty = value === undefined || value === null || value === '' || 
                     (Array.isArray(value) && value.length === 0)
      if (isEmpty) {
        return typeof rules.required === 'string' ? rules.required : 'This field is required'
      }
    }

    // Skip other validations if value is empty and not required
    const isEmpty = value === undefined || value === null || value === ''
    if (isEmpty) return null

    // Min length validation
    if (rules.minLength && typeof value === 'string' && value.length < rules.minLength.value) {
      return rules.minLength.message
    }

    // Max length validation
    if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength.value) {
      return rules.maxLength.message
    }

    // Pattern validation
    if (rules.pattern && typeof value === 'string' && !rules.pattern.value.test(value)) {
      return rules.pattern.message
    }

    // Custom validation
    if (rules.validate) {
      const result = rules.validate(value)
      if (typeof result === 'string') {
        return result
      }
      if (result === false) {
        return 'Validation failed'
      }
    }

    return null
  }, [rules])

  return { validate }
}

export interface FormValidationDisplayProps {
  errors: Record<string, string>
  touched: Record<string, boolean>
  className?: string
}

export const FormValidationDisplay: React.FC<FormValidationDisplayProps> = ({
  errors,
  touched,
  className = ''
}) => {
  const visibleErrors = Object.entries(errors).filter(([field]) => touched[field])
  
  if (visibleErrors.length === 0) return null

  return (
    <div className={`bg-red-50 border border-red-200 rounded-md p-4 ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">
            Please fix the following errors:
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <ul className="list-disc list-inside space-y-1">
              {visibleErrors.map(([field, error]) => (
                <li key={field}>{error}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

// Common validation rules
export const validationRules = {
  email: {
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: 'Please enter a valid email address'
    }
  },
  phone: {
    pattern: {
      value: /^[\+]?[1-9][\d]{0,15}$/,
      message: 'Please enter a valid phone number'
    }
  },
  url: {
    pattern: {
      value: /^https?:\/\/.+/,
      message: 'Please enter a valid URL'
    }
  },
  required: {
    required: 'This field is required'
  },
  password: {
    minLength: {
      value: 8,
      message: 'Password must be at least 8 characters'
    },
    pattern: {
      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    }
  }
}

export default FormValidationDisplay
