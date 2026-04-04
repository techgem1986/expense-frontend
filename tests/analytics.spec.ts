import { test, expect } from './fixtures/test-fixtures';

// These tests require a running backend API with authentication
// They are skipped by default and can be enabled when backend is available
test.describe('Analytics Page', () => {
  // Protected route test - doesn't require backend
  test('should redirect to login when accessing analytics without auth', async ({ page }) => {
    await page.goto('/analytics');
    await expect(page).toHaveURL(/\/login/);
  });

  test.describe.skip('Summary Cards (requires backend)', () => {
    test('should display Total Income card', async ({ loginPage, page, testData }) => {
      await loginPage.goto();
      await loginPage.login(testData.user.email, testData.user.password);
      await expect(page).toHaveURL(/\/dashboard/);
      
      await page.goto('/analytics');
      await expect(page.locator('text=Total Income')).toBeVisible();
    });

    test('should display Total Expenses card', async ({ loginPage, page, testData }) => {
      await loginPage.goto();
      await loginPage.login(testData.user.email, testData.user.password);
      await expect(page).toHaveURL(/\/dashboard/);
      
      await page.goto('/analytics');
      await expect(page.locator('text=Total Expenses')).toBeVisible();
    });

    test('should display Net Balance card', async ({ loginPage, page, testData }) => {
      await loginPage.goto();
      await loginPage.login(testData.user.email, testData.user.password);
      await expect(page).toHaveURL(/\/dashboard/);
      
      await page.goto('/analytics');
      await expect(page.locator('text=Net Balance')).toBeVisible();
    });

    test('should display Save Rate card', async ({ loginPage, page, testData }) => {
      await loginPage.goto();
      await loginPage.login(testData.user.email, testData.user.password);
      await expect(page).toHaveURL(/\/dashboard/);
      
      await page.goto('/analytics');
      await expect(page.locator('text=Save Rate')).toBeVisible();
    });
  });

  test.describe.skip('Charts (requires backend)', () => {
    test('should display spending by category chart', async ({ loginPage, page, testData }) => {
      await loginPage.goto();
      await loginPage.login(testData.user.email, testData.user.password);
      await expect(page).toHaveURL(/\/dashboard/);
      
      await page.goto('/analytics');
      await expect(page.locator('canvas')).not.toHaveCount(0);
    });

    test('should display monthly spending chart', async ({ loginPage, page, testData }) => {
      await loginPage.goto();
      await loginPage.login(testData.user.email, testData.user.password);
      await expect(page).toHaveURL(/\/dashboard/);
      
      await page.goto('/analytics');
      await expect(page.locator('canvas')).not.toHaveCount(0);
    });
  });

  test.describe.skip('Account Balances (requires backend)', () => {
    test('should display account balances section', async ({ loginPage, page, testData }) => {
      await loginPage.goto();
      await loginPage.login(testData.user.email, testData.user.password);
      await expect(page).toHaveURL(/\/dashboard/);
      
      await page.goto('/analytics');
      await expect(page.locator('text=Account Balances')).toBeVisible();
    });
  });

  test.describe.skip('Date Range Filter (requires backend)', () => {
    test('should display date range filter elements', async ({ loginPage, page, testData }) => {
      await loginPage.goto();
      await loginPage.login(testData.user.email, testData.user.password);
      await expect(page).toHaveURL(/\/dashboard/);
      
      await page.goto('/analytics');
      await expect(page.locator('input[type="date"]').first()).toBeVisible();
      await expect(page.locator('input[type="date"]').last()).toBeVisible();
    });

    test('should display quick select buttons', async ({ loginPage, page, testData }) => {
      await loginPage.goto();
      await loginPage.login(testData.user.email, testData.user.password);
      await expect(page).toHaveURL(/\/dashboard/);
      
      await page.goto('/analytics');
      await expect(page.locator('button:has-text("This Month")')).toBeVisible();
      await expect(page.locator('button:has-text("Last Month")')).toBeVisible();
    });
  });

  test.describe.skip('Export Functionality (requires backend)', () => {
    test('should display export button', async ({ loginPage, page, testData }) => {
      await loginPage.goto();
      await loginPage.login(testData.user.email, testData.user.password);
      await expect(page).toHaveURL(/\/dashboard/);
      
      await page.goto('/analytics');
      await expect(page.locator('button:has-text("Export")')).toBeVisible();
    });
  });

  test.describe.skip('Empty State (requires backend)', () => {
    test('should display empty state when no analytics data', async ({ loginPage, page, testData }) => {
      await loginPage.goto();
      await loginPage.login(testData.user.email, testData.user.password);
      await expect(page).toHaveURL(/\/dashboard/);
      
      await page.goto('/analytics');
      // Should show a message about no data available
      await expect(page.locator('text=No analytics data available')).toBeVisible();
    });
  });
});