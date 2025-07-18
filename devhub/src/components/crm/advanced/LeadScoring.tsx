'use client'

import React from 'react'
import { Lead } from '../../leads/types'

interface LeadScoringProps {
  lead: Lead
  onScoreUpdate?: (leadId: string, newScore: number) => void
}

interface ScoreFactors {
  engagement: number
  company_fit: number
  budget_confirmed: boolean
  decision_maker: boolean
  timeline_urgency: number
}

export default function LeadScoring({ lead, onScoreUpdate }: LeadScoringProps) {
  const calculateScore = (factors: ScoreFactors): number => {
    let score = 0
    
    // Engagement score (0-30)
    score += factors.engagement * 0.3
    
    // Company fit score (0-25)  
    score += factors.company_fit * 0.25
    
    // Budget confirmation bonus (0-20)
    if (factors.budget_confirmed) score += 20
    
    // Decision maker bonus (0-15)
    if (factors.decision_maker) score += 15
    
    // Timeline urgency (0-10)
    score += factors.timeline_urgency * 0.1
    
    return Math.min(Math.round(score), 100)
  }

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-yellow-600 bg-yellow-100'
    if (score >= 40) return 'text-orange-600 bg-orange-100'
    return 'text-red-600 bg-red-100'
  }

  const getScoreLabel = (score: number): string => {
    if (score >= 80) return 'Hot Lead'
    if (score >= 60) return 'Warm Lead'
    if (score >= 40) return 'Cold Lead'
    return 'Poor Fit'
  }

  const scoreBreakdown = {
    engagement: 75,
    company_fit: 85,
    budget_confirmed: true,
    decision_maker: false,
    timeline_urgency: 60
  }

  const currentScore = calculateScore(scoreBreakdown)

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Lead Scoring</h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(currentScore)}`}>
          {currentScore}% - {getScoreLabel(currentScore)}
        </div>
      </div>

      <div className="space-y-4">
        {/* Engagement Score */}
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Engagement Level</span>
          <div className="flex items-center space-x-2">
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${scoreBreakdown.engagement}%` }}
              ></div>
            </div>
            <span className="text-sm text-gray-600">{scoreBreakdown.engagement}%</span>
          </div>
        </div>

        {/* Company Fit */}
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Company Fit</span>
          <div className="flex items-center space-x-2">
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full" 
                style={{ width: `${scoreBreakdown.company_fit}%` }}
              ></div>
            </div>
            <span className="text-sm text-gray-600">{scoreBreakdown.company_fit}%</span>
          </div>
        </div>

        {/* Budget Confirmed */}
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Budget Confirmed</span>
          <div className="flex items-center space-x-2">
            {scoreBreakdown.budget_confirmed ? (
              <span className="text-green-600 text-sm">✓ Yes (+20pts)</span>
            ) : (
              <span className="text-red-600 text-sm">✗ No (0pts)</span>
            )}
          </div>
        </div>

        {/* Decision Maker */}
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Decision Maker</span>
          <div className="flex items-center space-x-2">
            {scoreBreakdown.decision_maker ? (
              <span className="text-green-600 text-sm">✓ Yes (+15pts)</span>
            ) : (
              <span className="text-red-600 text-sm">✗ No (0pts)</span>
            )}
          </div>
        </div>

        {/* Timeline Urgency */}
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Timeline Urgency</span>
          <div className="flex items-center space-x-2">
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full" 
                style={{ width: `${scoreBreakdown.timeline_urgency}%` }}
              ></div>
            </div>
            <span className="text-sm text-gray-600">{scoreBreakdown.timeline_urgency}%</span>
          </div>
        </div>
      </div>

      {/* Score History */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Score History</h4>
        <div className="text-xs text-gray-500 space-y-1">
          <div>Today: {currentScore}% (+5)</div>
          <div>Yesterday: {currentScore - 5}%</div>
          <div>7 days ago: {currentScore - 12}%</div>
        </div>
      </div>

      {/* Next Best Actions */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Recommended Actions</h4>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Confirm budget requirements in next call</li>
          <li>• Schedule meeting with decision maker</li>
          <li>• Send detailed proposal by end of week</li>
        </ul>
      </div>
    </div>
  )
}
