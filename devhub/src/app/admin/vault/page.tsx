'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import useAuth from '@/hooks/useAuth'
import Layout from '@/components/Layout'

interface VaultEntry {
  vault_id: number
  user_id: string
  user_email: string
  user_name: string
  has_password: boolean
  created_at: string
  access_code_hint: string
}

interface PasswordDetails {
  user_id: string
  user_email: string
  user_name: string
  original_password: string
  created_at: string
}

export default function PasswordVaultPage() {
  const { user, token, isLoading, logout, isAuthenticated, isFounder } = useAuth()
  const [vaultEntries, setVaultEntries] = useState<VaultEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  
  // Vault access control
  const [isVaultUnlocked, setIsVaultUnlocked] = useState(false)
  const [vaultAccessCode, setVaultAccessCode] = useState('')
  const [vaultLoading, setVaultLoading] = useState(false)
  
  // Modal states
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState('')
  const [accessCode, setAccessCode] = useState('')
  const [passwordDetails, setPasswordDetails] = useState<PasswordDetails | null>(null)
  
  // Save password states
  const [saveUserId, setSaveUserId] = useState('')
  const [savePassword, setSavePassword] = useState('')
  const [saveAccessCode, setSaveAccessCode] = useState('1212')
  
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated()) {
      router.push('/auth/login')
    } else if (!isLoading && !isFounder()) {
      router.push('/dashboard')
    }
  }, [isLoading, isAuthenticated, isFounder, router])

  const fetchVaultEntries = async () => {
    try {
      const response = await fetch('http://localhost:8005/api/admin/vault/list', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch vault entries')
      }

      const data = await response.json()
      setVaultEntries(data.vault_entries)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch vault entries')
    } finally {
      setLoading(false)
    }
  }

  const verifyVaultAccess = async () => {
    if (!vaultAccessCode || vaultAccessCode.length !== 4) {
      setError('Please enter a 4-digit access code')
      return
    }

    try {
      setVaultLoading(true)
      setError('')
      
      const response = await fetch('http://localhost:8005/api/admin/vault/verify-access', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_code: vaultAccessCode
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Invalid access code')
      }

      const data = await response.json()
      if (data.access_granted) {
        setIsVaultUnlocked(true)
        await fetchVaultEntries()
      } else {
        throw new Error('Access denied')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify access code')
    } finally {
      setVaultLoading(false)
    }
  }

  useEffect(() => {
    if (token && isFounder() && isVaultUnlocked) {
      fetchVaultEntries()
    }
  }, [token, isFounder, isVaultUnlocked])

  const handleViewPassword = async () => {
    if (!selectedUserId) return

    try {
      setLoading(true)
      const response = await fetch('http://localhost:8005/api/admin/vault/view-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: selectedUserId
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to view password')
      }

      const data = await response.json()
      setPasswordDetails(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to view password')
    } finally {
      setLoading(false)
    }
  }

  const handleSavePassword = async () => {
    if (!saveUserId || !savePassword) return

    try {
      setLoading(true)
      const response = await fetch('http://localhost:8005/api/admin/vault/save-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: saveUserId,
          original_password: savePassword,
          vault_access_code: saveAccessCode
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to save password')
      }

      setSuccessMessage(`Password saved to vault for ${saveUserId}`)
      setShowSaveModal(false)
      setSaveUserId('')
      setSavePassword('')
      setSaveAccessCode('0000')
      
      // Refresh vault entries
      await fetchVaultEntries()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save password')
    } finally {
      setLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated() || !isFounder()) {
    return null
  }

  // Show vault access code screen if not unlocked
  if (!isVaultUnlocked) {
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

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Password Vault</h1>
            <p className="mt-1 text-sm text-gray-600">
              Secure password storage and recovery system
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              🔒 Founder Only
            </span>
            <button
              onClick={() => setShowSaveModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              Save New Password
            </button>
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

          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
              {successMessage}
              <button
                onClick={() => setSuccessMessage('')}
                className="float-right text-green-500 hover:text-green-700"
              >
                ×
              </button>
            </div>
          )}

          {/* Warning Notice */}
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Security Notice
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>This vault stores original passwords for password recovery purposes. Access codes are temporarily disabled for testing. Use responsibly.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Password Details Modal */}
          {passwordDetails && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-6 py-4 rounded-lg mb-6">
              <h3 className="text-lg font-medium text-blue-800 mb-2">Password Retrieved</h3>
              <div className="space-y-2">
                <p><strong>User:</strong> {passwordDetails.user_name} ({passwordDetails.user_id})</p>
                <p><strong>Email:</strong> {passwordDetails.user_email}</p>
                <p><strong>Password:</strong> <span className="font-mono bg-blue-100 px-2 py-1 rounded">{passwordDetails.original_password}</span></p>
                <p><strong>Saved:</strong> {new Date(passwordDetails.created_at).toLocaleString()}</p>
              </div>
              <button
                onClick={() => setPasswordDetails(null)}
                className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
              >
                Close
              </button>
            </div>
          )}

          {/* Vault Entries Table */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Password Vault Entries ({vaultEntries.length})
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Stored passwords with access code protection
              </p>
            </div>
            
            <div className="border-t border-gray-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Has Password
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Access Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {vaultEntries.map((entry) => (
                      <tr key={entry.vault_id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {entry.user_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {entry.user_id}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {entry.user_email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {entry.has_password ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              ✓ Yes
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              ✗ No
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                          {entry.access_code_hint}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(entry.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {entry.has_password && (
                            <button
                              onClick={() => {
                                setSelectedUserId(entry.user_id)
                                handleViewPassword()
                              }}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              View Password
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* View Password Modal */}
          {showPasswordModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Enter 4-Digit Access Code
              </h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Access Code for {selectedUserId}
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-center text-2xl font-mono"
                  placeholder="0000"
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleViewPassword}
                  disabled={accessCode.length !== 4 || loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
                >
                  {loading ? 'Viewing...' : 'View Password'}
                </button>
                <button
                  onClick={() => {
                    setShowPasswordModal(false)
                    setAccessCode('')
                    setSelectedUserId('')
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save Password Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Save Password to Vault
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    User ID (e.g., USR-001)
                  </label>
                  <input
                    type="text"
                    value={saveUserId}
                    onChange={(e) => setSaveUserId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="USR-001"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Original Password
                  </label>
                  <input
                    type="text"
                    value={savePassword}
                    onChange={(e) => setSavePassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter password"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    4-Digit Access Code
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={saveAccessCode}
                    onChange={(e) => setSaveAccessCode(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-center font-mono"
                    placeholder="0000"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleSavePassword}
                  disabled={!saveUserId || !savePassword || saveAccessCode.length !== 4 || loading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save to Vault'}
                </button>
                <button
                  onClick={() => {
                    setShowSaveModal(false)
                    setSaveUserId('')
                    setSavePassword('')
                    setSaveAccessCode('1212')
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
        
      </div>
    </Layout>
    )
  }
