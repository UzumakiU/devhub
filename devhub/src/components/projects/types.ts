// Project-specific type definitions for modular components

export interface ProjectFormData {
  name: string;
  description: string;
  status: 'active' | 'on-hold' | 'completed' | 'cancelled';
  start_date: string;
  due_date: string;
}

export interface ProjectValidationErrors {
  name?: string;
  description?: string;
  status?: string;
  start_date?: string;
  due_date?: string;
  form?: string;
}

export interface BaseProjectProps {
  formData: ProjectFormData;
  onChange: (field: keyof ProjectFormData, value: string) => void;
  errors?: ProjectValidationErrors;
}

export interface ProjectStatusOption {
  value: string;
  label: string;
  description: string;
}

export const PROJECT_STATUS_OPTIONS: ProjectStatusOption[] = [
  { value: 'active', label: 'Active', description: 'Project is currently in progress' },
  { value: 'on-hold', label: 'On Hold', description: 'Project is temporarily paused' },
  { value: 'completed', label: 'Completed', description: 'Project has been finished' },
  { value: 'cancelled', label: 'Cancelled', description: 'Project has been cancelled' }
];
