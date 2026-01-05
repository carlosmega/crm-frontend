# Testing Guide - CRM Sales Application

## Overview

This project uses **Vitest** as the testing framework for unit and integration tests. Vitest was chosen for its speed, excellent TypeScript support, and seamless integration with Next.js.

## Test Infrastructure

### Framework & Libraries

- **Vitest 4.0.16** - Fast unit test framework (2-5x faster than Jest)
- **@testing-library/react 16.3.1** - React component testing utilities
- **@testing-library/jest-dom 6.9.1** - Custom matchers for DOM assertions
- **@testing-library/user-event 14.6.1** - User interaction simulation
- **@vitest/coverage-v8** - Code coverage reporting
- **jsdom 27.4.0** - DOM simulation for testing

### Configuration Files

- **vitest.config.ts** - Vitest configuration (environment, coverage, aliases)
- **src/test/setup.ts** - Global test setup (mocks for matchMedia, IntersectionObserver)
- **tsconfig.json** - TypeScript types for Vitest globals

## Running Tests

```bash
# Run tests in watch mode (re-runs on file changes)
npm test

# Run tests once (for CI/CD)
npm run test:run

# Run tests with UI dashboard
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

Tests follow the standard Vitest/Jest structure with `describe` and `it` blocks:

```typescript
describe('Feature Name', () => {
  it('should do something specific', () => {
    // Arrange
    const input = 'test'

    // Act
    const result = myFunction(input)

    // Assert
    expect(result).toBe('expected')
  })
})
```

## Current Test Coverage

### ✅ Fully Tested (100% Coverage)

#### 1. Formatters (`src/shared/utils/formatters.ts`)
50 tests covering 7 functions:
- `formatCurrency()` - EUR currency formatting
- `formatDate()` - Locale-aware date formatting
- `formatDateTime()` - Date with time formatting
- `formatPercent()` - Percentage formatting
- `formatNumber()` - Number formatting with Spanish locale
- `formatPhone()` - Spanish phone number formatting
- `truncateText()` - Text truncation with ellipsis

**Key test cases:**
- Valid inputs (positive/negative numbers, dates, strings)
- Null/undefined handling (returns "-")
- Edge cases (zero, large numbers, invalid dates)
- Locale-specific formatting (Spanish number separators)

#### 2. Debounced Value Hook (`src/shared/hooks/use-debounced-value.ts`)
9 tests covering:
- Initial value rendering
- Value debouncing with custom delay
- Timer reset on rapid changes
- Default 300ms delay
- Different value types (string, number, boolean, object)

**Key test cases:**
- Immediate initial value
- Delayed updates after specified time
- Timer resets on new value changes
- Works with all value types

#### 3. Lead Scoring Service (`src/features/leads/services/lead-scoring-service.ts`)
46 tests covering the complete BANT scoring system:

**Source Scoring (max 25 points):**
- Partner (20), External Referral (18), Word of Mouth (16)
- Employee Referral (15), Web (7), Other (3)

**Engagement Scoring (max 25 points):**
- Emails (3 points each, max 6)
- Phone calls (8 points each, max 16)
- Meetings (10 points each, max 20)
- Form submissions (4 points each, max 8)
- Score capping at 25 points

**Fit Scoring (max 25 points):**
- Location matching
- Ideal customer profile matching

**BANT Scoring (max 25 points):**
- Budget status (Will Buy: 8, Can Buy: 6, May Buy: 4, No Budget: 0)
- Authority level (Decision Maker: 6, Influencer: 3, End User: 0)
- Need urgency (Urgent: 6, Identified: 4)
- Purchase timeframe (Immediate: 5, This Quarter: 4, Next Quarter: 3, This Year: 2)

**Quality Classification:**
- HOT lead: 80-100 points
- WARM lead: 50-79 points
- COLD lead: 0-49 points

**Auto-update functionality:**
- Updates lead quality code based on score
- Preserves all other lead properties

## Testing Patterns & Best Practices

### 1. Testing Utility Functions

```typescript
import { formatCurrency } from '../formatters'

