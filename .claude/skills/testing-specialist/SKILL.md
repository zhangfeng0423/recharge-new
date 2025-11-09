---
name: testing-specialist
description: Automated Quality Gateway specialist for Next.js projects that sets up test environments, generates and runs Vitest unit tests, RTL component tests, and Playwright E2E tests. Use automatically when testing, validating code quality, linting, running pnpm test, or any quality assurance tasks are needed.
---

# Testing Specialist

## Overview

Comprehensive automated quality assurance specialist that implements a two-stage quality gateway for Next.js projects. Masters test environment setup, unit testing, component testing, and end-to-end testing with modern tools including Vitest, React Testing Library, and Playwright.

## Automated Quality Gateway (AQG)

This skill implements a mandatory two-stage validation process for all code changes:

### Stage 1: Static Analysis Gate
- **Code Formatting**: Biome formatting verification
- **Linting**: Code quality and standards enforcement
- **Type Checking**: TypeScript compilation validation

### Stage 2: Dynamic Analysis Gate
- **Test Generation**: Automated test creation based on code context
- **Test Execution**: Running appropriate test suites
- **Coverage Analysis**: Ensuring comprehensive test coverage

## Workflow Decision Tree

```
Quality Validation Request
├─ Is test environment initialized?
│  ├─ No → Run setup-vitest.sh script
│  └─ Yes → Continue to Stage 1
│
├─ Stage 1: Static Analysis
│  ├─ Run pnpm format (Biome)
│  ├─ Run pnpm lint (Biome)
│  └─ Run pnpm typecheck (TypeScript)
│
├─ Did Static Analysis pass?
│  ├─ No → STOP and report failures
│  └─ Yes → Continue to Stage 2
│
├─ Stage 2: Dynamic Analysis
│  ├─ Analyze code type (RLS? Server Action? RSC?)
│  ├─ Load appropriate testing template
│  ├─ Generate test file
│  └─ Run specific tests
│
└─ Did Dynamic Analysis pass?
   ├─ No → STOP and report test failures
   └─ Yes → SUCCESS - validation complete
```

## Core Testing Patterns

### Pattern 1: RLS Policy Testing
**Trigger**: RLS (Row Level Security) SQL code was delivered

**Action**:
1. Load `references/3_rls_testing.md` template
2. Generate RLS test file (e.g., `tests/rls.test.ts`)
3. Simulate role-based access (e.g., 'Merchant' role)
4. Verify data access restrictions
5. Assert proper policy enforcement

**Example Structure**:
```typescript
// tests/rls.test.ts
import { createClient } from '@supabase/supabase-js'
import { describe, it, expect, beforeEach } from 'vitest'

describe('Row Level Security Policies', () => {
  let supabase: any

  beforeEach(async () => {
    // Setup test environment with service role
    supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  })

  it('should only allow merchants to access their own games', async () => {
    // Simulate merchant JWT token
    const merchantToken = generateMockJWT({ role: 'merchant', merchant_id: 'merchant_123' })

    // Test data access with simulated auth
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('merchant_id', 'merchant_123')

    expect(error).toBeNull()
    expect(data).toHaveLength(expectedGameCount)
  })
})
```

### Pattern 2: Server Action Testing
**Trigger**: Server Action code was delivered (e.g., `payment.actions.ts`)

**Action**:
1. Load `references/2_server_action_testing.md` template
2. Generate Server Action test file (e.g., `tests/payment.action.test.ts`)
3. Mock all external SDKs (Stripe, Supabase) using `vi.mock`
4. Test action input validation with Zod schemas
5. Test business logic and error handling

**Example Structure**:
```typescript
// tests/payment.action.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPaymentIntent } from '../actions/payment.actions'
import { z } from 'zod'

// Mock external dependencies
vi.mock('@stripe/stripe-js', () => ({
  loadStripe: vi.fn()
}))

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn()
      }))
    }))
  }))
}))

describe('Payment Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create payment intent with valid data', async () => {
    const validInput = {
      amount: 1000,
      currency: 'usd',
      payment_method_id: 'pm_123456789'
    }

    const result = await createPaymentIntent(validInput)

    expect(result.success).toBe(true)
    expect(result.data).toHaveProperty('client_secret')
  })

  it('should reject invalid payment data', async () => {
    const invalidInput = {
      amount: -100, // Invalid amount
      currency: 'invalid',
      payment_method_id: ''
    }

    const result = await createPaymentIntent(invalidInput)

    expect(result.success).toBe(false)
    expect(result.error).toHaveProperty('validation_errors')
  })
})
```

