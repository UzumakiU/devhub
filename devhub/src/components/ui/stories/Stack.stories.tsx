import type { Meta, StoryObj } from '@storybook/react'
import { Stack, Spacer, Card, Button } from '../index'

const meta: Meta<typeof Stack> = {
  title: 'UI/Layout/Stack',
  component: Stack,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A flexible layout component for arranging items in rows or columns with consistent spacing and alignment options.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    direction: {
      control: 'select',
      options: ['row', 'column'],
      description: 'Direction of the stack'
    },
    spacing: {
      control: 'select',
      options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Spacing between items'
    },
    align: {
      control: 'select',
      options: ['start', 'center', 'end', 'stretch'],
      description: 'Cross-axis alignment'
    },
    justify: {
      control: 'select',
      options: ['start', 'center', 'end', 'between', 'around', 'evenly'],
      description: 'Main-axis alignment'
    },
    wrap: {
      control: 'boolean',
      description: 'Whether items should wrap'
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

const SampleItem = ({ children, color = 'bg-blue-100' }: { children: React.ReactNode, color?: string }) => (
  <div className={`${color} p-3 rounded border border-blue-300 text-blue-800 font-medium`}>
    {children}
  </div>
)

export const VerticalDefault: Story = {
  args: {
    direction: 'column',
    spacing: 'md',
    children: (
      <>
        <SampleItem>Item 1</SampleItem>
        <SampleItem>Item 2</SampleItem>
        <SampleItem>Item 3</SampleItem>
      </>
    )
  }
}

export const HorizontalDefault: Story = {
  args: {
    direction: 'row',
    spacing: 'md',
    children: (
      <>
        <SampleItem>Item 1</SampleItem>
        <SampleItem>Item 2</SampleItem>
        <SampleItem>Item 3</SampleItem>
      </>
    )
  }
}

export const NoSpacing: Story = {
  args: {
    direction: 'column',
    spacing: 'none',
    children: (
      <>
        <SampleItem>No Spacing 1</SampleItem>
        <SampleItem>No Spacing 2</SampleItem>
        <SampleItem>No Spacing 3</SampleItem>
      </>
    )
  }
}

export const LargeSpacing: Story = {
  args: {
    direction: 'column',
    spacing: 'xl',
    children: (
      <>
        <SampleItem>Large Spacing 1</SampleItem>
        <SampleItem>Large Spacing 2</SampleItem>
        <SampleItem>Large Spacing 3</SampleItem>
      </>
    )
  }
}

export const CenterAligned: Story = {
  args: {
    direction: 'column',
    spacing: 'md',
    align: 'center',
    children: (
      <>
        <SampleItem>Short</SampleItem>
        <SampleItem>Medium Length Item</SampleItem>
        <SampleItem>Very Long Item with More Content</SampleItem>
      </>
    )
  }
}

export const SpaceBetween: Story = {
  args: {
    direction: 'row',
    justify: 'between',
    children: (
      <>
        <SampleItem>Left</SampleItem>
        <SampleItem>Center</SampleItem>
        <SampleItem>Right</SampleItem>
      </>
    )
  }
}

export const WithWrapping: Story = {
  args: {
    direction: 'row',
    spacing: 'md',
    wrap: true,
    className: 'max-w-md',
    children: (
      <>
        {Array.from({ length: 8 }, (_, i) => (
          <SampleItem key={i}>Item {i + 1}</SampleItem>
        ))}
      </>
    )
  }
}

export const WithDivider: Story = {
  args: {
    direction: 'column',
    divider: <hr className="border-border" />,
    children: (
      <>
        <Card>
          <h3 className="font-semibold">Section 1</h3>
          <p>This is the first section</p>
        </Card>
        <Card>
          <h3 className="font-semibold">Section 2</h3>
          <p>This is the second section</p>
        </Card>
        <Card>
          <h3 className="font-semibold">Section 3</h3>
          <p>This is the third section</p>
        </Card>
      </>
    )
  }
}

export const HorizontalWithDivider: Story = {
  args: {
    direction: 'row',
    divider: <div className="w-px bg-gray-300 h-8" />,
    children: (
      <>
        <Button variant="primary">Action 1</Button>
        <Button variant="secondary">Action 2</Button>
        <Button variant="secondary">Action 3</Button>
      </>
    )
  }
}

export const ResponsiveButtonBar: Story = {
  render: () => (
    <Stack direction="row" spacing="sm" justify="end" wrap>
      <Button variant="secondary">Cancel</Button>
      <Button variant="secondary">Save Draft</Button>
      <Button variant="primary">Publish</Button>
    </Stack>
  )
}

export const FormLayout: Story = {
  render: () => (
    <div className="max-w-md">
      <Stack direction="column" spacing="lg">
        <Card>
          <h2 className="text-xl font-bold mb-4">User Profile</h2>
          <Stack direction="column" spacing="md">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input className="w-full p-2 border rounded" placeholder="Enter your name" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input className="w-full p-2 border rounded" type="email" placeholder="Enter your email" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Bio</label>
              <textarea className="w-full p-2 border rounded" rows={3} placeholder="Tell us about yourself" />
            </div>
          </Stack>
        </Card>
        
        <Stack direction="row" justify="end" spacing="sm">
          <Button variant="secondary">Cancel</Button>
          <Button variant="primary">Save Changes</Button>
        </Stack>
      </Stack>
    </div>
  )
}

export const WithSpacerComponent: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="font-semibold mb-2">Vertical Spacers</h3>
        <div>
          <SampleItem>Item 1</SampleItem>
          <Spacer size="sm" />
          <SampleItem>Item 2 (small spacer)</SampleItem>
          <Spacer size="lg" />
          <SampleItem>Item 3 (large spacer)</SampleItem>
        </div>
      </div>
      
      <div>
        <h3 className="font-semibold mb-2">Horizontal Spacers</h3>
        <div className="flex items-center">
          <SampleItem>Item 1</SampleItem>
          <Spacer direction="horizontal" size="sm" />
          <SampleItem>Item 2</SampleItem>
          <Spacer direction="horizontal" size="lg" />
          <SampleItem>Item 3</SampleItem>
        </div>
      </div>
    </div>
  )
}
