import { ProjectService } from '../ProjectService';
import { ProjectFormData } from '../types';

describe('ProjectService', () => {
  describe('validateProjectData', () => {
    it('should return no errors for valid data', () => {
      const validData: ProjectFormData = {
        name: 'Valid Project',
        description: 'A valid project description',
        status: 'active',
        start_date: '2024-01-01',
        due_date: '2024-02-01'
      };

      const errors = ProjectService.validateProjectData(validData);
      expect(Object.keys(errors)).toHaveLength(0);
    });

    it('should validate required name field', () => {
      const invalidData: ProjectFormData = {
        name: '',
        description: '',
        status: 'active',
        start_date: '',
        due_date: ''
      };

      const errors = ProjectService.validateProjectData(invalidData);
      expect(errors.name).toBe('Project name is required');
    });

    it('should validate name length limits', () => {
      const shortName: ProjectFormData = {
        name: 'AB',
        description: '',
        status: 'active',
        start_date: '',
        due_date: ''
      };

      const longName: ProjectFormData = {
        name: 'A'.repeat(101),
        description: '',
        status: 'active',
        start_date: '',
        due_date: ''
      };

      expect(ProjectService.validateProjectData(shortName).name).toBe('Project name must be at least 3 characters');
      expect(ProjectService.validateProjectData(longName).name).toBe('Project name must be less than 100 characters');
    });

    it('should validate description length', () => {
      const longDescription: ProjectFormData = {
        name: 'Valid Project',
        description: 'A'.repeat(1001),
        status: 'active',
        start_date: '',
        due_date: ''
      };

      const errors = ProjectService.validateProjectData(longDescription);
      expect(errors.description).toBe('Description must be less than 1000 characters');
    });

    it('should validate date logic', () => {
      const invalidDates: ProjectFormData = {
        name: 'Valid Project',
        description: '',
        status: 'active',
        start_date: '2024-02-01',
        due_date: '2024-01-01'
      };

      const errors = ProjectService.validateProjectData(invalidDates);
      expect(errors.due_date).toBe('Due date must be after start date');
    });
  });

  describe('hasValidationErrors', () => {
    it('should return true when errors exist', () => {
      const errors = { name: 'Required field' };
      expect(ProjectService.hasValidationErrors(errors)).toBe(true);
    });

    it('should return false when no errors exist', () => {
      const errors = {};
      expect(ProjectService.hasValidationErrors(errors)).toBe(false);
    });
  });

  describe('formatForSubmission', () => {
    it('should format data correctly', () => {
      const formData: ProjectFormData = {
        name: '  Test Project  ',
        description: '  Test Description  ',
        status: 'active',
        start_date: '2024-01-01',
        due_date: '2024-02-01'
      };

      const formatted = ProjectService.formatForSubmission(formData);
      
      expect(formatted).toEqual({
        name: 'Test Project',
        description: 'Test Description',
        status: 'active',
        start_date: '2024-01-01',
        due_date: '2024-02-01'
      });
    });

    it('should handle empty description', () => {
      const formData: ProjectFormData = {
        name: 'Test Project',
        description: '',
        status: 'active',
        start_date: '',
        due_date: ''
      };

      const formatted = ProjectService.formatForSubmission(formData);
      
      expect(formatted.description).toBeNull();
      expect(formatted.start_date).toBeNull();
      expect(formatted.due_date).toBeNull();
    });
  });

  describe('calculateDuration', () => {
    it('should calculate duration correctly', () => {
      const duration = ProjectService.calculateDuration('2024-01-01', '2024-01-11');
      expect(duration).toBe(10);
    });

    it('should return 0 for missing dates', () => {
      expect(ProjectService.calculateDuration('', '2024-01-01')).toBe(0);
      expect(ProjectService.calculateDuration('2024-01-01', '')).toBe(0);
    });
  });

  describe('isProjectOverdue', () => {
    const pastDate = '2020-01-01';
    const futureDate = '2030-01-01';

    it('should return true for overdue active projects', () => {
      expect(ProjectService.isProjectOverdue(pastDate, 'active')).toBe(true);
    });

    it('should return false for future due dates', () => {
      expect(ProjectService.isProjectOverdue(futureDate, 'active')).toBe(false);
    });

    it('should return false for completed projects', () => {
      expect(ProjectService.isProjectOverdue(pastDate, 'completed')).toBe(false);
    });

    it('should return false for cancelled projects', () => {
      expect(ProjectService.isProjectOverdue(pastDate, 'cancelled')).toBe(false);
    });

    it('should return false for projects without due date', () => {
      expect(ProjectService.isProjectOverdue('', 'active')).toBe(false);
    });
  });

  describe('generateDefaultDueDate', () => {
    it('should generate due date 30 days from start date', () => {
      const startDate = '2024-01-01';
      const dueDate = ProjectService.generateDefaultDueDate(startDate);
      expect(dueDate).toBe('2024-01-31');
    });

    it('should generate due date 30 days from today when no start date', () => {
      const today = new Date();
      const expectedDue = new Date(today);
      expectedDue.setDate(expectedDue.getDate() + 30);
      
      const dueDate = ProjectService.generateDefaultDueDate();
      expect(dueDate).toBe(expectedDue.toISOString().split('T')[0]);
    });
  });

  describe('convertToFormData', () => {
    it('should convert Project to ProjectFormData', () => {
      const project = {
        name: 'Test Project',
        description: 'Test Description',
        status: 'active',
        start_date: '2024-01-01',
        due_date: '2024-02-01'
      };

      const formData = ProjectService.convertToFormData(project);
      
      expect(formData).toEqual({
        name: 'Test Project',
        description: 'Test Description',
        status: 'active',
        start_date: '2024-01-01',
        due_date: '2024-02-01'
      });
    });

    it('should handle partial project data', () => {
      const project = { name: 'Test Project' };
      
      const formData = ProjectService.convertToFormData(project);
      
      expect(formData.name).toBe('Test Project');
      expect(formData.description).toBe('');
      expect(formData.status).toBe('active');
      expect(formData.start_date).toBe('');
      expect(formData.due_date).toBe('');
    });
  });
});
