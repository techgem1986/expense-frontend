import { test, expect } from './fixtures/test-fixtures';

// Test data for recurring transaction
const RECURRING_DATA = {
  name: `Test Recurring ${Date.now()}`,
  amount: '50.00',
  frequency: 'MONTHLY',
  startDate: new Date().toISOString().split('T')[0],
  type: 'EXPENSE' as const,
};

test.describe('Recurring Transactions', () => {
  // Skip all tests that require authentication/backend
  test.skip('should display next execution date for recurring transactions', () => {
    // Requires backend API for authentication
  });

  test.skip('should show correct next execution date after creating recurring transaction', () => {
    // Requires backend API for authentication
  });
});
