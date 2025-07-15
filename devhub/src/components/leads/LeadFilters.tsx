'use client'

import { LEAD_STAGES } from './types'

interface LeadFiltersProps {
  selectedStage: string
  onStageChange: (stage: string) => void
  leadCount: number
}

export default function LeadFilters({ selectedStage, onStageChange, leadCount }: LeadFiltersProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Leads</h3>
          <p className="text-sm text-gray-600">
            {leadCount} {leadCount === 1 ? 'lead' : 'leads'} found
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div>
            <label htmlFor="stage-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Stage
            </label>
            <select
              id="stage-filter"
              value={selectedStage}
              onChange={(e) => onStageChange(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {LEAD_STAGES.map((stage) => (
                <option key={stage.value} value={stage.value}>
                  {stage.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
