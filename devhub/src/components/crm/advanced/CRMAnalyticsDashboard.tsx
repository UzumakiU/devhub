'use client'

import React, { useState, useEffect } from 'react'

interface CRMAnalyticsData {
  revenue: {
    monthly: number[]
    quarterly: number[]
    labels: string[]
  }
  conversion: {
    funnel: Array<{ stage: string; count: number; percentage: number }>
    trends: Array<{ month: string; rate: number }>
  }
  performance: {
    topPerformers: Array<{ name: string; deals: number; revenue: number }>
    leadSources: Array<{ source: string; count: number; quality: number }>
  }
  forecasting: {
    thisMonth: number
    nextMonth: number
    thisQuarter: number
    confidence: number
  }
}

export default function CRMAnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState<'revenue' | 'conversion' | 'performance' | 'forecasting'>('revenue')
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')

  const [analyticsData] = useState<CRMAnalyticsData>({
    revenue: {
      monthly: [45000, 52000, 48000, 61000, 58000, 67000],
      quarterly: [145000, 172000, 185000, 203000],
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    },
    conversion: {
      funnel: [
        { stage: 'Prospects', count: 1250, percentage: 100 },
        { stage: 'Qualified', count: 315, percentage: 25.2 },
        { stage: 'Proposal', count: 95, percentage: 7.6 },
        { stage: 'Negotiation', count: 38, percentage: 3.0 },
        { stage: 'Closed Won', count: 18, percentage: 1.4 }
      ],
      trends: [
        { month: 'Jan', rate: 1.2 },
        { month: 'Feb', rate: 1.5 },
        { month: 'Mar', rate: 1.8 },
        { month: 'Apr', rate: 1.4 },
        { month: 'May', rate: 2.1 },
        { month: 'Jun', rate: 2.3 }
      ]
    },
    performance: {
      topPerformers: [
        { name: 'Jane Smith', deals: 12, revenue: 145000 },
        { name: 'Mike Johnson', deals: 8, revenue: 98000 },
        { name: 'Sarah Wilson', deals: 6, revenue: 87000 }
      ],
      leadSources: [
        { source: 'Website', count: 345, quality: 85 },
        { source: 'Referrals', count: 156, quality: 92 },
        { source: 'Cold Calls', count: 89, quality: 45 },
        { source: 'Social Media', count: 234, quality: 68 }
      ]
    },
    forecasting: {
      thisMonth: 58000,
      nextMonth: 62000,
      thisQuarter: 185000,
      confidence: 78
    }
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  const renderRevenueTab = () => (
    <div className="space-y-6">
      {/* Revenue Chart Placeholder */}
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <div className="text-4xl font-bold text-blue-600 mb-2">
          {formatCurrency(analyticsData.revenue.monthly.reduce((a, b) => a + b, 0))}
        </div>
        <div className="text-gray-600">Total Revenue (6 months)</div>
        
        {/* Simple Bar Chart */}
        <div className="mt-6 flex items-end justify-center space-x-2">
          {analyticsData.revenue.monthly.map((value, index) => (
            <div key={index} className="flex flex-col items-center">
              <div 
                className="bg-blue-500 rounded-t"
                style={{ 
                  height: `${(value / Math.max(...analyticsData.revenue.monthly)) * 120}px`,
                  width: '40px'
                }}
              ></div>
              <div className="text-xs text-gray-600 mt-2">
                {analyticsData.revenue.labels[index]}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(analyticsData.revenue.monthly[analyticsData.revenue.monthly.length - 1])}
          </div>
          <div className="text-sm text-gray-600">This Month</div>
          <div className="text-xs text-green-600 mt-1">+12% vs last month</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(analyticsData.revenue.quarterly[analyticsData.revenue.quarterly.length - 1])}
          </div>
          <div className="text-sm text-gray-600">This Quarter</div>
          <div className="text-xs text-green-600 mt-1">+8% vs last quarter</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(Math.round(analyticsData.revenue.monthly.reduce((a, b) => a + b, 0) / 6))}
          </div>
          <div className="text-sm text-gray-600">Avg Monthly</div>
          <div className="text-xs text-green-600 mt-1">+5% trending up</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(analyticsData.forecasting.nextMonth)}
          </div>
          <div className="text-sm text-gray-600">Forecast Next</div>
          <div className="text-xs text-blue-600 mt-1">{analyticsData.forecasting.confidence}% confidence</div>
        </div>
      </div>
    </div>
  )

  const renderConversionTab = () => (
    <div className="space-y-6">
      {/* Conversion Funnel */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold mb-4">Conversion Funnel</h4>
        <div className="space-y-3">
          {analyticsData.conversion.funnel.map((stage, index) => (
            <div key={stage.stage} className="flex items-center">
              <div className="w-24 text-sm font-medium text-gray-700">
                {stage.stage}
              </div>
              <div className="flex-1 mx-4">
                <div className="bg-gray-200 rounded-full h-4">
                  <div 
                    className="bg-blue-500 h-4 rounded-full flex items-center justify-end pr-2"
                    style={{ width: `${stage.percentage}%` }}
                  >
                    <span className="text-xs text-white font-medium">
                      {formatPercentage(stage.percentage)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="w-16 text-sm text-gray-600 text-right">
                {stage.count}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Conversion Trends */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold mb-4">Monthly Conversion Rate</h4>
        <div className="flex items-end space-x-4">
          {analyticsData.conversion.trends.map((trend, index) => (
            <div key={trend.month} className="flex flex-col items-center">
              <div 
                className="bg-green-500 rounded-t"
                style={{ 
                  height: `${trend.rate * 30}px`,
                  width: '30px'
                }}
              ></div>
              <div className="text-xs text-gray-600 mt-2">{trend.month}</div>
              <div className="text-xs font-medium">{formatPercentage(trend.rate)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderPerformanceTab = () => (
    <div className="space-y-6">
      {/* Top Performers */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold mb-4">Top Performers</h4>
        <div className="space-y-3">
          {analyticsData.performance.topPerformers.map((performer, index) => (
            <div key={performer.name} className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600 mr-3">
                  {index + 1}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{performer.name}</div>
                  <div className="text-sm text-gray-600">{performer.deals} deals closed</div>
                </div>
              </div>
              <div className="text-lg font-semibold text-green-600">
                {formatCurrency(performer.revenue)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lead Sources */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold mb-4">Lead Source Performance</h4>
        <div className="space-y-3">
          {analyticsData.performance.leadSources.map((source) => (
            <div key={source.source} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="font-medium text-gray-900">{source.source}</span>
                  <span className="text-sm text-gray-600">{source.count} leads</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full"
                    style={{ width: `${source.quality}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  Quality Score: {source.quality}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderForecastingTab = () => (
    <div className="space-y-6">
      {/* Forecast Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {formatCurrency(analyticsData.forecasting.thisMonth)}
          </div>
          <div className="text-gray-600">This Month Forecast</div>
          <div className="text-sm text-green-600 mt-2">On track to exceed target</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {formatCurrency(analyticsData.forecasting.nextMonth)}
          </div>
          <div className="text-gray-600">Next Month Projection</div>
          <div className="text-sm text-blue-600 mt-2">+7% growth expected</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {formatCurrency(analyticsData.forecasting.thisQuarter)}
          </div>
          <div className="text-gray-600">Quarter Target</div>
          <div className="text-sm text-orange-600 mt-2">85% achieved so far</div>
        </div>
      </div>

      {/* Confidence Indicators */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold mb-4">Forecast Confidence</h4>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Overall Confidence</span>
              <span className="text-sm text-gray-600">{analyticsData.forecasting.confidence}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-green-500 h-3 rounded-full"
                style={{ width: `${analyticsData.forecasting.confidence}%` }}
              ></div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <h5 className="font-medium text-green-800 mb-2">Positive Indicators</h5>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Strong pipeline value ($320K)</li>
                <li>• High conversion rate trending up</li>
                <li>• Key deals in negotiation stage</li>
              </ul>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h5 className="font-medium text-yellow-800 mb-2">Risk Factors</h5>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• 3 large deals at risk</li>
                <li>• Extended sales cycles</li>
                <li>• Market seasonality</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">CRM Analytics</h2>
        <div className="flex items-center space-x-4">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'revenue', label: 'Revenue' },
            { id: 'conversion', label: 'Conversion' },
            { id: 'performance', label: 'Performance' },
            { id: 'forecasting', label: 'Forecasting' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'revenue' && renderRevenueTab()}
        {activeTab === 'conversion' && renderConversionTab()}
        {activeTab === 'performance' && renderPerformanceTab()}
        {activeTab === 'forecasting' && renderForecastingTab()}
      </div>
    </div>
  )
}
