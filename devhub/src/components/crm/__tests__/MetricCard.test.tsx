import { render, screen, fireEvent } from '@testing-library/react'
import MetricCard from '../MetricCard'

describe('MetricCard', () => {
  const mockIcon = <div data-testid="mock-icon">📊</div>

  it('renders basic metric card correctly', () => {
    render(
      <MetricCard
        title="Total Users"
        value={150}
        icon={mockIcon}
      />
    )

    expect(screen.getByText('Total Users')).toBeInTheDocument()
    expect(screen.getByText('150')).toBeInTheDocument()
    expect(screen.getByTestId('mock-icon')).toBeInTheDocument()
  })

  it('renders with subtitle when provided', () => {
    render(
      <MetricCard
        title="Total Sales"
        value="$50,000"
        subtitle="+15% this month"
        icon={mockIcon}
      />
    )

    expect(screen.getByText('Total Sales')).toBeInTheDocument()
    expect(screen.getByText('$50,000')).toBeInTheDocument()
    expect(screen.getByText('+15% this month')).toBeInTheDocument()
  })

  it('calls onClick when card is clicked', () => {
    const mockOnClick = jest.fn()
    
    render(
      <MetricCard
        title="Clickable Card"
        value={100}
        icon={mockIcon}
        onClick={mockOnClick}
      />
    )

    const card = screen.getByText('Clickable Card').closest('div')
    fireEvent.click(card!)
    
    expect(mockOnClick).toHaveBeenCalledTimes(1)
  })

  it('applies correct color classes', () => {
    const { rerender } = render(
      <MetricCard
        title="Green Card"
        value={100}
        icon={mockIcon}
        color="green"
      />
    )

    const iconContainer = screen.getByTestId('mock-icon').parentElement?.parentElement
    expect(iconContainer).toHaveClass('bg-green-100')

    rerender(
      <MetricCard
        title="Purple Card"
        value={100}
        icon={mockIcon}
        color="purple"
      />
    )

    expect(iconContainer).toHaveClass('bg-purple-100')
  })

  it('has cursor pointer class when onClick is provided', () => {
    const { container } = render(
      <MetricCard
        title="Clickable"
        value={100}
        icon={mockIcon}
        onClick={() => {}}
      />
    )

    const card = container.firstChild as HTMLElement
    expect(card).toHaveClass('cursor-pointer')
  })

  it('does not have cursor pointer class when onClick is not provided', () => {
    const { container } = render(
      <MetricCard
        title="Not Clickable"
        value={100}
        icon={mockIcon}
      />
    )

    const card = container.firstChild as HTMLElement
    expect(card).not.toHaveClass('cursor-pointer')
  })
})
