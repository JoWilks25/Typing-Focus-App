# Testing Guide

This guide covers the testing setup and best practices for the Typing Focus App.

## Overview

The project uses **Vitest** as the unified test framework for all layers (main, preload, renderer) with **React Testing Library** for component testing.

## Test Structure

```
tests/
├── main/                    # Main process tests
│   ├── services/           # Service layer tests
│   ├── handlers/           # IPC handler tests
│   └── bootstrap.test.ts   # Bootstrap tests
├── preload/                # Preload script tests
│   ├── api.test.ts         # API tests
│   └── type-validation.test.ts # Type validation tests
├── renderer/               # Renderer process tests
│   ├── src/utils/          # Utility tests
│   └── context/            # Context tests
└── setup.ts                # Global test setup
```

## Running Tests

### Basic Commands

```bash
# Run all tests
npm run test

# Run tests with coverage report
npm run test:coverage

# Run tests in watch mode (for development)
npm run test:watch

# Run tests with UI interface
npm run test:ui
```

### Coverage Requirements

- **80%+ coverage** required for business logic
- **100% coverage** for critical services and utilities
- Coverage reports generated in `coverage/` directory

## Test Types

### 1. Main Process Tests

Located in `/tests/main/`, these test the Electron main process:

- **Services** (`/tests/main/services/`) - Test business logic and data operations
- **Handlers** (`/tests/main/handlers/`) - Test IPC communication handlers
- **Bootstrap** (`/tests/main/bootstrap.test.ts`) - Test application initialization

Example:
```typescript
// tests/main/services/SessionService.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { SessionService } from '../../../src/main/services/sessionService';

describe('SessionService', () => {
  let sessionService: SessionService;

  beforeEach(() => {
    sessionService = new SessionService();
  });

  it('should create a new session', () => {
    const session = sessionService.startSession('Test Session');
    expect(session.name).toBe('Test Session');
    expect(session.status).toBe('active');
  });
});
```

### 2. Preload Tests

Located in `/tests/preload/`, these test the preload scripts:

- **API Tests** - Test exposed Electron APIs
- **Type Validation** - Test type safety and validation

### 3. Renderer Tests

Located in `/tests/renderer/`, these test the React frontend:

- **Component Tests** - Test React components with React Testing Library
- **Hook Tests** - Test custom React hooks
- **Utility Tests** - Test frontend utility functions
- **Context Tests** - Test React context providers

Example:
```typescript
// tests/renderer/src/utils/wordCount.test.ts
import { describe, it, expect } from 'vitest';
import { countWords } from '../../../../src/renderer/src/utils/wordCount';

describe('wordCount utilities', () => {
  it('should count words correctly', () => {
    const result = countWords('Hello world');
    expect(result.words).toBe(2);
    expect(result.characters).toBe(11);
  });
});
```

## Test Utilities

### React Component Testing

Use the custom render function from `test-utils.tsx`:

```typescript
import { render, screen } from '@testing-library/react';
import { render as customRender } from '../../../utils/test-utils';
import MyComponent from '../../../../src/renderer/src/components/MyComponent';

describe('MyComponent', () => {
  it('should render with providers', () => {
    customRender(<MyComponent />, {
      initialAppState: { currentView: 'session-setup' },
      initialSessionState: { sessions: [] }
    });
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
});
```

### Mocking

Global mocks are set up in `/tests/setup.ts`:

- **Electron APIs** - All Electron APIs are mocked
- **UUID** - Generates predictable test IDs
- **LocalStorage** - Mocked for consistent testing
- **DOM APIs** - ResizeObserver, IntersectionObserver, etc.

## Best Practices

### 1. Test Organization

- Group related tests in `describe` blocks
- Use descriptive test names that explain the expected behavior
- Keep tests focused on single functionality

### 2. Mocking Strategy

- Mock external dependencies (Electron APIs, file system, etc.)
- Use real implementations for business logic
- Mock at the boundary of your system

### 3. Coverage Guidelines

- **Must test**: Services, utilities, business logic, error handling
- **Optional**: UI components, styling, integration tests
- **Focus on**: Critical paths and edge cases

### 4. Test Data

- Use factories for creating test data
- Keep test data minimal and focused
- Use meaningful test data that reflects real usage

Example:
```typescript
// Helper function for creating test sessions
export const createMockSession = (overrides = {}) => ({
  id: 'test-session-1',
  title: 'Test Session',
  content: 'Test content',
  createdAt: new Date('2024-01-01'),
  ...overrides
});
```

## Debugging Tests

### Running Specific Tests

```bash
# Run tests matching a pattern
npm run test -- --grep "SessionService"

# Run tests in a specific file
npm run test tests/main/services/SessionService.test.ts

# Run tests in watch mode for a specific file
npm run test:watch tests/main/services/SessionService.test.ts
```

### Debug Mode

```bash
# Run tests with debug output
npm run test -- --reporter=verbose

# Run tests with UI for debugging
npm run test:ui
```

## Continuous Integration

Tests run automatically on:
- Pull requests
- Main branch pushes
- Release builds

Coverage reports are generated and can be viewed in the CI environment.

## Troubleshooting

### Common Issues

1. **Import errors**: Ensure test files use correct relative paths to source files
2. **Mock issues**: Check that mocks are properly set up in `setup.ts`
3. **Coverage issues**: Verify that files are included in coverage configuration
4. **Type errors**: Ensure test files have proper TypeScript configuration

### Getting Help

- Check existing tests for examples
- Review the test utilities in `/tests/renderer/src/utils/test-utils.tsx`
- Consult the Vitest documentation for advanced features
- Ask the team for help with complex testing scenarios
