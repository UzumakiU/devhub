import React from 'react';
import { BaseProjectProps, PROJECT_STATUS_OPTIONS } from './types';

export const ProjectStatus: React.FC<BaseProjectProps> = ({
  formData,
  onChange,
  errors
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Project Status
      </label>
      <select
        value={formData.status}
        onChange={(e) => onChange('status', e.target.value)}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          errors?.status ? 'border-red-500' : 'border-gray-300'
        }`}
      >
        {PROJECT_STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {errors?.status && (
        <p className="mt-1 text-sm text-red-600">{errors.status}</p>
      )}
      
      {/* Status description */}
      {formData.status && (
        <p className="mt-1 text-sm text-gray-500">
          {PROJECT_STATUS_OPTIONS.find(opt => opt.value === formData.status)?.description}
        </p>
      )}
    </div>
  );
};
