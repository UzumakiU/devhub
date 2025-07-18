import type { Meta, StoryObj } from '@storybook/react'
import { Container, Card } from '../index'

const meta: Meta<typeof Container> = {
  title: 'UI/Layout/Container',
  component: Container,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A responsive container component with configurable max-width, padding, and centering options.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', 'full'],
      description: 'Maximum width of the container'
    },
    padding: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
      description: 'Padding around the container content'
    },
    centerContent: {
      control: 'boolean',
      description: 'Whether to center the container horizontally'
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

const SampleContent = () => (
  <div className="space-y-4">
    <Card>
      <h2 className="text-xl font-bold mb-2">Sample Content</h2>
      <p className="text-gray-600">
        This is sample content to demonstrate the container component. The container controls the maximum width and spacing of its content.
      </p>
    </Card>
    <Card>
      <h3 className="text-lg font-semibold mb-2">Another Card</h3>
      <p className="text-gray-600">
        Containers are useful for creating consistent layouts across different screen sizes.
      </p>
    </Card>
  </div>
)

export const Default: Story = {
  args: {
    children: <SampleContent />
  }
}

export const Small: Story = {
  args: {
    size: 'sm',
    centerContent: true,
    children: <SampleContent />
  }
}

export const Medium: Story = {
  args: {
    size: 'md',
    centerContent: true,
    children: <SampleContent />
  }
}

export const Large: Story = {
  args: {
    size: 'lg',
    centerContent: true,
    children: <SampleContent />
  }
}

export const ExtraLarge: Story = {
  args: {
    size: 'xl',
    centerContent: true,
    children: <SampleContent />
  }
}

export const FullWidth: Story = {
  args: {
    size: 'full',
    children: <SampleContent />
  }
}

export const NoPadding: Story = {
  args: {
    padding: 'none',
    centerContent: true,
    children: <SampleContent />
  }
}

export const SmallPadding: Story = {
  args: {
    padding: 'sm',
    centerContent: true,
    children: <SampleContent />
  }
}

export const LargePadding: Story = {
  args: {
    padding: 'lg',
    centerContent: true,
    children: <SampleContent />
  }
}

export const NotCentered: Story = {
  args: {
    centerContent: false,
    children: <SampleContent />
  }
}
