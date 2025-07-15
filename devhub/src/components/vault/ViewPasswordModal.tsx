'use client'

import { useState } from 'react'

interface ViewPasswordModalProps {
  isOpen: boolean
  selectedUserId: string
  loading: boolean
  onView: (accessCode: string) => void
  onClose: () => void
}

export default function ViewPasswordModal({ 
  isOpen, 
  selectedUserId, 
  loading, 
  onView, 
  onClose 
}: ViewPasswordModalProps) {
  const [accessCode, setAccessCode] = useState('')

  if (!isOpen) return null

  const handleSubmit = () => {
    onView(accessCode)
    setAccessCode('')
  }

  const handleClose = () => {
    onClose()
    setAccessCode('')
  }

  return (
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
              onClick={handleSubmit}
              disabled={accessCode.length !== 4 || loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
            >
              {loading ? 'Viewing...' : 'View Password'}
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
