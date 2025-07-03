// Example TDD Test - React Component
// Demonstrates component testing with React Testing Library

import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// RED: Write failing test first for a simple button component
describe('PrimaryButton component', () => {
  test('should render button with text', () => {
    // Arrange & Act
    render(<PrimaryButton>Click me</PrimaryButton>)
    
    // Assert
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  test('should call onClick handler when clicked', async () => {
    // Arrange
    const handleClick = jest.fn()
    const user = userEvent.setup()
    
    render(<PrimaryButton onClick={handleClick}>Test Button</PrimaryButton>)
    
    // Act
    await user.click(screen.getByRole('button'))
    
    // Assert
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  test('should be disabled when disabled prop is true', () => {
    // Arrange & Act
    render(<PrimaryButton disabled>Disabled Button</PrimaryButton>)
    
    // Assert
    expect(screen.getByRole('button')).toBeDisabled()
  })

  test('should have loading state', () => {
    // Arrange & Act
    render(<PrimaryButton loading>Loading Button</PrimaryButton>)
    
    // Assert
    expect(screen.getByRole('button')).toBeDisabled()
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })
})

// TODO: Now implement the PrimaryButton component in src/components/PrimaryButton.tsx
// This follows TDD - tests define the expected behavior first

interface PrimaryButtonProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
}

function PrimaryButton({ children, onClick, disabled, loading }: PrimaryButtonProps) {
  // Minimal implementation to make tests pass (GREEN phase)
  return (
    <button 
      onClick={onClick} 
      disabled={disabled || loading}
      className="primary-button"
    >
      {loading && <span data-testid="loading-spinner">Loading...</span>}
      {children}
    </button>
  )
}