import { test, expect } from './fixtures/test-fixtures';

// These tests require a running backend API with authentication
// They are skipped by default and can be enabled when backend is available
test.describe('Dashboard/Analytics', () => {
  test.describe.skip('Date Range Filter (requires backend)', () => {
    test('should display date range filter elements', async ({ authenticatedPage }) => {
      const { dashboardPage } = authenticatedPage;
      
      // Verify date range filter inputs are visible
      await expect(dashboardPage.startDateInput).toBeVisible();
      await expect(dashboardPage.endDateInput).toBeVisible();
      await expect(dashboardPage.applyButton).toBeVisible();
    });

    test('should display quick select buttons', async ({ authenticatedPage }) => {
      const { dashboardPage } = authenticatedPage;
      
      // Verify all quick select buttons are present
      await expect(dashboardPage.currentMonthButton).toBeVisible();
      await expect(dashboardPage.previousMonthButton).toBeVisible();
      await expect(dashboardPage.yearToDateButton).toBeVisible();
      await expect(dashboardPage.lastYearButton).toBeVisible();
    });

    test('should display navigation buttons', async ({ authenticatedPage }) => {
      const { dashboardPage } = authenticatedPage;
      
      // Verify navigation buttons are visible
      await dashboardPage.expectNavButtonsVisible();
    });

    test('should allow setting custom date range', async ({ authenticatedPage }) => {
      const { dashboardPage } = authenticatedPage;
      
      const startDate = '2024-01-01';
      const endDate = '2024-01-31';
      
      // Set the date range
      await dashboardPage.setStartDate(startDate);
      await dashboardPage.setEndDate(endDate);
      
      // Verify the values are set
      const actualStartDate = await dashboardPage.startDateInput.inputValue();
      const actualEndDate = await dashboardPage.endDateInput.inputValue();
      
      expect(actualStartDate).toBe(startDate);
      expect(actualEndDate).toBe(endDate);
    });
  });

  test.describe.skip('Account Balances Widget (requires backend)', () => {
    test('should display account balances section', async ({ authenticatedPage }) => {
      const { dashboardPage } = authenticatedPage;
      
      // Verify account balances section is visible
      await dashboardPage.expectAccountBalancesVisible();
    });

    test('should display account balances title', async ({ authenticatedPage }) => {
      const { dashboardPage } = authenticatedPage;
      
      // Verify the account balances section contains the title
      await expect(dashboardPage.accountBalancesSection).toContainText('Account Balances');
    });
  });

  test.describe.skip('Dashboard Layout (requires backend)', () => {
    test('should display date range filter above account balances', async ({ authenticatedPage, page }) => {
      const { dashboardPage } = authenticatedPage;
      
      // Get positions of date range filter and account balances
      const dateFilterBox = dashboardPage.startDateInput;
      const accountBalancesSection = dashboardPage.accountBalancesSection;
      
      // Verify both are visible
      await expect(dateFilterBox).toBeVisible();
      await expect(accountBalancesSection).toBeVisible();
      
      // Verify date filter is above account balances
      const dateFilterY = (await dateFilterBox.boundingBox())?.y || 0;
      const accountBalancesY = (await accountBalancesSection.boundingBox())?.y || 0;
      
      expect(dateFilterY).toBeLessThan(accountBalancesY);
    });

    test('should display page title', async ({ page }) => {
      await expect(page.locator('h1:has-text("Financial Dashboard")')).toBeVisible();
    });
  });

  test.describe.skip('Summary Cards (requires backend)', () => {
    test('should display Total Income card', async ({ authenticatedPage }) => {
      const { dashboardPage } = authenticatedPage;
      await expect(dashboardPage.totalIncomeCard).toBeVisible();
      await expect(dashboardPage.totalIncomeCard).toContainText('Total Income');
    });

    test('should display Total Expenses card', async ({ authenticatedPage }) => {
      const { dashboardPage } = authenticatedPage;
      await expect(dashboardPage.totalExpensesCard).toBeVisible();
      await expect(dashboardPage.totalExpensesCard).toContainText('Total Expenses');
    });

    test('should display Net Balance card', async ({ authenticatedPage }) => {
      const { dashboardPage } = authenticatedPage;
      await expect(dashboardPage.netBalanceCard).toBeVisible();
      await expect(dashboardPage.netBalanceCard).toContainText('Net Balance');
    });

    test('should display Save Rate card', async ({ authenticatedPage }) => {
      const { dashboardPage } = authenticatedPage;
      await expect(dashboardPage.saveRateCard).toBeVisible();
      await expect(dashboardPage.saveRateCard).toContainText('Save Rate');
    });
  });

  test.describe.skip('Charts (requires backend)', () => {
    test('should display chart canvases', async ({ authenticatedPage, page }) => {
      // Verify charts are visible (they render on canvas elements)
      const canvases = page.locator('canvas');
      await expect(canvases).not.toHaveCount(0);
    });
  });

  test.describe.skip('Date Range Display (requires backend)', () => {
    test('should display date range in header', async ({ authenticatedPage }) => {
      const { dashboardPage } = authenticatedPage;
      
      // The header should show a date range display
      await dashboardPage.expectDateRangeDisplayed('', '');
    });
  });
});
