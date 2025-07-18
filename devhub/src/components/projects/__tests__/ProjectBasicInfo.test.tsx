import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProjectBasicInfo } from '../ProjectBasicInfo';
import { ProjectFormData } from '../types';

describe('ProjectBasicInfo', () => {
  const mockOnChange = jest.fn();
  
  const defaultFormData: ProjectFormData = {
    name: '',
    description: '',
    status: 'active',
    start_date: '',
    due_date: ''
  };

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders project name and description fields', () => {
    render(
      <ProjectBasicInfo
        formData={defaultFormData}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByRole('textbox', { name: /project name/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /description/i })).toBeInTheDocument();
  });

  it('displays form data values', () => {
    const formData: ProjectFormData = {
      ...defaultFormData,
      name: 'Test Project',
      description: 'Test description'
    };

    render(
      <ProjectBasicInfo
        formData={formData}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByDisplayValue('Test Project')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test description')).toBeInTheDocument();
  });

  it('calls onChange when name field changes', () => {
    render(
      <ProjectBasicInfo
        formData={defaultFormData}
        onChange={mockOnChange}
      />
    );

    const nameInput = screen.getByRole('textbox', { name: /project name/i });
    fireEvent.change(nameInput, { target: { value: 'New Project Name' } });

    expect(mockOnChange).toHaveBeenCalledWith('name', 'New Project Name');
  });

  it('calls onChange when description field changes', () => {
    render(
      <ProjectBasicInfo
        formData={defaultFormData}
        onChange={mockOnChange}
      />
    );

    const descriptionInput = screen.getByRole('textbox', { name: /description/i });
    fireEvent.change(descriptionInput, { target: { value: 'New description' } });

    expect(mockOnChange).toHaveBeenCalledWith('description', 'New description');
  });

  it('displays validation errors', () => {
    const errors = {
      name: 'Name is required',
      description: 'Description too long'
    };

    render(
      <ProjectBasicInfo
        formData={defaultFormData}
        onChange={mockOnChange}
        errors={errors}
      />
    );

    expect(screen.getByText('Name is required')).toBeInTheDocument();
    expect(screen.getByText('Description too long')).toBeInTheDocument();
  });

  it('shows character count for description', () => {
    const formData: ProjectFormData = {
      ...defaultFormData,
      description: 'Test description with some content'
    };

    render(
      <ProjectBasicInfo
        formData={formData}
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText('34/1000 characters')).toBeInTheDocument();
  });

  it('applies error styling when errors exist', () => {
    const errors = { name: 'Name is required' };

    render(
      <ProjectBasicInfo
        formData={defaultFormData}
        onChange={mockOnChange}
        errors={errors}
      />
    );

    const nameInput = screen.getByRole('textbox', { name: /project name/i });
    expect(nameInput).toHaveClass('border-red-500');
  });
});
