'use client'

import { useState } from 'react'

interface SavePasswordModalProps {
  isOpen: boolean
  loading: boolean
  onSave: (userId: string, password: string, accessCode: string) => void
  onClose: () => void
}

export default function SavePasswordModal({ 
  isOpen, 
  loading, 
  onSave, 
  onClose 
}: SavePasswordModalProps) {
  const [saveUserId, setSaveUserId] = useState('')
  const [savePassword, setSavePassword] = useState('')
  const [saveAccessCode, setSaveAccessCode] = useState('1212')

  if (!isOpen) return null

  const handleSubmit = () => {
    onSave(saveUserId, savePassword, saveAccessCode)
  }

  const handleClose = () => {
    onClose()
    setSaveUserId('')
    setSavePassword('')
    setSaveAccessCode('1212')
  }

  return (
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
              onClick={handleSubmit}
              disabled={!saveUserId || !savePassword || saveAccessCode.length !== 4 || loading}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save to Vault'}
            </button>
            <button
              onClick={handleClose}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
