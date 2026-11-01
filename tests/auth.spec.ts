import { test, expect } from '@playwright/test';

/**
 * Authentication smoke tests.
 *
 * These assertions only rely on client-side routing and form validation, so
 * they run without a backend.
 */
test.describe('Authentication', () => {
  test('redirects unauthenticated visitors to the login page', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { name: 'LedgerFlow' })).toBeVisible();
  });

  test('protects the dashboard route', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { name: 'LedgerFlow' })).toBeVisible();
  });

  test('renders the sign-in form', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByPlaceholder('you@example.com')).toBeVisible();
    await expect(page.getByPlaceholder('Enter your password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
  });

  test('shows validation errors when signing in with empty fields', async ({ page }) => {
    await page.goto('/login');

    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page.getByText('Email is required')).toBeVisible();
    await expect(page.getByText('Password is required')).toBeVisible();
  });

  test('renders the registration form', async ({ page }) => {
    await page.goto('/register');

    await expect(page.getByRole('heading', { name: 'Create account' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign Up' })).toBeVisible();
  });
});
