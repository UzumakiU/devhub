'use client'

import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import { Project as ApiProject } from '@/types/api'

interface Project extends ApiProject {
  id?: number
  display_id?: string
  description?: string
  client_id?: number
  updated_at?: string
}

interface ProjectListProps {
  limit?: number
  showCreateButton?: boolean
  refresh?: number
  onEdit?: (project: Project) => void
}

export default function ProjectList({ 
  limit, 
  showCreateButton = true, 
  refresh, 
  onEdit 
}: ProjectListProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true)
      const response = await api.getProjects()
      
      if (response.success && response.data) {
        let projectList = response.data as Project[]
        if (limit) {
          projectList = projectList.slice(0, limit)
        }
        setProjects(projectList)
      } else {
        setError('Failed to load projects')
      }
    } catch (err) {
      console.error('Error loading projects:', err)
      setError('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }, [limit])

  useEffect(() => {
    loadProjects()
  }, [refresh, loadProjects]) // Refresh when refresh prop changes

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'on_hold':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="bg-card shadow rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-card shadow rounded-lg p-6">
        <div className="text-center text-red-600">
          <p>{error}</p>
          <button 
            onClick={loadProjects}
            className="mt-2 text-blue-600 hover:text-blue-500"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card shadow rounded-lg">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-foreground">
            Recent Projects {limit && `(${projects.length})`}
          </h3>
          {showCreateButton && (
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
              New Project
            </button>
          )}
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-6xl mb-4">📁</div>
            <p className="text-gray-500 mb-4">No projects yet</p>
            {showCreateButton && (
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                Create Your First Project
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map((project, index) => (
              <div key={project.system_id || project.id || index} className="border border-border rounded-lg p-4 hover:bg-background">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-medium text-foreground">{project.name}</h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{project.display_id}</p>
                    {project.description && (
                      <p className="text-sm text-gray-600 mt-2">{project.description}</p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    {onEdit && (
                      <button 
                        onClick={() => onEdit(project)}
                        className="text-blue-600 hover:text-blue-500 text-sm"
                      >
                        Edit
                      </button>
                    )}
                    <button className="text-gray-600 hover:text-gray-500 text-sm">
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
