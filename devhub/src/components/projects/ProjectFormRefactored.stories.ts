import type { Meta, StoryObj } from '@storybook/react';
import { ProjectFormRefactored } from './ProjectFormRefactored';

const meta: Meta<typeof ProjectFormRefactored> = {
  title: 'Projects/ProjectFormRefactored',
  component: ProjectFormRefactored,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onSuccess: { action: 'success' },
    onCancel: { action: 'cancel' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const CreateProject: Story = {
  args: {
    onSuccess: () => console.log('Project created successfully'),
    onCancel: () => console.log('Create cancelled'),
  },
};

export const EditProject: Story = {
  args: {
    project: {
      system_id: '1',
      name: 'Website Redesign',
      description: 'Complete overhaul of company website with modern design and improved UX',
      status: 'active',
      start_date: '2024-01-15',
      due_date: '2024-03-15',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-15T00:00:00Z'
    },
    onSuccess: () => console.log('Project updated successfully'),
    onCancel: () => console.log('Edit cancelled'),
  },
};

export const OnHoldProject: Story = {
  args: {
    project: {
      system_id: '2',
      name: 'Mobile App Development',
      description: 'Native mobile application for iOS and Android platforms',
      status: 'on-hold',
      start_date: '2024-02-01',
      due_date: '2024-06-01',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-02-01T00:00:00Z'
    },
    onSuccess: () => console.log('Project updated successfully'),
    onCancel: () => console.log('Edit cancelled'),
  },
};

export const OverdueProject: Story = {
  args: {
    project: {
      system_id: '3',
      name: 'Database Migration',
      description: 'Migrate legacy database to new cloud infrastructure',
      status: 'active',
      start_date: '2023-11-01',
      due_date: '2023-12-31', // Past due date
      created_at: '2023-10-01T00:00:00Z',
      updated_at: '2023-11-01T00:00:00Z'
    },
    onSuccess: () => console.log('Project updated successfully'),
    onCancel: () => console.log('Edit cancelled'),
  },
};

export const CompletedProject: Story = {
  args: {
    project: {
      system_id: '4',
      name: 'API Documentation',
      description: 'Complete API documentation with examples and integration guides',
      status: 'completed',
      start_date: '2023-10-01',
      due_date: '2023-11-30',
      created_at: '2023-09-15T00:00:00Z',
      updated_at: '2023-11-30T00:00:00Z'
    },
    onSuccess: () => console.log('Project updated successfully'),
    onCancel: () => console.log('Edit cancelled'),
  },
};
