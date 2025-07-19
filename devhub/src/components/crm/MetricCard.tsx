'use client'

import React from 'react'
import { MetricCardProps } from './types'

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  onClick,
  color = 'blue'
}) => {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-100',
      text: 'text-blue-600',
      hover: 'hover:shadow-lg'
    },
    green: {
      bg: 'bg-green-100',
      text: 'text-green-600',
      hover: 'hover:shadow-lg'
    },
    purple: {
      bg: 'bg-purple-100',
      text: 'text-purple-600',
      hover: 'hover:shadow-lg'
    },
    gray: {
      bg: 'bg-gray-100',
      text: 'text-gray-600',
      hover: 'hover:shadow-lg'
    }
  }

  const cardClasses = onClick 
    ? `bg-card shadow rounded-lg p-6 cursor-pointer transition-shadow ${colorClasses[color].hover}`
    : 'bg-card shadow rounded-lg p-6'

  return (
    <div className={cardClasses} onClick={onClick}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
          {subtitle && (
            <p className={`text-sm ${colorClasses[color].text}`}>{subtitle}</p>
          )}
        </div>
        <div className={`h-12 w-12 ${colorClasses[color].bg} rounded-lg flex items-center justify-center`}>
          <div className={`h-6 w-6 ${colorClasses[color].text}`}>
            {icon}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MetricCard
