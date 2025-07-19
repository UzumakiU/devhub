import React from 'react';
import { BaseProjectProps } from './types';

export const ProjectBasicInfo: React.FC<BaseProjectProps> = ({
  formData,
  onChange,
  errors
}) => {
  return (
    <div className="space-y-4">
      {/* Project Name */}
      <div>
        <label htmlFor="project-name" className="block text-sm font-medium text-gray-700 mb-2">
          Project Name *
        </label>
        <input
          id="project-name"
          type="text"
          value={formData.name}
          onChange={(e) => onChange('name', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors?.name ? 'border-red-500' : 'border-border'
          }`}
          placeholder="Enter project name"
          required
        />
        {errors?.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      {/* Project Description */}
      <div>
        <label htmlFor="project-description" className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          id="project-description"
          value={formData.description}
          onChange={(e) => onChange('description', e.target.value)}
          rows={4}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors?.description ? 'border-red-500' : 'border-border'
          }`}
          placeholder="Enter project description (optional)"
        />
        {errors?.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
        )}
        <p className="mt-1 text-sm text-gray-500">
          {formData.description.length}/1000 characters
        </p>
      </div>
    </div>
  );
};
