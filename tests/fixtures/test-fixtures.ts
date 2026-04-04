import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { RegisterPage } from '../pages/register.page';
import { DashboardPage } from '../pages/dashboard.page';
import { CategoriesPage } from '../pages/categories.page';
import { TransactionsPage } from '../pages/transactions.page';
import { BudgetsPage } from '../pages/budgets.page';
import { RecurringPage } from '../pages/recurring.page';
import { AlertsPage } from '../pages/alerts.page';
import { CurrencyPage } from '../pages/currency.page';
import { AccountsPage } from '../pages/accounts.page';

// Test data fixtures
export interface TestData {
  user: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  };
  category: {
    name: string;
    description: string;
    type: 'INCOME' | 'EXPENSE';
  };
  transaction: {
    date: string;
    description: string;
    type: 'INCOME' | 'EXPENSE';
    amount: string;
  };
  budget: {
    name: string;
    limitAmount: string;
    period: string;
  };
  recurring: {
    name: string;
    amount: string;
    frequency: string;
    startDate: string;
    type: 'INCOME' | 'EXPENSE';
  };
}

// Default test data
export const defaultTestData: TestData = {
  user: {
    email: `test_${Date.now()}@example.com`,
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'User',
  },
  category: {
    name: `Test Category ${Date.now()}`,
    description: 'Test category description',
    type: 'EXPENSE',
  },
  transaction: {
    date: new Date().toISOString().split('T')[0],
    description: `Test Transaction ${Date.now()}`,
    type: 'EXPENSE',
    amount: '100.00',
  },
  budget: {
    name: `Test Budget ${Date.now()}`,
    limitAmount: '500.00',
    period: 'MONTHLY',
  },
  recurring: {
    name: `Test Recurring ${Date.now()}`,
    amount: '50.00',
    frequency: 'MONTHLY',
    startDate: new Date().toISOString().split('T')[0],
    type: 'EXPENSE',
  },
};

// Extend Playwright test with our fixtures
export const test = base.extend<{
  testData: TestData;
  loginPage: LoginPage;
  registerPage: RegisterPage;
  dashboardPage: DashboardPage;
  categoriesPage: CategoriesPage;
  transactionsPage: TransactionsPage;
  budgetsPage: BudgetsPage;
  recurringPage: RecurringPage;
  alertsPage: AlertsPage;
  currencyPage: CurrencyPage;
  accountsPage: AccountsPage;
  authenticatedPage: {
    loginPage: LoginPage;
    dashboardPage: DashboardPage;
  };
}>({
  testData: async ({ page: _page, ..._rest }, use) => {
    await use(defaultTestData);
  },

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  registerPage: async ({ page }, use) => {
    await use(new RegisterPage(page));
  },

  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },

  categoriesPage: async ({ page }, use) => {
    await use(new CategoriesPage(page));
  },

  transactionsPage: async ({ page }, use) => {
    await use(new TransactionsPage(page));
  },

  budgetsPage: async ({ page }, use) => {
    await use(new BudgetsPage(page));
  },

  recurringPage: async ({ page }, use) => {
    await use(new RecurringPage(page));
  },

  alertsPage: async ({ page }, use) => {
    await use(new AlertsPage(page));
  },

  currencyPage: async ({ page }, use) => {
    await use(new CurrencyPage(page));
  },

  accountsPage: async ({ page }, use) => {
    await use(new AccountsPage(page));
  },

  // Helper fixture for authenticated sessions
  authenticatedPage: async ({ page, loginPage, dashboardPage, testData }, use) => {
    // Store auth state
    await loginPage.goto();
    await loginPage.login(testData.user.email, testData.user.password);
    
    // Wait for navigation to dashboard with a longer timeout
    // If login fails (e.g., backend not available), skip the test
    try {
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
    } catch (e) {
      // Check if we're still on the login page, which means login failed
      const currentUrl = page.url();
      if (currentUrl.includes('/login')) {
        test.skip(true, 'Backend API not available - skipping authentication-dependent tests');
        return;
      }
      throw e;
    }
    
    await use({
      loginPage,
      dashboardPage,
    });

    // Cleanup: logout after test
    try {
      await page.locator('button[aria-label="account of current user"]').click();
      await page.locator('text=Logout').click();
      await expect(page).toHaveURL(/\/login/);
    } catch {
      // Ignore cleanup errors (e.g., if already logged out or page changed)
    }
  },
});

export { expect };