### Pattern 3: React Component Testing
**Trigger**: React Component was delivered (e.g., `AdminDashboard`)

**Action**:
1. Load `references/1_component_testing.md` template
2. Generate component test file (e.g., `tests/AdminDashboard.test.tsx`)
3. Mock RSC data-fetching functions
4. Test component rendering and user interactions
5. Use `await render(...)` and `findBy...` for async UI

**Example Structure**:
```typescript
// tests/AdminDashboard.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { AdminDashboard } from '../components/AdminDashboard'

// Mock data fetching functions
vi.mock('../lib/data', () => ({
  getDashboardData: vi.fn(() => Promise.resolve({
    totalUsers: 100,
    activeUsers: 75,
    revenue: 5000
  }))
}))

describe('AdminDashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render dashboard with data', async () => {
    await render(<AdminDashboard />)

    // Wait for async data loading
    await waitFor(() => {
      expect(screen.getByText('Total Users')).toBeInTheDocument()
      expect(screen.getByText('100')).toBeInTheDocument()
    })
  })

  it('should handle loading state', async () => {
    const { getByTestId } = await render(<AdminDashboard />)

    // Check loading indicator exists initially
    expect(getByTestId('loading-spinner')).toBeInTheDocument()

    // Wait for loading to complete
    await waitFor(() => {
      expect(getByTestId('loading-spinner')).not.toBeInTheDocument()
    })
  })
})
```

### Pattern 4: End-to-End Testing
**Trigger**: Complete user flow or critical path needs validation

**Action**:
1. Load `references/4_e2e_testing.md` template
2. Generate Playwright E2E test file
3. Test complete user journeys
4. Inject Supabase Auth state for authenticated flows
5. Validate UI interactions and backend integrations

**Example Structure**:
```typescript
// tests/e2e/checkout-flow.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Inject authentication state
    await page.goto('/auth/signin')
    await page.fill('[data-testid="email"]', 'test@example.com')
    await page.fill('[data-testid="password"]', 'password123')
    await page.click('[data-testid="signin-button"]')
    await expect(page).toHaveURL('/dashboard')
  })

  test('should complete purchase flow', async ({ page }) => {
    // Navigate to product
    await page.goto('/products/123')

    // Add to cart
    await page.click('[data-testid="add-to-cart"]')

    // Proceed to checkout
    await page.click('[data-testid="checkout-button"]')

    // Fill payment details (using test card)
    await page.fill('[data-testid="card-number"]', '4242424242424242')
    await page.fill('[data-testid="card-expiry"]', '12/25')
    await page.fill('[data-testid="card-cvc"]', '123')

    // Complete purchase
    await page.click('[data-testid="complete-purchase"]')

    // Verify success
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible()
    await expect(page).toHaveURL('/purchase-success')
  })
})
```

## Test Environment Setup

### Automated Setup Scripts
**Location**: `scripts/`

**`setup-vitest.sh`**:
- **Purpose**: One-click test environment initialization for Vitest and Playwright.
- **Features**:
  - Installs all necessary testing dependencies (`vitest`, `testing-library`, `playwright`).
  - Generates configuration files (`vitest.config.ts`, `playwright.config.ts`).
  - Adds test scripts (`test`, `test-e2e`) to `package.json`.
  - Non-interactive and suitable for automation.

**`test-env-manager.ts`**:
- **Purpose**: Provides a centralized way to manage the state of the test database.
- **Features**:
  - `seed`: Populates the test database with a consistent, predefined set of data (users, games, etc.).
  - `cleanup`: Wipes all test data to ensure a clean state before test runs.
  - `generate-jwt`: Creates mock JWTs for specific user roles to test RLS policies and authenticated endpoints.

### Configuration Templates

**Vitest Configuration** (`assets/vitest.config.ts.template`):
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*'
      ]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './')
    }
  }
})
```

**Test Setup** (`assets/tests.setup.ts.template`):
```typescript
import '@testing-library/jest-dom'
import { beforeAll, afterEach, afterAll } from 'vitest'
import { cleanup } from '@testing-library/react'
import { server } from './src/mocks/server'

