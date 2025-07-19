'use client'

import React from 'react'

export interface LoadingProps {
  variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton'
  size?: 'sm' | 'md' | 'lg'
  text?: string
  overlay?: boolean
  className?: string
}

export const Loading: React.FC<LoadingProps> = ({
  variant = 'spinner',
  size = 'md',
  text,
  overlay = false,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  const renderSpinner = () => (
    <div
      className={`animate-spin rounded-full border-2 border-border border-t-blue-600 ${sizeClasses[size]}`}
    />
  )

  const renderDots = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`bg-blue-600 rounded-full animate-pulse ${
            size === 'sm' ? 'w-2 h-2' : size === 'lg' ? 'w-4 h-4' : 'w-3 h-3'
          }`}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: '1.4s'
          }}
        />
      ))}
    </div>
  )

  const renderPulse = () => (
    <div
      className={`bg-blue-600 rounded-full animate-pulse ${sizeClasses[size]}`}
    />
  )

  const renderSkeleton = () => (
    <div className="animate-pulse space-y-3">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
    </div>
  )

  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return renderDots()
      case 'pulse':
        return renderPulse()
      case 'skeleton':
        return renderSkeleton()
      default:
        return renderSpinner()
    }
  }

  const content = (
    <div className={`flex flex-col items-center justify-center space-y-2 ${className}`}>
      {renderLoader()}
      {text && (
        <p className={`text-gray-600 ${textSizeClasses[size]}`}>
          {text}
        </p>
      )}
    </div>
  )

  if (overlay) {
    return (
      <div className="fixed inset-0 bg-card bg-opacity-75 flex items-center justify-center z-50">
        {content}
      </div>
    )
  }

  return content
}

export interface SkeletonProps {
  className?: string
  height?: string
  width?: string
  count?: number
  circle?: boolean
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  height = 'h-4',
  width = 'w-full',
  count = 1,
  circle = false
}) => {
  const items = Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      className={`
        animate-pulse bg-gray-200 
        ${circle ? 'rounded-full' : 'rounded'} 
        ${height} 
        ${width} 
        ${className}
      `}
    />
  ))

  return count > 1 ? (
    <div className="space-y-2">
      {items}
    </div>
  ) : (
    items[0]
  )
}

export interface LoadingOverlayProps {
  loading: boolean
  children: React.ReactNode
  text?: string
  variant?: LoadingProps['variant']
  size?: LoadingProps['size']
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  loading,
  children,
  text = 'Loading...',
  variant = 'spinner',
  size = 'md'
}) => {
  return (
    <div className="relative">
      {children}
      {loading && (
        <div className="absolute inset-0 bg-card bg-opacity-75 flex items-center justify-center">
          <Loading variant={variant} size={size} text={text} />
        </div>
      )}
    </div>
  )
}

export default Loading
