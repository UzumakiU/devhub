'use client'

import { useState } from 'react'
import Layout from '@/components/Layout'
import ProjectList from '@/components/ProjectList'
import ProjectForm from '@/components/ProjectForm'
import { featureFlags } from '@/lib/config'
import FeatureDisabledPage from '@/components/FeatureDisabledPage'

export default function ProjectsPage() {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  if (!featureFlags.projects) {
    return <FeatureDisabledPage moduleName="Projects" />
  }

  const handleProjectCreated = () => {
    setShowCreateForm(false)
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Create Project
          </button>
        </div>

        <ProjectList refresh={refreshTrigger} />

        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <ProjectForm
                onSuccess={handleProjectCreated}
                onCancel={() => setShowCreateForm(false)}
              />
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
