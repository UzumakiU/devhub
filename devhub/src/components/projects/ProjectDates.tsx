import React from 'react';
import { BaseProjectProps } from './types';
import { ProjectService } from './ProjectService';

export const ProjectDates: React.FC<BaseProjectProps> = ({
  formData,
  onChange,
  errors
}) => {
  // Auto-generate due date when start date changes
  const handleStartDateChange = (startDate: string) => {
    onChange('start_date', startDate);
    
    // If no due date is set, auto-generate one
    if (!formData.due_date && startDate) {
      const defaultDueDate = ProjectService.generateDefaultDueDate(startDate);
      onChange('due_date', defaultDueDate);
    }
  };

  // Calculate duration if both dates are set
  const duration = formData.start_date && formData.due_date 
    ? ProjectService.calculateDuration(formData.start_date, formData.due_date)
    : 0;

  // Check if project is overdue
  const isOverdue = ProjectService.isProjectOverdue(formData.due_date, formData.status);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Start Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Start Date
        </label>
        <input
          type="date"
          value={formData.start_date}
          onChange={(e) => handleStartDateChange(e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors?.start_date ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors?.start_date && (
          <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>
        )}
      </div>

      {/* Due Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Due Date
          {isOverdue && (
            <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
              OVERDUE
            </span>
          )}
        </label>
        <input
          type="date"
          value={formData.due_date}
          onChange={(e) => onChange('due_date', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors?.due_date ? 'border-red-500' : 
            isOverdue ? 'border-red-300 bg-red-50' : 'border-gray-300'
          }`}
        />
        {errors?.due_date && (
          <p className="mt-1 text-sm text-red-600">{errors.due_date}</p>
        )}
      </div>

      {/* Duration Display */}
      {duration > 0 && (
        <div className="md:col-span-2">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-sm text-blue-800">
              <strong>Project Duration:</strong> {duration} days
              {isOverdue && (
                <span className="ml-2 text-red-600">
                  ({Math.abs(ProjectService.calculateDuration(formData.due_date, new Date().toISOString().split('T')[0]))} days overdue)
                </span>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
