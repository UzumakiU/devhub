'use client'

import React from 'react'
import { PipelineStageProps } from './types'

interface SalesPipelineProps {
  stages: { [key: string]: number }
}

const PipelineStage: React.FC<PipelineStageProps> = ({ stage, count }) => (
  <div className="text-center">
    <div className="bg-gray-100 rounded-lg p-3 mb-2">
      <p className="text-2xl font-bold text-foreground">{count}</p>
    </div>
    <p className="text-sm font-medium text-gray-600 capitalize">
      {stage.replace('_', ' ')}
    </p>
  </div>
)

const SalesPipeline: React.FC<SalesPipelineProps> = ({ stages }) => {
  return (
    <div className="bg-card shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-foreground mb-4">Sales Pipeline</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {Object.entries(stages).map(([stage, count]) => (
          <PipelineStage key={stage} stage={stage} count={count} />
        ))}
      </div>
    </div>
  )
}

export default SalesPipeline
