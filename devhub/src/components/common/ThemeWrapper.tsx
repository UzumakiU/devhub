'use client'

import { ReactNode } from 'react'

interface ThemeWrapperProps {
  children: ReactNode
  className?: string
}

/**
 * A wrapper component that ensures all child elements respect the theme
 * This is useful for wrapping existing components that have hardcoded colors
 */
export default function ThemeWrapper({ children, className = '' }: ThemeWrapperProps) {
  return (
    <div className={`theme-wrapper ${className}`}>
      {children}
      <style jsx>{`
        .theme-wrapper :global(.bg-card) {
          background-color: var(--card) !important;
          color: var(--card-foreground) !important;
        }
        
        .theme-wrapper :global(.text-foreground) {
          color: var(--foreground) !important;
        }
        
        .theme-wrapper :global(.text-gray-700) {
          color: var(--card-foreground) !important;
        }
        
        .theme-wrapper :global(.text-gray-600),
        .theme-wrapper :global(.text-gray-500),
        .theme-wrapper :global(.text-gray-400) {
          color: var(--muted-foreground) !important;
        }
        
        .theme-wrapper :global(.border-border),
        .theme-wrapper :global(.border-border) {
          border-color: var(--border) !important;
        }
        
        .theme-wrapper :global(.bg-background),
        .theme-wrapper :global(.bg-gray-100) {
          background-color: var(--muted) !important;
        }
        
        .theme-wrapper :global(.bg-blue-600),
        .theme-wrapper :global(.bg-blue-700) {
          background-color: var(--primary) !important;
          color: var(--primary-foreground) !important;
        }
      `}</style>
    </div>
  )
}
