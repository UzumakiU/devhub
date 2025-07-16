'use client'

import React from 'react'
import { LeadSourceProps } from './types'

interface LeadSourcesProps {
  sources: { [key: string]: number }
}

const LeadSourceItem: React.FC<LeadSourceProps> = ({ source, count }) => (
  <div className="text-center p-3 bg-gray-50 rounded-lg">
    <p className="text-xl font-bold text-gray-900">{count}</p>
    <p className="text-sm text-gray-600 capitalize">{source.replace('_', ' ')}</p>
  </div>
)

const LeadSources: React.FC<LeadSourcesProps> = ({ sources }) => {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Lead Sources</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(sources).map(([source, count]) => (
          <LeadSourceItem key={source} source={source} count={count} />
        ))}
      </div>
    </div>
  )
}

export default LeadSources
