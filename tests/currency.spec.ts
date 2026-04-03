import { test, expect } from './fixtures/test-fixtures';

test.describe('Currency Selector', () => {
  test.describe('Currency selector on all screens', () => {
    // These tests verify that currency selector is accessible on all protected screens
    // They are skipped because they require a running backend API for authentication
    
    test.skip('should display currency selector on dashboard', async ({ page }) => {
      await page.goto('/dashboard');
      const currencySelector = page.locator('label:has-text("Currency")');
      await expect(currencySelector).toBeVisible();
    });

    test.skip('should display currency selector on transactions page', async ({ page }) => {
      await page.goto('/transactions');
      const currencySelector = page.locator('label:has-text("Currency")');
      await expect(currencySelector).toBeVisible();
    });

    test.skip('should display currency selector on budgets page', async ({ page }) => {
      await page.goto('/budgets');
      const currencySelector = page.locator('label:has-text("Currency")');
      await expect(currencySelector).toBeVisible();
    });

    test.skip('should display currency selector on recurring transactions page', async ({ page }) => {
      await page.goto('/recurring-transactions');
      const currencySelector = page.locator('label:has-text("Currency")');
      await expect(currencySelector).toBeVisible();
    });

    test.skip('should display currency selector on categories page', async ({ page }) => {
      await page.goto('/categories');
      const currencySelector = page.locator('label:has-text("Currency")');
      await expect(currencySelector).toBeVisible();
    });

    test.skip('should display currency selector on alerts page', async ({ page }) => {
      await page.goto('/alerts');
      const currencySelector = page.locator('label:has-text("Currency")');
      await expect(currencySelector).toBeVisible();
    });
  });

  test.describe('Currency selection functionality', () => {
    // These tests verify currency switching functionality
    // They are skipped because they require a running backend API for authentication
    
    test.skip('should have INR as the default selected currency', async ({ page }) => {
      await page.goto('/dashboard');
      const currencySelector = page.locator('label:has-text("Currency")');
      await expect(currencySelector).toContainText('INR');
    });

    test.skip('should update currency when a different currency is selected', async ({ page }) => {
      await page.goto('/dashboard');
      const currencySelector = page.locator('label:has-text("Currency")');
      await currencySelector.click();
      await page.locator('[role="option"]:has-text("USD")').click();
      await expect(currencySelector).toContainText('USD');
    });

    test.skip('should persist currency selection in localStorage', async ({ page }) => {
      await page.goto('/dashboard');
      const currencySelector = page.locator('label:has-text("Currency")');
      await currencySelector.click();
      await page.locator('[role="option"]:has-text("USD")').click();
      await page.reload();
      await expect(currencySelector).toContainText('USD');
    });

    test.skip('should display amounts in INR format with ₹ symbol', async ({ page }) => {
      await page.goto('/dashboard');
      // Check for INR symbol (₹) on the page
      await expect(page.locator('body')).toContainText('₹');
    });
  });

  test.describe('Protected routes redirect to login', () => {
    // These tests verify that protected routes redirect to login when not authenticated
    // They are skipped because they require a running server
    
    test.skip('should redirect to login when accessing dashboard without auth', async ({ page }) => {
      await page.goto('/dashboard');
      await expect(page).toHaveURL(/\/login/);
    });

    test.skip('should redirect to login when accessing transactions without auth', async ({ page }) => {
      await page.goto('/transactions');
      await expect(page).toHaveURL(/\/login/);
    });

    test.skip('should redirect to login when accessing budgets without auth', async ({ page }) => {
      await page.goto('/budgets');
      await expect(page).toHaveURL(/\/login/);
    });

    test.skip('should redirect to login when accessing recurring transactions without auth', async ({ page }) => {
      await page.goto('/recurring-transactions');
      await expect(page).toHaveURL(/\/login/);
    });

    test.skip('should redirect to login when accessing categories without auth', async ({ page }) => {
      await page.goto('/categories');
      await expect(page).toHaveURL(/\/login/);
    });

    test.skip('should redirect to login when accessing alerts without auth', async ({ page }) => {
      await page.goto('/alerts');
      await expect(page).toHaveURL(/\/login/);
    });
  });
});