describe('formatCurrency', () => {
  it('should format positive numbers as EUR currency', () => {
    const result = formatCurrency(1500.5)
    expect(result).toContain('€')
    expect(result).toContain('1')
    expect(result).toContain('500')
  })

  it('should return "-" for null/undefined', () => {
    expect(formatCurrency(null)).toBe('-')
    expect(formatCurrency(undefined)).toBe('-')
  })
})
```

**Tips:**
- Use flexible assertions (`toContain`) for locale-specific formatting
- Always test null/undefined handling
- Test edge cases (zero, negative, very large numbers)

### 2. Testing React Hooks

```typescript
import { renderHook, act } from '@testing-library/react'
import { useDebouncedValue } from '../use-debounced-value'

describe('useDebouncedValue', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 300),
      { initialProps: { value: 'initial' } }
    )

    rerender({ value: 'updated' })
    expect(result.current).toBe('initial')

    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(result.current).toBe('updated')
  })
})
```

**Tips:**
- Use `vi.useFakeTimers()` for testing time-dependent hooks
- Wrap timer advancement in `act()` for React state updates
- Don't use `async/await` with fake timers - use `act()` instead
- Always restore real timers in `afterEach()`

### 3. Testing Business Logic Services

```typescript
import { calculateLeadScore } from '../lead-scoring-service'
import { LeadSourceCode, BudgetStatusCode } from '@/core/contracts/enums'

describe('calculateLeadScore', () => {
  it('should give 20 points for Partner source', () => {
    const result = calculateLeadScore({
      leadsourcecode: LeadSourceCode.Partner,
    })
    expect(result.sourceScore).toBe(20)
    expect(result.reasoning.join(' ')).toContain('Partner')
  })

  it('should classify as WARM lead (50-79 points)', () => {
    const result = calculateLeadScore(
      {
        leadsourcecode: LeadSourceCode.External_Referral, // 18
        budgetstatus: BudgetStatusCode.Can_Buy, // 6
        jobtitle: 'Director', // 6
        purchasetimeframe: PurchaseTimeframeCode.This_Quarter, // 4
        address1_country: 'Spain',
      },
      {
        activityCount: {
          emails: 2, // 6
          phoneCalls: 2, // 16
        },
        idealProfile: {
          preferredCountries: ['Spain'], // 5
        },
      }
    )

    expect(result.totalScore).toBeGreaterThanOrEqual(50)
    expect(result.totalScore).toBeLessThan(80)
    expect(result.quality).toBe(LeadQualityCode.Warm)
  })
})
```

**Tips:**
- Test individual components of complex logic separately
- Test score calculations with clear arithmetic comments
- Verify both numerical scores and quality classifications
- Test boundary conditions (49 vs 50, 79 vs 80)
- Check reasoning arrays for expected keywords

## Common Testing Scenarios

### Testing with Fake Timers

```typescript
beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

it('should debounce correctly', () => {
  // Use act() to wrap timer advancement
  act(() => {
    vi.advanceTimersByTime(300)
  })

  // Don't use waitFor() with fake timers
  expect(result.current).toBe('updated')
})
```

### Testing Enums and Constants

```typescript
import { LeadSourceCode } from '@/core/contracts/enums'

it('should use correct enum values', () => {
  const lead = {
    leadsourcecode: LeadSourceCode.Partner,
  }

  expect(lead.leadsourcecode).toBe(3) // Partner = 3
})
```

### Testing Arrays and Objects

```typescript
it('should provide detailed reasoning', () => {
  const result = calculateLeadScore({
    leadsourcecode: LeadSourceCode.Partner,
  })

  // Check array contains specific strings
  expect(result.reasoning).toContain('--- SOURCE SCORE ---')

  // Check if any element matches a pattern
  const hasTotal = result.reasoning.some(line =>
    line.startsWith('TOTAL SCORE:')
  )
  expect(hasTotal).toBe(true)
})
```

## Test Organization

Tests are located alongside the code they test in `__tests__` directories:

```
src/
├── shared/
│   ├── utils/
│   │   ├── __tests__/
│   │   │   └── formatters.test.ts
│   │   └── formatters.ts
│   └── hooks/
│       ├── __tests__/
│       │   └── use-debounced-value.test.ts
│       └── use-debounced-value.ts
└── features/
    └── leads/
        └── services/
            ├── __tests__/
            │   └── lead-scoring-service.test.ts
            └── lead-scoring-service.ts
