# TDD Workflow Documentation 🧪

## Test-Driven Development Process

### 1. RED → GREEN → REFACTOR Cycle

#### RED Phase: Write Failing Test
```bash
# Write a test that describes the desired behavior
# Test should FAIL initially (red)
npm run test:watch  # Keep tests running
```

#### GREEN Phase: Make Test Pass
```bash
# Write minimal code to make the test pass
# Focus on making it work, not perfect
```

#### REFACTOR Phase: Improve Code Quality
```bash
# Improve code while keeping tests green
# Better naming, extract functions, optimize
```

### 2. TDD Commands

```bash
# Run all tests once
npm test

# Watch mode for TDD (auto-rerun on changes)
npm run test:watch

# Coverage report
npm run test:coverage

# CI mode (for automated testing)
npm run test:ci
```

### 3. Test Structure

```
src/
├── __tests__/
│   ├── components/     # Component tests
│   ├── utils/          # Utility function tests
│   ├── pages/          # Page component tests
│   ├── hooks/          # Custom hook tests
│   └── integration/    # Integration tests
└── components/
    └── __tests__/      # Co-located component tests (alternative)
```

### 4. Testing Patterns

#### Utility Functions
```typescript
// Test pure functions first - easiest TDD wins
describe('utility function', () => {
  test('should handle expected input', () => {
    // Arrange
    const input = 'test'
    
    // Act
    const result = myFunction(input)
    
    // Assert
    expect(result).toBe('expected')
  })
})
```

#### React Components
```typescript
import { render, screen } from '@testing-library/react'

describe('MyComponent', () => {
  test('should render with props', () => {
    render(<MyComponent title="Test" />)
    expect(screen.getByText('Test')).toBeInTheDocument()
  })
})
```

#### API Integration
```typescript
// Mock axios for API tests
jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

test('should fetch user data', async () => {
  mockedAxios.get.mockResolvedValue({ data: { id: 1, name: 'Test' } })
  
  const user = await fetchUser(1)
  expect(user.name).toBe('Test')
})
```

### 5. Best Practices

1. **Start Small**: Begin with utility functions (pure functions)
2. **One Test at a Time**: Focus on one failing test
3. **Minimal Implementation**: Write just enough code to pass
4. **Descriptive Names**: Test names should describe behavior
5. **Arrange-Act-Assert**: Structure tests clearly
6. **Fast Feedback**: Use watch mode during development
7. **Coverage Tracking**: Aim for high test coverage

### 6. Example TDD Session

1. Write failing test for currency formatter
2. Run `npm run test:watch`
3. See RED (test fails)
4. Implement minimal currency formatter
5. See GREEN (test passes)
6. Refactor for better code quality
7. Add edge case tests
8. Repeat cycle

### 7. Integration with Development

- **No code without tests** (except trivial config)
- **Commit tests with implementation**
- **Use tests as documentation**
- **Refactor confidently with test coverage**

Remember: TDD is about **design** and **confidence**, not just testing!