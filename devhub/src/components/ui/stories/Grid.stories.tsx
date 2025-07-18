import type { Meta, StoryObj } from '@storybook/react'
import { Grid, GridItem, Card } from '../index'

const meta: Meta<typeof Grid> = {
  title: 'UI/Layout/Grid',
  component: Grid,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A flexible CSS Grid component with responsive capabilities and configurable gaps.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    cols: {
      control: 'select',
      options: [1, 2, 3, 4, 5, 6, 12],
      description: 'Number of columns'
    },
    gap: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg', 'xl'],
      description: 'Gap between grid items'
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

const SampleCard = ({ title, content }: { title: string, content: string }) => (
  <Card>
    <h3 className="font-semibold mb-2">{title}</h3>
    <p className="text-gray-600 text-sm">{content}</p>
  </Card>
)

export const Default: Story = {
  args: {
    cols: 3,
    children: (
      <>
        <SampleCard title="Item 1" content="This is the first grid item" />
        <SampleCard title="Item 2" content="This is the second grid item" />
        <SampleCard title="Item 3" content="This is the third grid item" />
        <SampleCard title="Item 4" content="This is the fourth grid item" />
        <SampleCard title="Item 5" content="This is the fifth grid item" />
        <SampleCard title="Item 6" content="This is the sixth grid item" />
      </>
    )
  }
}

export const TwoColumns: Story = {
  args: {
    cols: 2,
    gap: 'lg',
    children: (
      <>
        <SampleCard title="Left Column" content="Content for the left side" />
        <SampleCard title="Right Column" content="Content for the right side" />
        <SampleCard title="Bottom Left" content="More content below" />
        <SampleCard title="Bottom Right" content="Even more content" />
      </>
    )
  }
}

export const FourColumns: Story = {
  args: {
    cols: 4,
    gap: 'sm',
    children: (
      <>
        {Array.from({ length: 8 }, (_, i) => (
          <SampleCard 
            key={i}
            title={`Item ${i + 1}`} 
            content={`This is grid item number ${i + 1}`} 
          />
        ))}
      </>
    )
  }
}

export const Responsive: Story = {
  args: {
    cols: 1,
    responsive: {
      sm: 2,
      md: 3,
      lg: 4
    },
    children: (
      <>
        {Array.from({ length: 8 }, (_, i) => (
          <SampleCard 
            key={i}
            title={`Responsive ${i + 1}`} 
            content={`Responsive grid item ${i + 1}`} 
          />
        ))}
      </>
    )
  }
}

export const WithGridItems: Story = {
  render: () => (
    <Grid cols={12} gap="md">
      <GridItem colSpan={12}>
        <Card>
          <h2 className="text-xl font-bold">Full Width Header</h2>
          <p>This spans all 12 columns</p>
        </Card>
      </GridItem>
      
      <GridItem colSpan={8}>
        <Card>
          <h3 className="font-semibold">Main Content</h3>
          <p>This spans 8 columns (2/3 width)</p>
        </Card>
      </GridItem>
      
      <GridItem colSpan={4}>
        <Card>
          <h3 className="font-semibold">Sidebar</h3>
          <p>This spans 4 columns (1/3 width)</p>
        </Card>
      </GridItem>
      
      <GridItem colSpan={6}>
        <Card>
          <h3 className="font-semibold">Half Width</h3>
          <p>This spans 6 columns (1/2 width)</p>
        </Card>
      </GridItem>
      
      <GridItem colSpan={6}>
        <Card>
          <h3 className="font-semibold">Half Width</h3>
          <p>This also spans 6 columns (1/2 width)</p>
        </Card>
      </GridItem>
    </Grid>
  )
}

export const NoGap: Story = {
  args: {
    cols: 3,
    gap: 'none',
    children: (
      <>
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="bg-blue-100 border border-blue-300 p-4">
            <p className="text-blue-800">Item {i + 1}</p>
          </div>
        ))}
      </>
    )
  }
}

export const ExtraLargeGap: Story = {
  args: {
    cols: 2,
    gap: 'xl',
    children: (
      <>
        <SampleCard title="Spaced Item 1" content="Large gaps between items" />
        <SampleCard title="Spaced Item 2" content="Notice the large spacing" />
        <SampleCard title="Spaced Item 3" content="Perfect for breathable layouts" />
        <SampleCard title="Spaced Item 4" content="Professional appearance" />
      </>
    )
  }
}
