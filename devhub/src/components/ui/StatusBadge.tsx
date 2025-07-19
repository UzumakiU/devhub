import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  variant: 'prospect' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost' | 'success' | 'warning' | 'error' | 'info' | 'default'
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const variantStyles = {
  prospect: 'bg-gray-100 text-foreground border-border dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600',
  contacted: 'bg-blue-100 text-blue-900 border-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-700',
  qualified: 'bg-green-100 text-green-900 border-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-700',
  proposal: 'bg-yellow-100 text-yellow-900 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-200 dark:border-yellow-700',
  negotiation: 'bg-orange-100 text-orange-900 border-orange-200 dark:bg-orange-900/30 dark:text-orange-200 dark:border-orange-700',
  closed_won: 'bg-green-100 text-green-900 border-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-700',
  closed_lost: 'bg-red-100 text-red-900 border-red-200 dark:bg-red-900/30 dark:text-red-200 dark:border-red-700',
  success: 'bg-green-100 text-green-900 border-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-700',
  warning: 'bg-yellow-100 text-yellow-900 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-200 dark:border-yellow-700',
  error: 'bg-red-100 text-red-900 border-red-200 dark:bg-red-900/30 dark:text-red-200 dark:border-red-700',
  info: 'bg-blue-100 text-blue-900 border-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-700',
  default: 'bg-gray-100 text-foreground border-border dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600'
}

const sizeStyles = {
  sm: 'px-2 py-1 text-xs font-medium',
  md: 'px-3 py-1.5 text-sm font-medium',
  lg: 'px-4 py-2 text-base font-medium'
}

export default function StatusBadge({ variant, children, className, size = 'sm' }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border font-semibold tracking-wide',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  )
}
