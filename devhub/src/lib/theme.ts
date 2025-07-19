/**
 * Centralized theme configuration
 * Change colors here to update the entire application theme
 */

export const themeConfig = {
  light: {
    background: '#ffffff',
    foreground: '#171717',
    card: '#ffffff',
    cardForeground: '#171717',
    primary: '#0369a1',
    primaryForeground: '#ffffff',
    secondary: '#f1f5f9',
    secondaryForeground: '#0f172a',
    muted: '#f1f5f9',
    mutedForeground: '#64748b',
    accent: '#f1f5f9',
    accentForeground: '#0f172a',
    border: '#e2e8f0',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    statsPositive: '#22c55e',
    statsNegative: '#ef4444',
    statsNeutral: '#64748b',
  },
  dark: {
    background: '#0a0a0a',
    foreground: '#f8fafc',
    card: '#111827',
    cardForeground: '#f8fafc',
    primary: '#0891b2',
    primaryForeground: '#f8fafc',
    secondary: '#1e293b',
    secondaryForeground: '#f8fafc',
    muted: '#1e293b',
    mutedForeground: '#94a3b8',
    accent: '#22d3ee',
    accentForeground: '#0a0a0a',
    border: '#22d3ee',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#06b6d4',
    statsPositive: '#10b981',
    statsNegative: '#ef4444',
    statsNeutral: '#94a3b8',
  }
}

/**
 * Apply theme to CSS custom properties
 */
export function applyTheme(theme: 'light' | 'dark') {
  const config = themeConfig[theme]
  const root = document.documentElement

  Object.entries(config).forEach(([key, value]) => {
    const cssVarName = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`
    root.style.setProperty(cssVarName, value)
  })
}

/**
 * Get semantic color classes that automatically adapt to theme
 */
export const semanticColors = {
  // Status colors
  success: 'bg-success text-success-foreground',
  warning: 'bg-warning text-warning-foreground',
  error: 'bg-error text-error-foreground',
  info: 'bg-info text-info-foreground',
  
  // UI colors
  primary: 'bg-primary text-primary-foreground',
  secondary: 'bg-secondary text-secondary-foreground',
  muted: 'bg-muted text-muted-foreground',
  accent: 'bg-accent text-accent-foreground',
  
  // Card colors
  card: 'bg-card text-card-foreground border-border',
  
  // Text colors
  foreground: 'text-foreground',
  mutedForeground: 'text-muted-foreground',
  
  // Stats colors
  statsPositive: 'text-stats-positive',
  statsNegative: 'text-stats-negative',
  statsNeutral: 'text-stats-neutral',
}

/**
 * Theme-aware component classes
 */
export const themeClasses = {
  card: 'bg-card text-card-foreground border border-border shadow-lg rounded-lg',
  button: {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    success: 'bg-success text-success-foreground hover:bg-success/90',
    warning: 'bg-warning text-warning-foreground hover:bg-warning/90',
    error: 'bg-error text-error-foreground hover:bg-error/90',
  },
  input: 'bg-input border border-border text-foreground focus:ring-primary focus:border-primary',
  table: {
    wrapper: 'bg-card border border-border rounded-lg overflow-hidden',
    header: 'bg-muted text-muted-foreground',
    cell: 'text-card-foreground border-border',
    row: 'hover:bg-muted/50',
  }
}
