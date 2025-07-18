'use client'

import React, { useState } from 'react';
import { Project } from '@/types/api';
import { ProjectFormData, ProjectValidationErrors } from './types';
import { ProjectService } from './ProjectService';
import { ProjectBasicInfo } from './ProjectBasicInfo';
import { ProjectStatus } from './ProjectStatus';
import { ProjectDates } from './ProjectDates';

interface ProjectFormRefactoredProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  project?: Partial<Project>;
}

export const ProjectFormRefactored: React.FC<ProjectFormRefactoredProps> = ({
  onSuccess,
  onCancel,
  project
}) => {
  const [formData, setFormData] = useState<ProjectFormData>(() => {
    return project ? ProjectService.convertToFormData(project) : {
      name: '',
      description: '',
      status: 'active',
      start_date: '',
      due_date: ''
    };
  });

  const [errors, setErrors] = useState<ProjectValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFieldChange = (field: keyof ProjectFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      // Validate form data
      const validationErrors = ProjectService.validateProjectData(formData);
      
      if (ProjectService.hasValidationErrors(validationErrors)) {
        setErrors(validationErrors);
        return;
      }

      // Submit data
      if (project?.system_id) {
        await ProjectService.updateProject(project.system_id, formData);
      } else {
        await ProjectService.createProject(formData);
      }
      
      onSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save project';
      setErrors({ form: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEditing = Boolean(project?.system_id);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">
        {isEditing ? 'Edit Project' : 'Create New Project'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information Section */}
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Project Information</h3>
          <ProjectBasicInfo
            formData={formData}
            onChange={handleFieldChange}
            errors={errors}
          />
        </div>

        {/* Status and Timeline Section */}
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Status & Timeline</h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ProjectStatus
              formData={formData}
              onChange={handleFieldChange}
              errors={errors}
            />
            <div className="lg:col-span-2">
              <ProjectDates
                formData={formData}
                onChange={handleFieldChange}
                errors={errors}
              />
            </div>
          </div>
        </div>

        {/* Form-level error display */}
        {errors.form && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error saving project
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  {errors.form}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-6">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              disabled={isSubmitting}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting 
              ? 'Saving...' 
              : isEditing 
                ? 'Update Project' 
                : 'Create Project'
            }
          </button>
        </div>
      </form>
    </div>
  );
};
