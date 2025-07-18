'use client'

import React from 'react'

export interface GridProps {
  children: React.ReactNode
  className?: string
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 12
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  rows?: 'auto' | number
  responsive?: {
    sm?: 1 | 2 | 3 | 4 | 5 | 6 | 12
    md?: 1 | 2 | 3 | 4 | 5 | 6 | 12
    lg?: 1 | 2 | 3 | 4 | 5 | 6 | 12
    xl?: 1 | 2 | 3 | 4 | 5 | 6 | 12
  }
}

export const Grid: React.FC<GridProps> = ({
  children,
  className = '',
  cols = 1,
  gap = 'md',
  rows = 'auto',
  responsive
}) => {
  const colsClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
    12: 'grid-cols-12'
  }

  const gapClasses = {
    none: 'gap-0',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8'
  }

  const rowsClasses = rows === 'auto' ? '' : `grid-rows-${rows}`

  const responsiveClasses = responsive ? [
    responsive.sm ? `sm:grid-cols-${responsive.sm}` : '',
    responsive.md ? `md:grid-cols-${responsive.md}` : '',
    responsive.lg ? `lg:grid-cols-${responsive.lg}` : '',
    responsive.xl ? `xl:grid-cols-${responsive.xl}` : ''
  ].filter(Boolean).join(' ') : ''

  return (
    <div 
      className={`
        grid 
        ${colsClasses[cols]} 
        ${gapClasses[gap]} 
        ${rowsClasses}
        ${responsiveClasses}
        ${className}
      `.trim()}
    >
      {children}
    </div>
  )
}

export interface GridItemProps {
  children: React.ReactNode
  className?: string
  colSpan?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  rowSpan?: 1 | 2 | 3 | 4 | 5 | 6
  colStart?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  colEnd?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13
}

export const GridItem: React.FC<GridItemProps> = ({
  children,
  className = '',
  colSpan,
  rowSpan,
  colStart,
  colEnd
}) => {
  const spanClasses = [
    colSpan ? `col-span-${colSpan}` : '',
    rowSpan ? `row-span-${rowSpan}` : '',
    colStart ? `col-start-${colStart}` : '',
    colEnd ? `col-end-${colEnd}` : ''
  ].filter(Boolean).join(' ')

  return (
    <div className={`${spanClasses} ${className}`.trim()}>
      {children}
    </div>
  )
}

export default Grid
