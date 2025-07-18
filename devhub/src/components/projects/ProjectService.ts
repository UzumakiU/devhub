import { api } from '@/lib/api';
import { Project } from '@/types/api';
import { ProjectFormData, ProjectValidationErrors } from './types';

export class ProjectService {
  /**
   * Validates project form data
   */
  static validateProjectData(data: ProjectFormData): ProjectValidationErrors {
    const errors: ProjectValidationErrors = {};

    // Name validation
    if (!data.name.trim()) {
      errors.name = 'Project name is required';
    } else if (data.name.length < 3) {
      errors.name = 'Project name must be at least 3 characters';
    } else if (data.name.length > 100) {
      errors.name = 'Project name must be less than 100 characters';
    }

    // Description validation (optional but if provided, has limits)
    if (data.description && data.description.length > 1000) {
      errors.description = 'Description must be less than 1000 characters';
    }

    // Date validation
    if (data.start_date && data.due_date) {
      const startDate = new Date(data.start_date);
      const dueDate = new Date(data.due_date);
      
      if (dueDate <= startDate) {
        errors.due_date = 'Due date must be after start date';
      }
    }

    return errors;
  }

  /**
   * Checks if validation errors exist
   */
  static hasValidationErrors(errors: ProjectValidationErrors): boolean {
    return Object.keys(errors).length > 0;
  }

  /**
   * Formats project data for API submission
   */
  static formatForSubmission(data: ProjectFormData): Record<string, unknown> {
    return {
      name: data.name.trim(),
      description: data.description.trim() || null,
      status: data.status,
      start_date: data.start_date || null,
      due_date: data.due_date || null
    };
  }

  /**
   * Creates a new project
   */
  static async createProject(data: ProjectFormData): Promise<void> {
    const validationErrors = this.validateProjectData(data);
    if (this.hasValidationErrors(validationErrors)) {
      throw new Error('Validation failed');
    }

    const formattedData = this.formatForSubmission(data);
    await api.createRecord('projects', formattedData);
  }

  /**
   * Updates an existing project
   */
  static async updateProject(projectId: string, data: ProjectFormData): Promise<void> {
    const validationErrors = this.validateProjectData(data);
    if (this.hasValidationErrors(validationErrors)) {
      throw new Error('Validation failed');
    }

    const formattedData = this.formatForSubmission(data);
    await api.updateRecord('projects', projectId, formattedData);
  }

  /**
   * Calculates project duration in days
   */
  static calculateDuration(startDate: string, endDate: string): number {
    if (!startDate || !endDate) return 0;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Determines if project is overdue
   */
  static isProjectOverdue(dueDate: string, status: string): boolean {
    if (!dueDate || status === 'completed' || status === 'cancelled') {
      return false;
    }
    
    return new Date(dueDate) < new Date();
  }

  /**
   * Generates default due date (30 days from start date or today)
   */
  static generateDefaultDueDate(startDate?: string): string {
    const baseDate = startDate ? new Date(startDate) : new Date();
    const dueDate = new Date(baseDate);
    dueDate.setDate(dueDate.getDate() + 30);
    return dueDate.toISOString().split('T')[0];
  }

  /**
   * Converts Project API object to ProjectFormData
   */
  static convertToFormData(project: Partial<Project>): ProjectFormData {
    return {
      name: project.name || '',
      description: (project as Record<string, unknown>)?.description as string || '',
      status: (project.status as ProjectFormData['status']) || 'active',
      start_date: (project as Record<string, unknown>)?.start_date as string || '',
      due_date: (project as Record<string, unknown>)?.due_date as string || ''
    };
  }
}
