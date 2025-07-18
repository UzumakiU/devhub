import { render, screen } from '@testing-library/react'
import { FormField, Input } from '../index'

describe('FormField', () => {
  it('renders form field with label', () => {
    render(
      <FormField label="Email Address">
        <Input type="email" />
      </FormField>
    )

    expect(screen.getByText('Email Address')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('shows required indicator when required is true', () => {
    render(
      <FormField label="Required Field" required>
        <Input />
      </FormField>
    )

    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('displays error message when error is provided', () => {
    render(
      <FormField label="Email" error="Invalid email">
        <Input type="email" />
      </FormField>
    )

    expect(screen.getByText('Invalid email')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('displays hint when provided', () => {
    render(
      <FormField label="Password" hint="Must be at least 8 characters">
        <Input type="password" />
      </FormField>
    )

    expect(screen.getByText('Must be at least 8 characters')).toBeInTheDocument()
  })

  it('applies disabled state correctly', () => {
    render(
      <FormField label="Disabled Field" disabled>
        <Input />
      </FormField>
    )

    const input = screen.getByRole('textbox')
    expect(input).toBeDisabled()
  })

  it('associates label with input using htmlFor', () => {
    render(
      <FormField label="Email">
        <Input type="email" />
      </FormField>
    )

    const label = screen.getByText('Email')
    const input = screen.getByRole('textbox')
    
    expect(label).toHaveAttribute('for', input.id)
  })
})
