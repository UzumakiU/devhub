import type { Meta, StoryObj } from '@storybook/react'
import { DataTable, Button, Badge, Column } from '../index'

const meta: Meta<typeof DataTable<User>> = {
  title: 'UI/Table/DataTable',
  component: DataTable,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A flexible and feature-rich data table component with sorting, selection, and customizable rendering.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'striped', 'bordered'],
      description: 'Visual variant of the table'
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the table'
    },
    loading: {
      control: 'boolean',
      description: 'Loading state'
    },
    selectable: {
      control: 'boolean',
      description: 'Enable row selection'
    }
  }
}

export default meta
type Story = StoryObj<typeof DataTable<User>>

// Sample data
type User = {
  id: number
  name: string
  email: string
  role: string
  status: string
  lastLogin: string | null
}

const users: User[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active', lastLogin: '2024-01-15' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active', lastLogin: '2024-01-14' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User', status: 'Inactive', lastLogin: '2024-01-10' },
  { id: 4, name: 'Alice Wilson', email: 'alice@example.com', role: 'Manager', status: 'Active', lastLogin: '2024-01-16' },
  { id: 5, name: 'Charlie Brown', email: 'charlie@example.com', role: 'User', status: 'Pending', lastLogin: null }
]

const columns: Column<User>[] = [
  {
    key: 'name',
    header: 'Name',
    accessor: 'name',
    sortable: true
  },
  {
    key: 'email',
    header: 'Email',
    accessor: 'email',
    sortable: true
  },
  {
    key: 'role',
    header: 'Role',
    accessor: 'role',
    render: (value: string) => (
      <Badge variant={value === 'Admin' ? 'primary' : value === 'Manager' ? 'secondary' : 'default'}>
        {value}
      </Badge>
    )
  },
  {
    key: 'status',
    header: 'Status',
    accessor: 'status',
    render: (value: string) => (
      <Badge variant={value === 'Active' ? 'success' : value === 'Inactive' ? 'danger' : 'warning'}>
        {value}
      </Badge>
    )
  },
  {
    key: 'lastLogin',
    header: 'Last Login',
    accessor: 'lastLogin',
    render: (value: string | null) => value || 'Never'
  },
  {
    key: 'actions',
    header: 'Actions',
    render: () => (
      <div className="flex space-x-2">
        <Button size="sm" variant="secondary">Edit</Button>
        <Button size="sm" variant="danger">Delete</Button>
      </div>
    )
  }
]

export const Default: Story = {
  args: {
    data: users,
    columns: columns as Column<User>[]
  }
}

export const Striped: Story = {
  args: {
    data: users,
    columns: columns as Column<User>[],
    variant: 'striped'
  }
}

export const Bordered: Story = {
  args: {
    data: users,
    columns: columns as Column<User>[],
    variant: 'bordered'
  }
}

export const Small: Story = {
  args: {
    data: users,
    columns: columns as Column<User>[],
    size: 'sm'
  }
}

export const Large: Story = {
  args: {
    data: users,
    columns: columns as Column<User>[],
    size: 'lg'
  }
}

export const Loading: Story = {
  args: {
    data: [],
    columns: columns as Column<User>[],
    loading: true
  }
}

export const Empty: Story = {
  args: {
    data: [],
    columns: columns as Column<User>[],
    emptyMessage: 'No users found'
  }
}

export const Selectable: Story = {
  args: {
    data: users,
    columns: columns as Column<User>[],
    selectable: true,
    onRowSelect: (index: number, selected: boolean) => {
      console.log('Row', index, selected ? 'selected' : 'deselected')
    }
  }
}

export const WithSorting: Story = {
  args: {
    data: users,
    columns: columns as Column<User>[],
    sortConfig: { key: 'name', direction: 'asc' },
    onSort: (key: string) => {
      console.log('Sort by:', key)
    }
  }
}

export const Clickable: Story = {
  args: {
    data: users,
    columns: columns as Column<User>[],
    onRowClick: (item: User, index: number) => {
      console.log('Clicked row:', index, item)
    }
  }
}
