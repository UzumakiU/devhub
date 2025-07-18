'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import useAuth from '@/hooks/useAuth'
import { LeadManagementProps, LeadFormData } from './leads/types'
import { LeadService } from './leads/LeadService'
import LeadForm from './leads/LeadForm'
import LeadFilters from './leads/LeadFilters'
import LeadList from './leads/LeadList'
import { Lead } from './leads/types'

export default function LeadManagement({ onBack }: LeadManagementProps) {
  const { token } = useAuth()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedStage, setSelectedStage] = useState<string>('')
  const [formLoading, setFormLoading] = useState(false)
  const [convertingLeadId, setConvertingLeadId] = useState<string>()

  const leadService = useMemo(() => 
    token ? new LeadService(token) : null, 
    [token]
  )

  const fetchLeads = useCallback(async () => {
    if (!leadService) return

    try {
      setLoading(true)
      setError('')
      const fetchedLeads = await leadService.fetchLeads(selectedStage || undefined)
      setLeads(fetchedLeads)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leads')
    } finally {
      setLoading(false)
    }
  }, [leadService, selectedStage])

  useEffect(() => {
    if (token) {
      fetchLeads()
    }
  }, [token, fetchLeads])

  const handleCreateLead = async (formData: LeadFormData) => {
    if (!leadService) throw new Error('Not authenticated')

    setFormLoading(true)
    try {
      await leadService.createLead(formData)
      setShowCreateForm(false)
      await fetchLeads()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create lead')
      throw err
    } finally {
      setFormLoading(false)
    }
  }

  const handleConvertLead = async (leadId: string) => {
    if (!leadService) return

    setConvertingLeadId(leadId)
    try {
      await leadService.convertLead(leadId)
      await fetchLeads()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to convert lead')
    } finally {
      setConvertingLeadId(undefined)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Lead Management</h2>
        <button 
          onClick={onBack} 
          className="text-gray-600 hover:text-gray-800 flex items-center"
        >
          ← Back to CRM
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="text-red-800 text-sm">{error}</div>
            <button
              onClick={() => setError('')}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <LeadFilters
          selectedStage={selectedStage}
          onStageChange={setSelectedStage}
          leadCount={leads.length}
        />
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Create Lead
        </button>
      </div>

      <LeadList
        leads={leads}
        onConvertLead={handleConvertLead}
        convertingLeadId={convertingLeadId}
        isLoading={loading}
      />

      <LeadForm
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSubmit={handleCreateLead}
        isLoading={formLoading}
      />
    </div>
  )
}
