'use client'

import { useState, useEffect, useCallback } from 'react'
import useAuth from '@/hooks/useAuth'
import Layout from '@/components/Layout'
import VaultAccess from '@/components/vault/VaultAccess'
import VaultTable from '@/components/vault/VaultTable'
import PasswordDetailsCard from '@/components/vault/PasswordDetailsCard'
import ViewPasswordModal from '@/components/vault/ViewPasswordModal'
import SavePasswordModal from '@/components/vault/SavePasswordModal'
import Alert from '@/components/common/Alert'
import type { VaultEntry, PasswordDetails } from '@/types/vault'

export default function PasswordVaultPage() {
  const { token, isLoading, isAuthenticated, isFounder } = useAuth()
  const [vaultEntries, setVaultEntries] = useState<VaultEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  
  // Vault access control
  const [isVaultUnlocked, setIsVaultUnlocked] = useState(false)
  
  // Modal states
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState('')
  const [passwordDetails, setPasswordDetails] = useState<PasswordDetails | null>(null)

  const fetchVaultEntries = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8005/api/v1/admin/vault/list', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch vault entries')
      }

      const data = await response.json()
      setVaultEntries(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch vault entries')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (!isLoading && isAuthenticated() && isFounder() && isVaultUnlocked) {
      fetchVaultEntries()
    }
  }, [isLoading, isAuthenticated, isFounder, isVaultUnlocked, fetchVaultEntries])

  const handleViewPassword = async (accessCode: string) => {
    if (!selectedUserId || !accessCode) return

    try {
      setLoading(true)
      const response = await fetch(`http://localhost:8005/api/v1/admin/vault/view-password/${selectedUserId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ access_code: accessCode }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to view password')
      }

      const data = await response.json()
      setPasswordDetails(data)
      setShowPasswordModal(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to view password')
    } finally {
      setLoading(false)
    }
  }

  const handleSavePassword = async (userId: string, password: string, accessCode: string) => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:8005/api/v1/admin/vault/save-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          original_password: password,
          vault_access_code: accessCode
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to save password')
      }

      setSuccessMessage(`Password saved to vault for ${userId}`)
      setShowSaveModal(false)
      
      // Refresh vault entries
      await fetchVaultEntries()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save password')
    } finally {
      setLoading(false)
    }
  }

  const handleViewPasswordClick = (userId: string) => {
    setSelectedUserId(userId)
    setShowPasswordModal(true)
  }

  const handleClosePasswordModal = () => {
    setShowPasswordModal(false)
    setSelectedUserId('')
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

  // Show vault access screen if not unlocked
  if (!isVaultUnlocked) {
    return (
      <VaultAccess
        error={error}
        setError={setError}
        onAccessGranted={() => setIsVaultUnlocked(true)}
      />
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

        {/* Alerts */}
        {error && (
          <Alert
            type="error"
            message={error}
            onClose={() => setError('')}
          />
        )}

        {successMessage && (
          <Alert
            type="success"
            message={successMessage}
            onClose={() => setSuccessMessage('')}
          />
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

        {/* Password Details */}
        {passwordDetails && (
          <PasswordDetailsCard
            passwordDetails={passwordDetails}
            onClose={() => setPasswordDetails(null)}
          />
        )}

        {/* Vault Entries Table */}
        <VaultTable
          vaultEntries={vaultEntries}
          onViewPassword={handleViewPasswordClick}
        />

        {/* Modals */}
        <ViewPasswordModal
          isOpen={showPasswordModal}
          selectedUserId={selectedUserId}
          loading={loading}
          onView={handleViewPassword}
          onClose={handleClosePasswordModal}
        />

        <SavePasswordModal
          isOpen={showSaveModal}
          loading={loading}
          onSave={handleSavePassword}
          onClose={() => setShowSaveModal(false)}
        />
      </div>
    </Layout>
  )
}
