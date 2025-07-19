'use client'

import React, { useState } from 'react'

interface PipelineStage {
  id: string
  name: string
  probability: number
  count: number
  value: number
  leads: Array<{
    id: string
    name: string
    company: string
    value: number
    daysInStage: number
  }>
}

interface DragDropPipelineProps {
  stages: PipelineStage[]
  onStageChange: (leadId: string, fromStage: string, toStage: string) => void
}

export default function DragDropPipeline({ stages, onStageChange }: DragDropPipelineProps) {
  const [draggedLead, setDraggedLead] = useState<string | null>(null)
  const [draggedFromStage, setDraggedFromStage] = useState<string | null>(null)

  const handleDragStart = (e: React.DragEvent, leadId: string, stageId: string) => {
    setDraggedLead(leadId)
    setDraggedFromStage(stageId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, targetStageId: string) => {
    e.preventDefault()
    
    if (draggedLead && draggedFromStage && draggedFromStage !== targetStageId) {
      onStageChange(draggedLead, draggedFromStage, targetStageId)
    }
    
    setDraggedLead(null)
    setDraggedFromStage(null)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const defaultStages: PipelineStage[] = [
    {
      id: 'prospect',
      name: 'Prospect',
      probability: 10,
      count: 12,
      value: 180000,
      leads: [
        { id: '1', name: 'John Doe', company: 'TechCorp', value: 25000, daysInStage: 3 },
        { id: '2', name: 'Jane Smith', company: 'StartupXYZ', value: 15000, daysInStage: 7 }
      ]
    },
    {
      id: 'qualified',
      name: 'Qualified',
      probability: 25,
      count: 8,
      value: 320000,
      leads: [
        { id: '3', name: 'Mike Johnson', company: 'Enterprise Inc', value: 75000, daysInStage: 14 },
        { id: '4', name: 'Sarah Wilson', company: 'Growth Co', value: 45000, daysInStage: 5 }
      ]
    },
    {
      id: 'proposal',
      name: 'Proposal',
      probability: 50,
      count: 5,
      value: 275000,
      leads: [
        { id: '5', name: 'David Brown', company: 'BigCorp', value: 120000, daysInStage: 21 },
        { id: '6', name: 'Lisa Davis', company: 'MediumCorp', value: 65000, daysInStage: 12 }
      ]
    },
    {
      id: 'negotiation',
      name: 'Negotiation',
      probability: 75,
      count: 3,
      value: 195000,
      leads: [
        { id: '7', name: 'Chris Miller', company: 'FinanceCorp', value: 95000, daysInStage: 8 }
      ]
    },
    {
      id: 'closed_won',
      name: 'Closed Won',
      probability: 100,
      count: 2,
      value: 150000,
      leads: [
        { id: '8', name: 'Amy Taylor', company: 'SuccessCorp', value: 80000, daysInStage: 2 }
      ]
    }
  ]

  const pipelineData = stages.length > 0 ? stages : defaultStages

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Sales Pipeline</h3>
        <div className="text-sm text-gray-500">
          Total Value: {formatCurrency(pipelineData.reduce((sum, stage) => sum + stage.value, 0))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {pipelineData.map((stage) => (
          <div
            key={stage.id}
            className="bg-background rounded-lg p-4 min-h-96"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, stage.id)}
          >
            {/* Stage Header */}
            <div className="mb-4">
              <h4 className="font-medium text-foreground text-sm mb-1">
                {stage.name}
              </h4>
              <div className="text-xs text-gray-500 space-y-1">
                <div>{stage.count} leads</div>
                <div>{formatCurrency(stage.value)}</div>
                <div>{stage.probability}% probability</div>
              </div>
            </div>

            {/* Leads in Stage */}
            <div className="space-y-3">
              {stage.leads.map((lead) => (
                <div
                  key={lead.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, lead.id, stage.id)}
                  className={`bg-card rounded-lg p-3 border border-border cursor-move hover:shadow-md transition-shadow ${
                    draggedLead === lead.id ? 'opacity-50' : ''
                  }`}
                >
                  <div className="text-sm font-medium text-foreground mb-1">
                    {lead.name}
                  </div>
                  <div className="text-xs text-gray-500 mb-2">
                    {lead.company}
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-green-600">
                      {formatCurrency(lead.value)}
                    </span>
                    <span className="text-gray-400">
                      {lead.daysInStage}d
                    </span>
                  </div>
                  
                  {/* Progress indicator based on days in stage */}
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <div 
                        className={`h-1 rounded-full ${
                          lead.daysInStage > 30 ? 'bg-red-500' :
                          lead.daysInStage > 14 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(lead.daysInStage / 30 * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Lead Button */}
            <button className="w-full mt-3 p-2 border-2 border-dashed border-border rounded-lg text-gray-400 hover:border-gray-400 hover:text-gray-600 text-sm transition-colors">
              + Add Lead
            </button>
          </div>
        ))}
      </div>

      {/* Pipeline Summary */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Total Leads:</span>
            <span className="ml-2 font-medium">
              {pipelineData.reduce((sum, stage) => sum + stage.count, 0)}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Avg Deal Size:</span>
            <span className="ml-2 font-medium">
              {formatCurrency(
                pipelineData.reduce((sum, stage) => sum + stage.value, 0) /
                pipelineData.reduce((sum, stage) => sum + stage.count, 0)
              )}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Weighted Value:</span>
            <span className="ml-2 font-medium">
              {formatCurrency(
                pipelineData.reduce((sum, stage) => sum + (stage.value * stage.probability / 100), 0)
              )}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Conversion Rate:</span>
            <span className="ml-2 font-medium">
              {Math.round(
                (pipelineData.find(s => s.id === 'closed_won')?.count || 0) /
                pipelineData.reduce((sum, stage) => sum + stage.count, 0) * 100
              )}%
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
