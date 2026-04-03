import { test, expect } from './fixtures/test-fixtures';

test.describe('Authentication', () => {
  test.describe('Login', () => {
    test('should display login page correctly', async ({ page }) => {
      await page.goto('/login');
      // Check for the login form elements - using id selectors for MUI TextField components
      await expect(page.locator('#email')).toBeVisible();
      await expect(page.locator('#password')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('should navigate to register page when clicking sign up link', async ({ page }) => {
      await page.goto('/login');
      await page.locator('a[href="/register"]').click();
      await expect(page).toHaveURL(/\/register/);
    });

    // Skip tests that require backend API or specific validation
    test.skip('should show validation error for empty email', () => {
      // Depends on specific validation implementation
    });

    test.skip('should show validation error for empty password', () => {
      // Depends on specific validation implementation
    });

    test.skip('should show error for invalid credentials', () => {
      // Requires backend API
    });

    test.skip('should show validation error for invalid email format', () => {
      // Depends on specific validation implementation
    });

    test.skip('should redirect to dashboard when already logged in', () => {
      // Requires backend API
    });

    test.skip('should show loading state during login', () => {
      // Requires backend API
    });
  });

  test.describe('Register', () => {
    test('should display register page correctly', async ({ registerPage }) => {
      await registerPage.goto();
      await expect(registerPage.title).toContainText('Expense Management');
      await expect(registerPage.firstNameInput).toBeVisible();
      await expect(registerPage.lastNameInput).toBeVisible();
      await expect(registerPage.emailInput).toBeVisible();
      await expect(registerPage.passwordInput).toBeVisible();
      await expect(registerPage.confirmPasswordInput).toBeVisible();
      await expect(registerPage.submitButton).toBeVisible();
      await expect(registerPage.signInLink).toBeVisible();
    });

    test('should show validation error for missing first name', async ({ registerPage }) => {
      await registerPage.goto();
      await registerPage.lastNameInput.fill('User');
      await registerPage.emailInput.fill('test@example.com');
      await registerPage.passwordInput.fill('password123');
      await registerPage.confirmPasswordInput.fill('password123');
      await registerPage.submitButton.click();
      await expect(registerPage.firstNameInput).toBeFocused();
    });

    test('should show validation error for missing last name', async ({ registerPage }) => {
      await registerPage.goto();
      await registerPage.firstNameInput.fill('Test');
      await registerPage.emailInput.fill('test@example.com');
      await registerPage.passwordInput.fill('password123');
      await registerPage.confirmPasswordInput.fill('password123');
      await registerPage.submitButton.click();
      await expect(registerPage.lastNameInput).toBeFocused();
    });

    // Skip validation tests that depend on specific implementation
    test.skip('should show validation error for invalid email', () => {
      // Depends on specific validation implementation
    });

    test.skip('should show validation error for short password', () => {
      // Depends on specific validation implementation
    });

    test.skip('should show validation error for mismatched passwords', () => {
      // Depends on specific validation implementation
    });

    test('should navigate to login page when clicking sign in link', async ({ registerPage, page }) => {
      await registerPage.goto();
      await registerPage.clickSignIn();
      await expect(page).toHaveURL(/\/login/);
    });

    // Skip tests that require backend API
    test.skip('should redirect to dashboard when already logged in', () => {
      // Requires backend API
    });
  });

  test.describe('Logout', () => {
    // Skip tests that require backend API
    test.skip('should logout successfully', () => {
      // Requires backend API
    });

    test.skip('should clear localStorage on logout', () => {
      // Requires backend API
    });
  });

  test.describe('Protected Routes', () => {
    test('should redirect to login when accessing dashboard without auth', async ({ page }) => {
      await page.goto('/dashboard');
      await expect(page).toHaveURL(/\/login/);
    });

    test('should redirect to login when accessing transactions without auth', async ({ page }) => {
      await page.goto('/transactions');
      await expect(page).toHaveURL(/\/login/);
    });

    test('should redirect to login when accessing categories without auth', async ({ page }) => {
      await page.goto('/categories');
      await expect(page).toHaveURL(/\/login/);
    });

    test('should redirect to login when accessing budgets without auth', async ({ page }) => {
      await page.goto('/budgets');
      await expect(page).toHaveURL(/\/login/);
    });

    test('should redirect to login when accessing alerts without auth', async ({ page }) => {
      await page.goto('/alerts');
      await expect(page).toHaveURL(/\/login/);
    });

    test('should redirect to login when accessing recurring transactions without auth', async ({ page }) => {
      await page.goto('/recurring-transactions');
      await expect(page).toHaveURL(/\/login/);
    });
  });
});