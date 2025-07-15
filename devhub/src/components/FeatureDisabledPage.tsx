import Layout from '@/components/Layout'
import { featureFlags } from '@/lib/config'

interface FeatureDisabledPageProps {
  moduleName: string
  description?: string
  estimatedCompletion?: string
}

export default function FeatureDisabledPage({ 
  moduleName, 
  description,
  estimatedCompletion 
}: FeatureDisabledPageProps) {
  return (
    <Layout>
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8 border border-blue-200">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H7m2 0v-4a2 2 0 012-2h2a2 2 0 012 2v4" />
              </svg>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {moduleName} Module
          </h1>
          
          <p className="text-lg text-gray-600 mb-6">
            This module is temporarily disabled while we focus on perfecting the CRM system.
          </p>
          
          {description && (
            <p className="text-sm text-gray-500 mb-4">
              {description}
            </p>
          )}
          
          <div className="bg-white rounded-md p-4 border border-blue-100">
            <h3 className="font-semibold text-gray-800 mb-2">Currently Available:</h3>
            <div className="flex flex-wrap gap-2 justify-center">
              {featureFlags.crm && (
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                  ✅ CRM System
                </span>
              )}
              {featureFlags.dashboard && (
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                  ✅ Dashboard
                </span>
              )}
              {featureFlags.database && (
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                  ✅ Database Management
                </span>
              )}
              {featureFlags.admin && (
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                  ✅ Admin Panel
                </span>
              )}
            </div>
          </div>
          
          {estimatedCompletion && (
            <p className="text-xs text-gray-400 mt-4">
              Estimated availability: {estimatedCompletion}
            </p>
          )}
          
          <div className="mt-6 space-x-4">
            <a
              href="/crm"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Go to CRM
            </a>
            <a
              href="/dashboard"
              className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Go to Dashboard
            </a>
          </div>
        </div>
      </div>
    </Layout>
  )
}
