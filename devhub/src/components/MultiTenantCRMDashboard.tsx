'use client'

import { useState } from 'react'
import MultiTenantCRMOverview from './MultiTenantCRMOverview'
import MultiTenantCustomerList from './MultiTenantCustomerList'
import MultiTenantLeadManagement from './MultiTenantLeadManagement'
import MultiTenantCustomerInteractions from './MultiTenantCustomerInteractions'

type ViewType = 'overview' | 'customers' | 'leads' | 'interactions'

export default function MultiTenantCRMDashboard() {
  const [currentView, setCurrentView] = useState<ViewType>('overview')
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)

  const handleNavigate = (view: ViewType, customerId?: string) => {
    setCurrentView(view)
    if (customerId) {
      setSelectedCustomerId(customerId)
    }
  }

  const handleBack = () => {
    setCurrentView('overview')
    setSelectedCustomerId(null)
  }

  const handleViewCustomers = () => {
    setCurrentView('customers')
  }

  const handleViewLeads = () => {
    setCurrentView('leads')
  }

  const handleViewInteractions = (customerId: string) => {
    setSelectedCustomerId(customerId)
    setCurrentView('interactions')
  }

  const renderView = () => {
    switch (currentView) {
      case 'overview':
        return (
          <MultiTenantCRMOverview
            onViewCustomers={handleViewCustomers}
            onViewLeads={handleViewLeads}
          />
        )
      case 'customers':
        return (
          <MultiTenantCustomerList
            onBack={handleBack}
            onViewInteractions={handleViewInteractions}
          />
        )
      case 'leads':
        return (
          <MultiTenantLeadManagement
            onBack={handleBack}
          />
        )
      case 'interactions':
        return selectedCustomerId ? (
          <MultiTenantCustomerInteractions
            customerId={selectedCustomerId}
            onBack={() => setCurrentView('customers')}
          />
        ) : (
          <div>No customer selected</div>
        )
      default:
        return (
          <MultiTenantCRMOverview
            onViewCustomers={handleViewCustomers}
            onViewLeads={handleViewLeads}
          />
        )
    }
  }

  return (
    <div className="min-h-screen w-full bg-background">
      {renderView()}
    </div>
  )
}
