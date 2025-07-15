'use client'

import { Lead } from './types'
import { getStageColor, getScoreColor, formatDate, formatCurrency } from './utils'

interface LeadCardProps {
  lead: Lead
  onConvert: (leadId: string) => void
  isConverting?: boolean
}

export default function LeadCard({ lead, onConvert, isConverting = false }: LeadCardProps) {
  const handleConvert = () => {
    if (window.confirm('Convert this lead to a customer?')) {
      onConvert(lead.system_id)
    }
  }

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-medium text-gray-900">{lead.name}</h4>
          <p className="text-sm text-gray-600">{lead.email}</p>
          {lead.company && (
            <p className="text-sm text-gray-600">{lead.company}</p>
          )}
        </div>
        <div className="text-right">
          <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getStageColor(lead.stage)}`}>
            {lead.stage.replace('_', ' ').toUpperCase()}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
        <div>
          <span className="text-gray-500">Score:</span>
          <span className={`ml-1 font-medium ${getScoreColor(lead.lead_score)}`}>
            {lead.lead_score}%
          </span>
        </div>
        <div>
          <span className="text-gray-500">Value:</span>
          <span className="ml-1 font-medium">
            {formatCurrency(lead.estimated_value)}
          </span>
        </div>
        <div>
          <span className="text-gray-500">Source:</span>
          <span className="ml-1">
            {lead.source.replace('_', ' ').toUpperCase()}
          </span>
        </div>
        <div>
          <span className="text-gray-500">Probability:</span>
          <span className="ml-1">{lead.probability}%</span>
        </div>
      </div>
      
      {lead.expected_close_date && (
        <div className="text-sm mb-3">
          <span className="text-gray-500">Expected Close:</span>
          <span className="ml-1">{formatDate(lead.expected_close_date)}</span>
        </div>
      )}
      
      <div className="text-sm mb-3">
        <span className="text-gray-500">Assigned to:</span>
        <span className="ml-1">{lead.assigned_to.name}</span>
      </div>
      
      {lead.last_contacted && (
        <div className="text-sm mb-3">
          <span className="text-gray-500">Last Contact:</span>
          <span className="ml-1">{formatDate(lead.last_contacted)}</span>
        </div>
      )}
      
      {!lead.converted_to_customer && lead.stage !== 'closed_lost' && (
        <button
          onClick={handleConvert}
          disabled={isConverting}
          className="w-full mt-3 px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isConverting ? 'Converting...' : 'Convert to Customer'}
        </button>
      )}
      
      {lead.converted_to_customer && (
        <div className="mt-3 px-3 py-1.5 bg-green-100 text-green-800 text-sm rounded text-center">
          ✓ Converted to Customer
        </div>
      )}
    </div>
  )
}
