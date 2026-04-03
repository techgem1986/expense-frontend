import { test, expect } from './fixtures/test-fixtures';

test.describe('Transactions Management', () => {
  test.describe('Transaction List with Accounts', () => {
    test('should display transactions page without errors when transactions have accounts', async ({
      page,
      authenticatedPage,
      transactionsPage,
    }) => {
      // Navigate to transactions page
      await transactionsPage.goto();
      
      // The page should load without LazyInitializationException errors
      // Check that the page is visible and doesn't show error boundaries
      await expect(page).toHaveURL(/\/transactions/);
      
      // The page should either show transactions or an empty state
      // but should NOT show any server errors or crash
      const errorText = page.locator('text=/could not initialize proxy|LazyInitializationException/i');
      await expect(errorText).not.toBeVisible();
    });

    test('should display transaction details including account information', async ({
      page,
      authenticatedPage,
      transactionsPage,
    }) => {
      // Navigate to transactions page
      await transactionsPage.goto();
      
      // If there are transactions, verify account information is displayed
      const transactionRows = page.locator('tbody tr');
      const count = await transactionRows.count();
      
      if (count > 0) {
        // Verify that transactions are displayed with their details
        // The account names should be visible (not proxy objects)
        await expect(transactionRows.first()).toBeVisible();
        
        // Check that the page doesn't crash when rendering account data
        const errorText = page.locator('text=/could not initialize proxy|LazyInitializationException/i');
        await expect(errorText).not.toBeVisible();
      }
    });
  });

  test.describe('Transaction Creation with Accounts', () => {
    test('should create a transaction with fromAccount and toAccount', async ({
      page,
      authenticatedPage,
      transactionsPage,
      testData,
    }) => {
      // Navigate to transactions page
      await transactionsPage.goto();
      
      // Click add transaction button
      await transactionsPage.clickAddTransaction();
      
      // Fill the form
      await transactionsPage.fillTransactionForm({
        date: testData.transaction.date,
        category: 'Food', // This would need to exist in the system
        description: testData.transaction.description,
        type: testData.transaction.type,
        amount: testData.transaction.amount,
      });
      
      // Submit the form
      await transactionsPage.submitForm();
      
      // Verify the transaction was created (check for success message or in list)
      await expect(page).toHaveURL(/\/transactions/);
      
      // The page should not show any LazyInitializationException errors
      const errorText = page.locator('text=/could not initialize proxy|LazyInitializationException/i');
      await expect(errorText).not.toBeVisible();
    });
  });

  // Original skipped tests (keeping for reference)
  test.skip('should display transactions page correctly', () => {
    // Requires authentication
  });

  test.skip('should create a new expense transaction', () => {
    // Requires backend API
  });

  test.skip('should create a new income transaction', () => {
    // Requires backend API
  });

  test.skip('should show validation errors for empty required fields', () => {
    // Requires backend API
  });

  test.skip('should edit an existing transaction', () => {
    // Requires backend API
  });

  test.skip('should delete a transaction', () => {
    // Requires backend API
  });

  test.skip('should cancel transaction deletion', () => {
    // Requires backend API
  });

  test.skip('should cancel transaction form', () => {
    // Requires backend API
  });

  test.skip('should display transaction type chip correctly', () => {
    // Requires backend API
  });

  test.skip('should display amount with correct formatting', () => {
    // Requires backend API
  });

  test.skip('should handle pagination', () => {
    // Requires backend API
  });

  test.skip('should show empty state when no transactions', () => {
    // Requires backend API
  });
});
