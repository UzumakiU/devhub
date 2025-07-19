'use client'

import React from 'react'
import { QuickActionsProps } from './types'
import { Button } from '../ui'

const QuickActions: React.FC<QuickActionsProps> = ({
  onViewLeads,
  onViewCustomers,
  onViewInteractions,
  onRefresh
}) => {
  return (
    <div className="bg-card shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-foreground mb-4">Quick Actions</h3>
      <div className="flex flex-wrap gap-3">
        <Button variant="primary" onClick={onViewLeads}>
          View All Leads
        </Button>
        <Button variant="success" onClick={onViewCustomers}>
          View All Customers
        </Button>
        <Button 
          variant="secondary" 
          onClick={onViewInteractions}
          leftIcon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          }
        >
          View Interactions
        </Button>
        <Button 
          variant="secondary" 
          onClick={onRefresh}
          leftIcon={
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          }
        >
          Refresh Data
        </Button>
      </div>
    </div>
  )
}

export default QuickActions
