'use client'

import { useState } from 'react'
import Layout from '@/components/Layout'
import CRMDashboardRefactored from '@/components/CRMDashboardRefactored'
import LeadManagementRefactored from '@/components/LeadManagementRefactored'
import CustomerInteractions from '@/components/CustomerInteractions'
import CustomerList from '@/components/CustomerList'
import { AllInteractionsRefactored } from '@/components/interactions/all'
import { 
  LeadScoring, 
  ActivityTimeline, 
  DragDropPipeline, 
  CRMAnalyticsDashboard 
} from '@/components/crm/advanced'

type CRMView = 'dashboard' | 'leads' | 'customers' | 'interactions' | 'analytics' | 'pipeline' | 'lead-detail'

export default function CRMPage() {
  const [currentView, setCurrentView] = useState<CRMView>('dashboard')
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('')
  const [selectedLeadId, setSelectedLeadId] = useState<string>('')

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

  const handleViewAnalytics = () => {
    setCurrentView('analytics')
  }

  const handleViewPipeline = () => {
    setCurrentView('pipeline')
  }

  const handleViewLeadDetail = (leadId: string) => {
    setSelectedLeadId(leadId)
    setCurrentView('lead-detail')
  }

  const handleBackToDashboard = () => {
    setCurrentView('dashboard')
    setSelectedCustomerId('')
    setSelectedLeadId('')
  }

  const handlePipelineStageChange = (leadId: string, fromStage: string, toStage: string) => {
    console.log(`Moving lead ${leadId} from ${fromStage} to ${toStage}`)
    // TODO: Implement API call to update lead stage
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <CRMDashboardRefactored
            onViewCustomers={handleViewCustomers}
            onViewLeads={handleViewLeads}
            onViewInteractions={handleViewInteractions}
          />
        )
      case 'leads':
        return <LeadManagementRefactored onBack={handleBackToDashboard} />
      case 'customers':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Customer Management</h2>
              <button 
                onClick={handleBackToDashboard} 
                className="text-gray-600 hover:text-gray-800 flex items-center"
              >
                ← Back to CRM
              </button>
            </div>
            <CustomerList onViewInteractions={handleViewSpecificCustomer} />
          </div>
        )
      case 'interactions':
        if (selectedCustomerId) {
          return (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Customer Interactions</h2>
                <button 
                  onClick={handleBackToDashboard} 
                  className="text-gray-600 hover:text-gray-800 flex items-center"
                >
                  ← Back to CRM
                </button>
              </div>
              <CustomerInteractions 
                customerId={selectedCustomerId} 
                onBack={handleBackToDashboard}
              />
            </div>
          )
        } else {
          return (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">All Interactions</h2>
                <button 
                  onClick={handleBackToDashboard} 
                  className="text-gray-600 hover:text-gray-800 flex items-center"
                >
                  ← Back to CRM
                </button>
              </div>
              <AllInteractionsRefactored 
                onBack={handleBackToDashboard}
                onViewCustomer={handleViewSpecificCustomer}
              />
            </div>
          )
        }
      case 'analytics':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <button 
                onClick={handleBackToDashboard} 
                className="text-gray-600 hover:text-gray-800 flex items-center"
              >
                ← Back to CRM
              </button>
            </div>
            <CRMAnalyticsDashboard />
          </div>
        )
      case 'pipeline':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Sales Pipeline</h2>
              <button 
                onClick={handleBackToDashboard} 
                className="text-gray-600 hover:text-gray-800 flex items-center"
              >
                ← Back to CRM
              </button>
            </div>
            <DragDropPipeline 
              stages={[]}
              onStageChange={handlePipelineStageChange}
            />
          </div>
        )
      case 'lead-detail':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Lead Details</h2>
              <button 
                onClick={handleBackToDashboard} 
                className="text-gray-600 hover:text-gray-800 flex items-center"
              >
                ← Back to CRM
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LeadScoring 
                lead={{
                  system_id: selectedLeadId,
                  name: 'John Doe',
                  email: 'john@example.com',
                  phone: '+1234567890',
                  company: 'TechCorp',
                  job_title: 'CTO',
                  source: 'website',
                  lead_score: 85,
                  qualification_status: 'qualified',
                  stage: 'proposal',
                  estimated_value: '75000',
                  probability: 80,
                  expected_close_date: '2024-03-15',
                  assigned_to: {
                    system_id: 'user-1',
                    name: 'Jane Smith'
                  },
                  converted_to_customer: false,
                  last_contacted: '2024-01-20',
                  created_at: '2024-01-01'
                }}
              />
              <ActivityTimeline leadId={selectedLeadId} />
            </div>
          </div>
        )
      default:
        return <CRMDashboardRefactored 
          onViewCustomers={handleViewCustomers}
          onViewLeads={handleViewLeads}
          onViewInteractions={handleViewInteractions}
        />
    }
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Enhanced Navigation */}
        {currentView === 'dashboard' && (
          <div className="bg-white shadow-sm border-b border-gray-200 mb-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-4">
                <h1 className="text-3xl font-bold text-gray-900">CRM Dashboard</h1>
                <div className="flex space-x-4">
                  <button
                    onClick={handleViewAnalytics}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Analytics
                  </button>
                  <button
                    onClick={handleViewPipeline}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                  >
                    Pipeline
                  </button>
                  <button
                    onClick={handleViewLeads}
                    className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
                  >
                    Leads
                  </button>
                  <button
                    onClick={handleViewCustomers}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    Customers
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {renderCurrentView()}
        </div>
      </div>
    </Layout>
  )
}
