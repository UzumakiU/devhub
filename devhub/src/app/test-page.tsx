'use client'

import { useState, useEffect } from 'react'

interface BackendStatus {
  status: string
  tenant_id: string
  port: number
  [key: string]: unknown
}

export default function Home() {
  const [backendStatus, setBackendStatus] = useState<BackendStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Configuration from environment variables
  const config = {
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8005',
    tenantId: process.env.NEXT_PUBLIC_TENANT_ID || 'your_business',
    tenantName: process.env.NEXT_PUBLIC_TENANT_NAME || 'Your Business',
  }

  useEffect(() => {
    const testBackendConnection = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${config.apiUrl}/api/health`)
        
        if (response.ok) {
          const data = await response.json()
          setBackendStatus(data)
        } else {
          setError(`Backend responded with status: ${response.status}`)
        }
      } catch (error) {
        console.error('Backend connection error:', error)
        setError('Cannot connect to backend. Is it running on port 8005?')
      } finally {
        setLoading(false)
      }
    }

    testBackendConnection()
  }, [config.apiUrl])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🚀 DevHub Platform
          </h1>
          <p className="text-xl text-gray-600">
            {config.tenantName} - Business Management Hub
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Single-Tenant Smart Architecture
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Frontend Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              ✅ Frontend Status
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Framework:</span>
                <span className="font-medium">Next.js 15 + React 19</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">TypeScript:</span>
                <span className="font-medium">✅ Enabled</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tailwind CSS:</span>
                <span className="font-medium">✅ Enabled</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Port:</span>
                <span className="font-medium">3005</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tenant ID:</span>
                <span className="font-medium">{config.tenantId}</span>
              </div>
            </div>
          </div>

          {/* Backend Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              {loading ? '⏳' : backendStatus ? '✅' : '❌'} Backend Status
            </h2>
            
            {loading && (
              <p className="text-gray-600">Testing connection...</p>
            )}
            
            {error && (
              <div className="text-red-600 space-y-2">
                <p>❌ {error}</p>
                <p className="text-sm">
                  Start backend with: <code className="bg-gray-100 px-2 py-1 rounded">poetry run uvicorn src.devhub_api.main:app --host 0.0.0.0 --port 8005 --reload</code>
                </p>
              </div>
            )}
            
            {backendStatus && (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium text-green-600">{backendStatus.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tenant ID:</span>
                  <span className="font-medium">{backendStatus.tenant_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Database:</span>
                  <span className="font-medium">{backendStatus.database_configured ? '✅ Configured' : '❌ Not configured'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Redis:</span>
                  <span className="font-medium">{backendStatus.redis_configured ? '✅ Configured' : '❌ Not configured'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Port:</span>
                  <span className="font-medium">{backendStatus.port}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Configuration Display */}
        <div className="mt-8 bg-gray-100 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            📋 Current Configuration
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Frontend URL:</strong> http://localhost:3005
            </div>
            <div>
              <strong>Backend URL:</strong> {config.apiUrl}
            </div>
            <div>
              <strong>Tenant ID:</strong> {config.tenantId}
            </div>
            <div>
              <strong>Business Name:</strong> {config.tenantName}
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-blue-800 mb-4">
            🎯 Next Steps
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-700">
            <li>Verify both frontend and backend are running</li>
            <li>Test API endpoints</li>
            <li>Set up PostgreSQL database</li>
            <li>Create database schema with tenant-aware tables</li>
            <li>Implement authentication system</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
