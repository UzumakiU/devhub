'use client'

interface StatsCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon?: React.ReactNode
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'secondary'
}

export default function StatsCard({ 
  title, 
  value, 
  change, 
  changeType = 'neutral',
  icon,
  color = 'primary'
}: StatsCardProps) {
  // Use semantic color classes that automatically adapt to theme
  const colorClasses = {
    primary: 'bg-primary text-primary-foreground',
    success: 'bg-success text-success-foreground',
    warning: 'bg-warning text-warning-foreground',
    error: 'bg-error text-error-foreground',
    info: 'bg-info text-info-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
  }

  const changeClasses = {
    positive: 'text-stats-positive',
    negative: 'text-stats-negative',
    neutral: 'text-stats-neutral'
  }

  return (
    <div className="bg-card overflow-hidden shadow-lg rounded-lg border border-border">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`w-8 h-8 ${colorClasses[color]} rounded-md flex items-center justify-center`}>
              {icon || <span className="text-sm font-semibold">{title.charAt(0)}</span>}
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-muted-foreground truncate">{title}</dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-foreground">{value}</div>
                {change && (
                  <div className={`ml-2 flex items-baseline text-sm font-semibold ${changeClasses[changeType]}`}>
                    {changeType === 'positive' && (
                      <svg className="self-center flex-shrink-0 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    {changeType === 'negative' && (
                      <svg className="self-center flex-shrink-0 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    <span className="sr-only">
                      {changeType === 'positive' ? 'Increased' : 'Decreased'} by
                    </span>
                    {change}
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}
