'use client'

import { useState } from 'react'
import Layout from '@/components/Layout'

interface VaultAccessProps {
  error: string
  setError: (error: string) => void
  onAccessGranted: () => void
}

export default function VaultAccess({ error, setError, onAccessGranted }: VaultAccessProps) {
  const [vaultAccessCode, setVaultAccessCode] = useState('')
  const [vaultLoading, setVaultLoading] = useState(false)

  const verifyVaultAccess = async () => {
    setVaultLoading(true)
    setError('')
    
    try {
      // For now, accept any 4-digit code for testing
      if (vaultAccessCode.length === 4) {
        onAccessGranted()
      } else {
        setError('Please enter a 4-digit access code')
      }
    } catch {
      setError('Invalid access code')
    } finally {
      setVaultLoading(false)
    }
  }

  return (
    <Layout>
      <div className="max-w-md mx-auto py-16">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <div className="text-center mb-8">
            <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Vault Access</h2>
            <p className="text-gray-600">Enter the 4-digit access code to unlock the vault</p>
            <div className="mt-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                🔒 Founder Only
              </span>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
              <button
                onClick={() => setError('')}
                className="float-right text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Access Code
              </label>
              <input
                type="password"
                maxLength={4}
                value={vaultAccessCode}
                onChange={(e) => setVaultAccessCode(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && vaultAccessCode.length === 4) {
                    verifyVaultAccess()
                  }
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-center text-2xl font-mono tracking-widest"
                placeholder="••••"
                autoFocus
              />
            </div>

            <button
              onClick={verifyVaultAccess}
              disabled={vaultAccessCode.length !== 4 || vaultLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {vaultLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Verifying...
                </div>
              ) : (
                'Unlock Vault'
              )}
            </button>
          </div>

          <div className="mt-8 text-center">
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
              <div className="flex items-center justify-center">
                <svg className="h-5 w-5 text-yellow-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">This vault contains sensitive password recovery data</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
