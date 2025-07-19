'use client'

import { useTheme } from '@/contexts/ThemeContext'
import { themeClasses, semanticColors } from '@/lib/theme'

/**
 * Hook that provides theme-aware utility functions and classes
 */
export function useThemeUtils() {
  const { theme } = useTheme()

  /**
   * Get theme-aware class names for common UI elements
   */
  const getThemeClasses = () => themeClasses

  /**
   * Get semantic color classes
   */
  const getSemanticColors = () => semanticColors

  /**
   * Get a theme-aware color value
   */
  const getThemeColor = (colorName: string) => {
    if (typeof window !== 'undefined') {
      return getComputedStyle(document.documentElement)
        .getPropertyValue(`--${colorName}`)
        .trim()
    }
    return ''
  }

  /**
   * Convert legacy color classes to theme-aware classes
   */
  const convertLegacyClasses = (className: string) => {
    return className
      .replace(/bg-white/g, 'bg-card')
      .replace(/text-gray-900/g, 'text-foreground')
      .replace(/text-gray-700/g, 'text-card-foreground')
      .replace(/text-gray-600/g, 'text-muted-foreground')
      .replace(/text-gray-500/g, 'text-muted-foreground')
      .replace(/text-gray-400/g, 'text-muted-foreground')
      .replace(/border-gray-200/g, 'border-border')
      .replace(/border-gray-300/g, 'border-border')
      .replace(/bg-gray-50/g, 'bg-muted')
      .replace(/bg-gray-100/g, 'bg-muted')
      .replace(/bg-blue-600/g, 'bg-primary')
      .replace(/bg-blue-700/g, 'bg-primary')
      .replace(/text-blue-600/g, 'text-primary')
      .replace(/text-green-600/g, 'text-stats-positive')
      .replace(/text-red-600/g, 'text-stats-negative')
  }

  /**
   * Get status color based on type
   */
  const getStatusColor = (type: 'success' | 'warning' | 'error' | 'info') => {
    return semanticColors[type]
  }

  /**
   * Get stats color based on change type
   */
  const getStatsColor = (changeType: 'positive' | 'negative' | 'neutral') => {
    switch (changeType) {
      case 'positive':
        return semanticColors.statsPositive
      case 'negative':
        return semanticColors.statsNegative
      case 'neutral':
        return semanticColors.statsNeutral
      default:
        return semanticColors.statsNeutral
    }
  }

  return {
    theme,
    getThemeClasses,
    getSemanticColors,
    getThemeColor,
    convertLegacyClasses,
    getStatusColor,
    getStatsColor,
  }
}
