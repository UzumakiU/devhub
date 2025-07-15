'use client'

import { useState } from 'react'
import Layout from '@/components/Layout'
import CRMDashboard from '@/components/CRMDashboard'
import LeadManagement from '@/components/LeadManagement'
import CustomerInteractions from '@/components/CustomerInteractions'
import CustomerList from '@/components/CustomerList'
import AllInteractions from '@/components/AllInteractions'

type CRMView = 'dashboard' | 'leads' | 'customers' | 'interactions'

export default function CRMPage() {
  const [currentView, setCurrentView] = useState<CRMView>('dashboard')
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('')

  const handleViewCustomers = () => {
    setCurrentView('customers')
  }

  const handleViewLeads = () => {
    setCurrentView('leads')
  }

  const handleViewInteractions = (customerId?: string) => {
    console.log('handleViewInteractions called with:', customerId, 'Type:', typeof customerId)
    if (customerId) {
      setSelectedCustomerId(customerId)
      setCurrentView('interactions')
    } else {
      // Show general interactions view for all customers
      setSelectedCustomerId('') // Clear any selected customer
      setCurrentView('interactions')
    }
  }

  const handleViewSpecificCustomer = (customerId: string) => {
    setSelectedCustomerId(customerId)
    setCurrentView('interactions')
  }

  const handleBackToDashboard = () => {
    setCurrentView('dashboard')
    setSelectedCustomerId('')
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <CRMDashboard
            onViewCustomers={handleViewCustomers}
            onViewLeads={handleViewLeads}
            onViewInteractions={handleViewInteractions}
          />
        )
      
      case 'leads':
        return (
          <LeadManagement
            onBack={handleBackToDashboard}
          />
        )
      
      case 'customers':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <button 
                  onClick={handleBackToDashboard} 
                  className="text-gray-600 hover:text-gray-800 mb-2"
                >
                  ← Back to CRM Dashboard
                </button>
                <h2 className="text-2xl font-bold">Customer Management</h2>
              </div>
            </div>
            <CustomerList onViewInteractions={handleViewInteractions} />
          </div>
        )
      
      case 'interactions':
        return selectedCustomerId ? (
          <CustomerInteractions
            customerId={selectedCustomerId}
            onBack={() => setCurrentView('customers')}
          />
        ) : (
          <AllInteractions
            onBack={() => setCurrentView('dashboard')}
            onViewCustomer={handleViewSpecificCustomer}
          />
        )
      
      default:
        return (
          <CRMDashboard
            onViewCustomers={handleViewCustomers}
            onViewLeads={handleViewLeads}
            onViewInteractions={handleViewInteractions}
          />
        )
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Navigation Breadcrumbs */}
        <div className="bg-white shadow rounded-lg px-6 py-3">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <button
                  onClick={handleBackToDashboard}
                  className={`inline-flex items-center text-sm font-medium ${
                    currentView === 'dashboard' 
                      ? 'text-blue-600' 
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                  </svg>
                  CRM Dashboard
                </button>
              </li>
              {currentView !== 'dashboard' && (
                <>
                  <li>
                    <div className="flex items-center">
                      <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                      </svg>
                      <span className="ml-1 text-sm font-medium text-gray-700 md:ml-2">
                        {currentView === 'leads' && 'Lead Management'}
                        {currentView === 'customers' && 'Customer Management'}
                        {currentView === 'interactions' && 'Customer Interactions'}
                      </span>
                    </div>
                  </li>
                </>
              )}
            </ol>
          </nav>
        </div>

        {/* Main Content */}
        {renderCurrentView()}

        {/* Quick Stats Footer (always visible) */}
        {currentView !== 'dashboard' && (
          <div className="bg-white shadow rounded-lg p-4">
            <div className="flex items-center justify-center space-x-8 text-sm text-gray-600">
              <button 
                onClick={handleViewCustomers}
                className="hover:text-blue-600 transition-colors"
              >
                👥 Customers
              </button>
              <button 
                onClick={handleViewLeads}
                className="hover:text-green-600 transition-colors"
              >
                🎯 Leads
              </button>
              <button 
                onClick={handleBackToDashboard}
                className="hover:text-purple-600 transition-colors"
              >
                📊 Analytics
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
