'use client'

import type { PasswordDetails } from '@/types/vault'

interface PasswordDetailsProps {
  passwordDetails: PasswordDetails
  onClose: () => void
}

export default function PasswordDetailsCard({ passwordDetails, onClose }: PasswordDetailsProps) {
  return (
    <div className="bg-blue-50 border border-blue-200 text-blue-700 px-6 py-4 rounded-lg mb-6">
      <h3 className="text-lg font-medium text-blue-800 mb-2">Password Retrieved</h3>
      <div className="space-y-2">
        <p><strong>User:</strong> {passwordDetails.user_name} ({passwordDetails.user_id})</p>
        <p><strong>Email:</strong> {passwordDetails.user_email}</p>
        <p><strong>Password:</strong> <span className="font-mono bg-blue-100 px-2 py-1 rounded">{passwordDetails.original_password}</span></p>
        <p><strong>Saved:</strong> {new Date(passwordDetails.created_at).toLocaleString()}</p>
      </div>
      <button
        onClick={onClose}
        className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
      >
        Close
      </button>
    </div>
  )
}
