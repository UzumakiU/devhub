'use client'

import React from 'react'

export interface ContainerProps {
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  centerContent?: boolean
}

export const Container: React.FC<ContainerProps> = ({
  children,
  className = '',
  size = 'lg',
  padding = 'md',
  centerContent = false
}) => {
  const sizeClasses = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-none'
  }

  const paddingClasses = {
    none: '',
    sm: 'px-4 py-2',
    md: 'px-6 py-4',
    lg: 'px-8 py-6'
  }

  const centerClasses = centerContent ? 'mx-auto' : ''

  return (
    <div 
      className={`
        ${sizeClasses[size]} 
        ${paddingClasses[padding]} 
        ${centerClasses} 
        ${className}
      `.trim()}
    >
      {children}
    </div>
  )
}

export default Container