// Setup MSW server
beforeAll(() => server.listen())
afterEach(() => {
  server.resetHandlers()
  cleanup()
})
afterAll(() => server.close())

// Mock Next.js router
vi.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: '',
      asPath: '',
      push: vi.fn(),
      pop: vi.fn(),
      reload: vi.fn(),
      back: vi.fn(),
      prefetch: vi.fn().mockResolvedValue(undefined),
      beforePopState: vi.fn(),
      events: {
        on: vi.fn(),
        off: vi.fn(),
        emit: vi.fn(),
      },
    }
  },
}))

// Mock environment variables
process.env.NODE_ENV = 'test'
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'
```

## Test Data Management
The `test-env-manager.ts` script is critical for maintaining reliable and repeatable tests. It ensures that every test run starts from a known state.

**Workflow Integration**:
1.  **Before E2E/RLS tests**: Run `tsx ./scripts/test-env-manager.ts seed` to ensure the database is in a predictable state.
2.  **For Auth tests**: Run `tsx ./scripts/test-env-manager.ts generate-jwt --userId <uuid> --role MERCHANT` to get a token for testing specific permissions.
3.  **In CI/CD pipelines**: The `cleanup` and `seed` commands should be used to prepare the test environment before the test suite is executed.


## Quality Assurance Best Practices

### 1. Black Box Script Execution
- Treat setup scripts as black boxes
- Use `--help` flags for usage information
- Don't read script source code to save context
- Trust script execution and error handling

### 2. Test Security, Not Just UI
- Test RLS policies at database level
- Validate authentication and authorization
- Test API security and input validation
- Don't just test if buttons are hidden

### 3. Progressive Disclosure
- Load reference files only when needed
- Maintain minimal context for better performance
- Use templates for consistent test patterns
- Focus on specific testing scenarios

### 4. Mock Strategy
```typescript
// Proper mocking patterns for different scenarios

// Mock external APIs completely
vi.mock('@stripe/stripe-js', () => ({
  loadStripe: vi.fn(() => Promise.resolve({
    confirmCardPayment: vi.fn(() => Promise.resolve({ paymentIntent: { id: 'pi_test' } }))
  }))
}))

// Mock database operations
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: mockData, error: null }))
        }))
      }))
    }))
  }
}))

// Mock environment variables
vi.mock('@/lib/env', () => ({
  env: {
    NEXT_PUBLIC_API_URL: 'http://localhost:3000',
    STRIPE_SECRET_KEY: 'sk_test_123'
  }
}))
```

## Error Handling and Reporting

### Validation Failure Reporting
**Stage 1 Failures**:
```
Validation FAILED at Stage 1 (Static Analysis)
Errors:
- Biome lint error: Unexpected semicolon (lint/semicolon)
- TypeScript error: Property 'user' does not exist on type 'Session' (2329)
```

**Stage 2 Failures**:
```
Validation FAILED at Stage 2 (Dynamic Analysis)
Test failures:
❌ Payment Action Tests (2/3 failed)
  - should handle invalid payment data: Expected validation error
  - should create payment intent: Timeout - promise rejected
✅ Component Tests (3/3 passed)
```

### Success Reporting
```
Validation complete: Lint, Types, and Tests all passed for this task.
✅ Static Analysis: 0 lint errors, 0 type errors
✅ Dynamic Analysis: 15/15 tests passed (95% coverage)
```

## Reference Files Structure

### `references/1_component_testing.md`
- RSC and Client Component testing templates
- Data fetching mock patterns
- Async UI testing strategies
- Component interaction testing

### `references/2_server_action_testing.md`
- Server Action testing templates
- Zod validation testing patterns
- External SDK mocking strategies
- Error handling test cases

### `references/3_rls_testing.md`
- RLS policy testing templates
- Authentication simulation patterns
- Database access control testing
- Role-based permission testing

### `references/4_e2e_testing.md`
- Playwright testing templates
- Supabase Auth state injection
- User journey testing patterns
- Cross-browser testing strategies

---

This skill implements automated quality assurance as a mandatory gateway, ensuring all code changes meet quality standards before being accepted. The two-stage approach provides both immediate feedback (static analysis) and comprehensive validation (dynamic testing).