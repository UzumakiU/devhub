'use client'

import React from 'react'

export interface StackProps {
  children: React.ReactNode
  className?: string
  direction?: 'row' | 'column'
  spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  align?: 'start' | 'center' | 'end' | 'stretch'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
  wrap?: boolean
  divider?: React.ReactNode
}

export const Stack: React.FC<StackProps> = ({
  children,
  className = '',
  direction = 'column',
  spacing = 'md',
  align = 'stretch',
  justify = 'start',
  wrap = false,
  divider
}) => {
  const directionClasses = {
    row: 'flex-row',
    column: 'flex-col'
  }

  const spacingClasses = {
    none: direction === 'row' ? 'space-x-0' : 'space-y-0',
    xs: direction === 'row' ? 'space-x-1' : 'space-y-1',
    sm: direction === 'row' ? 'space-x-2' : 'space-y-2',
    md: direction === 'row' ? 'space-x-4' : 'space-y-4',
    lg: direction === 'row' ? 'space-x-6' : 'space-y-6',
    xl: direction === 'row' ? 'space-x-8' : 'space-y-8'
  }

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch'
  }

  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly'
  }

  const wrapClasses = wrap ? 'flex-wrap' : 'flex-nowrap'

  const childrenArray = React.Children.toArray(children)

  if (divider && childrenArray.length > 1) {
    const childrenWithDividers = childrenArray.reduce<React.ReactNode[]>((acc, child, index) => {
      acc.push(child)
      if (index < childrenArray.length - 1) {
        acc.push(
          <div key={`divider-${index}`} className="flex-shrink-0">
            {divider}
          </div>
        )
      }
      return acc
    }, [])

    return (
      <div 
        className={`
          flex 
          ${directionClasses[direction]} 
          ${alignClasses[align]} 
          ${justifyClasses[justify]}
          ${wrapClasses}
          ${className}
        `.trim()}
      >
        {childrenWithDividers}
      </div>
    )
  }

  return (
    <div 
      className={`
        flex 
        ${directionClasses[direction]} 
        ${spacingClasses[spacing]}
        ${alignClasses[align]} 
        ${justifyClasses[justify]}
        ${wrapClasses}
        ${className}
      `.trim()}
    >
      {children}
    </div>
  )
}

export interface SpacerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  direction?: 'horizontal' | 'vertical'
}

export const Spacer: React.FC<SpacerProps> = ({
  size = 'md',
  direction = 'vertical'
}) => {
  const sizeClasses = {
    xs: direction === 'horizontal' ? 'w-1' : 'h-1',
    sm: direction === 'horizontal' ? 'w-2' : 'h-2',
    md: direction === 'horizontal' ? 'w-4' : 'h-4',
    lg: direction === 'horizontal' ? 'w-6' : 'h-6',
    xl: direction === 'horizontal' ? 'w-8' : 'h-8'
  }

  return <div className={sizeClasses[size]} />
}

export default Stack