```

## Coverage Goals

### Target Coverage (Medium Coverage Strategy)

- **Utilities**: >80% (formatters, helpers, validators)
- **Services**: >70% (business logic, scoring, calculations)
- **Hooks**: >60% (critical hooks only)
- **Overall**: >60% (realistic for medium coverage)

### Current Achievement ✅

**Overall Coverage: 76.81%** (exceeds 60% target by +16%)

#### Fully Tested Files (100% coverage):
- ✅ **formatters.ts**: 100% (50 tests)
- ✅ **use-debounced-value.ts**: 100% (9 tests)
- ✅ **toast-error-handler.ts**: 100% (18 tests)
- ✅ **use-lead-mutations.ts**: 100% (18 tests)
- ✅ **sales-stage.ts**: 100% (28 tests)

#### Near-Perfect Coverage:
- ✅ **quote-calculations.ts**: 98.55% (82 tests)
- ✅ **lead-scoring-service.ts**: 98.37% (46 tests)
- ✅ **permissions.ts**: 95.83% (43 tests)

#### Coverage by Category:
- **Utilities**: 100% (exceeds >80% target)
- **Services**: 98.37% (exceeds >70% target)
- **Hooks**: 100% (exceeds >60% target)
- **Security**: 95.83%
- **Overall**: 76.81% (294 tests passing)

## Test Files Created

### Phase 1 - Completed ✅

#### High Priority (Completed)
- ✅ **Quote calculations** - 82 tests (`features/quotes/utils/__tests__/quote-calculations.test.ts`)
  - Line amount calculations (base, extended, with discounts/tax)
  - Discount conversions (percentage ↔ amount)
  - Tax calculations and quote totals
  - Profit margins and date validations

- ✅ **Permissions system** - 43 tests (`core/contracts/security/__tests__/permissions.test.ts`)
  - 5 user roles (Admin, Sales Manager, Sales Rep, Customer Service, Marketing)
  - 4 access levels (None, User, Team, Organization)
  - Record ownership validation

- ✅ **Sales stage** - 28 tests (`core/contracts/enums/__tests__/sales-stage.test.ts`)
  - State transitions (Qualify → Develop → Propose → Close)
  - Probability mapping (25% → 50% → 75% → 0%/100%)
  - Forward/backward flows

#### Medium Priority (Completed)
- ✅ **Toast error handler** - 18 tests (`shared/utils/__tests__/toast-error-handler.test.ts`)
  - API error handling and display
  - CDS field name formatting (25 fields: emailaddress1 → Email, etc.)
  - CamelCase formatting for custom fields

- ✅ **Lead mutations hook** - 18 tests (`features/leads/hooks/__tests__/use-lead-mutations.test.ts`)
  - CRUD operations (create, update, delete, disqualify)
  - Error handling (validation, not found, generic)
  - State management (loading, error reset)

### Future Expansion (Optional)

#### Hooks (Low Priority)
- [ ] Locale formatters hook tests (~15-20 assertions)
- [ ] Sales stage hook tests (~15-20 assertions)
- [ ] Opportunity mutations hook tests (~20-25 assertions)

#### Components (Low Priority)
- [ ] Form component tests
- [ ] DataTable component tests
- [ ] Business Process Flow tests

#### Advanced (Optional)
- [ ] E2E tests with Playwright
- [ ] Visual regression tests
- [ ] Performance tests

## Continuous Integration

For CI/CD pipelines, use:

```bash
npm run test:run       # Run all tests once
npm run test:coverage  # Generate coverage report
```

Coverage reports are generated in:
- **HTML**: `coverage/index.html` (open in browser)
- **JSON**: `coverage/coverage-final.json`
- **Text**: Console output

## Troubleshooting

### Common Issues

**Tests timing out:**
- Don't use `waitFor()` with fake timers
- Use `act()` instead for timer advancement
- Check test timeout in `vitest.config.ts` (default: 5000ms)

**Fake timer issues:**
- Always call `vi.useFakeTimers()` in `beforeEach()`
- Always restore with `vi.useRealTimers()` in `afterEach()`
- Wrap timer calls in `act()`

**Locale formatting differences:**
- Use flexible assertions (`toContain`) instead of exact matches
- Spanish locale uses `.` for thousands, `,` for decimals
- Non-breaking space (`\u00a0`) appears in formatted outputs

**Import path issues:**
- Ensure `@/` alias is configured in `vitest.config.ts`
- Check `tsconfig.json` has correct path mappings

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library React](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Library Jest-DOM Matchers](https://github.com/testing-library/jest-dom)

---

**Last Updated**: 2025-12-29
**Test Count**: 294 passing (189 new tests added)
**Coverage**: 76.81% overall (exceeds 60% target)
