# Playwright E2E Test Suite

This directory contains the comprehensive end-to-end (E2E) regression test suite for the Expense Management System frontend, built with [Playwright](https://playwright.dev/).

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running Tests](#running-tests)
- [Test Structure](#test-structure)
- [Page Object Model](#page-object-model)
- [Test Coverage](#test-coverage)
- [Configuration](#configuration)
- [CI/CD Integration](#cicd-integration)
- [Troubleshooting](#troubleshooting)

## Overview

The test suite covers all major features of the Expense Management System:

- **Authentication**: Login, Register, Logout, Protected Routes
- **Categories**: Create, Read, Update, Delete (CRUD) operations
- **Transactions**: CRUD operations for income and expense transactions
- **Budgets**: Budget management with period tracking
- **Recurring Transactions**: Automated recurring transaction management
- **Dashboard/Analytics**: Data visualization and date filtering
- **Alerts**: Alert management and notifications

## Prerequisites

- Node.js 18+ 
- npm or yarn
- A running instance of the Expense Management frontend (default: `http://localhost:3000`)
- A running instance of the Expense Management backend API (for integration tests)

## Installation

1. Install Playwright browsers:

```bash
npx playwright install
```

2. Install Chromium system dependencies (Linux only):

```bash
npx playwright install-deps chromium
```

3. Ensure the frontend application is running:

```bash
npm start
```

## Running Tests

### Run all tests (headless)

```bash
npm run test:e2e
```

### Run tests with UI mode (interactive)

```bash
npm run test:e2e:ui
```

### Run tests in headed mode (visible browser)

```bash
npm run test:e2e:headed
```

### Run tests in debug mode

```bash
npm run test:e2e:debug
```

### Run specific test file

```bash
npx playwright test tests/auth.spec.ts
```

### Run tests by tag

```bash
npx playwright test --grep @smoke
```

### Generate and view HTML report

```bash
npx playwright show-report
```

## Test Structure

```
tests/
├── pages/                    # Page Object Models
│   ├── base.page.ts          # Base page with common methods
│   ├── login.page.ts         # Login page
│   ├── register.page.ts      # Register page
│   ├── dashboard.page.ts     # Dashboard page
│   ├── categories.page.ts    # Categories page
│   ├── transactions.page.ts  # Transactions page
│   ├── budgets.page.ts       # Budgets page
│   ├── recurring.page.ts     # Recurring transactions page
│   └── alerts.page.ts        # Alerts page
├── fixtures/                 # Test fixtures and utilities
│   └── test-fixtures.ts      # Custom fixtures, test data, and extended test object
├── auth.spec.ts              # Authentication tests
├── categories.spec.ts        # Category management tests
├── transactions.spec.ts      # Transaction management tests
├── budgets.spec.ts           # Budget management tests
├── recurring.spec.ts         # Recurring transaction tests
├── dashboard.spec.ts         # Dashboard/Analytics tests
├── alerts.spec.ts            # Alerts tests
└── README.md                 # This file
```

## Page Object Model

Each page in the application has a corresponding Page Object class that encapsulates:

- **Locators**: Selectors for UI elements
- **Actions**: Methods to interact with the page
- **Assertions**: Methods to verify page state

Example usage:

```typescript
import { test, expect } from './fixtures/test-fixtures';

test('should login successfully', async ({ loginPage, page }) => {
  await loginPage.goto();
  await loginPage.login('user@example.com', 'password123');
  await expect(page).toHaveURL(/\/dashboard/);
});
```

## Test Coverage

### Authentication Tests (`auth.spec.ts`)
- Login page display
- Login with valid/invalid credentials
- Login validation errors
- Register page display
- Registration with valid/invalid data
- Registration validation errors
- Logout functionality
- Protected route redirects

### Categories Tests (`categories.spec.ts`)
- Display categories page
- Create expense/income categories
- Edit categories
- Delete categories
- Cancel operations
- Validation errors

### Transactions Tests (`transactions.spec.ts`)
- Display transactions page
- Create expense/income transactions
- Edit transactions
- Delete transactions
- Cancel operations
- Amount formatting
- Validation errors

### Budgets Tests (`budgets.spec.ts`)
- Display budgets page
- Create budgets
- Edit budgets
- Delete budgets
- Budget status display
- Budget progress tracking
- Different budget periods

### Recurring Transactions Tests (`recurring.spec.ts`)
- Display recurring transactions page
- Create recurring transactions
- Edit recurring transactions
- Delete recurring transactions
- Different frequencies (daily, weekly, monthly, yearly)
- Status display

### Dashboard Tests (`dashboard.spec.ts`)
- Display dashboard with metrics
- Date range filtering
- Charts visibility
- Data updates after transactions
- Navigation

### Alerts Tests (`alerts.spec.ts`)
- Display alerts page
- Mark alerts as read
- Delete alerts
- Alert status display

## Configuration

The Playwright configuration is defined in `playwright.config.ts`:

```typescript
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list']
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  outputDir: 'test-results/',
});
```

### Environment Variables

- `BASE_URL`: The base URL of the application (default: `http://localhost:3000`)
- `CI`: Set to `true` when running in CI environment

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm run build
      - run: npm run test:e2e
        env:
          CI: true
```

## Troubleshooting

### Tests fail with "page not found" errors
- Ensure the frontend application is running on the correct port
- Check the `BASE_URL` environment variable

### Tests fail with timeout errors
- Increase the timeout in `playwright.config.ts`
- Check if the application is responding slowly
- Consider adding explicit waits in page objects

### Tests fail with element not found errors
- Check if the selectors in page objects are still valid
- The application UI may have changed
- Use `--debug` mode to inspect the page

### Browser-specific failures
- Run tests with `--headed` to see what's happening
- Check browser console logs in the trace viewer

### Viewing test artifacts

After a test run, you can view:

- **HTML Report**: `npx playwright show-report`
- **Trace Viewer**: Click the trace link in the HTML report
- **Screenshots**: Located in `test-results/` directory
- **Videos**: Located in `test-results/` directory

## Contributing

When adding new tests:

1. Create a new Page Object if testing a new page
2. Follow the existing naming conventions
3. Use meaningful test descriptions
4. Clean up test data after tests (or use unique names)
5. Add tests to the appropriate spec file or create a new one
6. Update this README with new test coverage

## License

ISC