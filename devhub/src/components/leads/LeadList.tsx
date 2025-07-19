'use client'

import { Lead } from './types'
import LeadCard from './LeadCard'

interface LeadListProps {
  leads: Lead[]
  onConvertLead: (leadId: string) => void
  convertingLeadId?: string
  isLoading: boolean
}

export default function LeadList({ leads, onConvertLead, convertingLeadId, isLoading }: LeadListProps) {
  if (isLoading) {
    return (
      <div className="bg-card shadow rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (leads.length === 0) {
    return (
      <div className="bg-card shadow rounded-lg p-8 text-center">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">No leads found</h3>
        <p className="text-gray-600">
          There are no leads matching your current filters. Try adjusting your search criteria or create a new lead.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-card shadow rounded-lg p-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {leads.map((lead) => (
          <LeadCard
            key={lead.system_id}
            lead={lead}
            onConvert={onConvertLead}
            isConverting={convertingLeadId === lead.system_id}
          />
        ))}
      </div>
    </div>
  )
}
