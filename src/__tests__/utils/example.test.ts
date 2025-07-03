// Example TDD Test - Utility Function
// RED → GREEN → REFACTOR cycle demonstration

describe('formatCurrency utility', () => {
  // RED: Write failing test first
  test('should format number as currency with ZAR symbol', () => {
    // Arrange
    const amount = 1234.56
    
    // Act
    const result = formatCurrency(amount)
    
    // Assert
    expect(result).toBe('R 1,234.56')
  })

  test('should handle zero amount', () => {
    expect(formatCurrency(0)).toBe('R 0.00')
  })

  test('should handle negative amounts', () => {
    expect(formatCurrency(-100.50)).toBe('-R 100.50')
  })

  test('should handle amounts without decimals', () => {
    expect(formatCurrency(1000)).toBe('R 1,000.00')
  })
})

// TODO: Now implement the formatCurrency function in src/utils/currency.ts
// This demonstrates TDD - tests written first, implementation follows

function formatCurrency(amount: number): string {
  // Minimal implementation to make tests pass (GREEN phase)
  if (amount < 0) {
    return `-R ${Math.abs(amount).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  return `R ${amount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}