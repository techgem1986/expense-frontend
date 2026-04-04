import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly signUpLink: Locator;
  readonly errorMessage: Locator;
  readonly loadingIndicator: Locator;

  constructor(page: Page) {
    super(page, '/login');
    this.emailInput = page.locator('input[type="email"]');
    this.passwordInput = page.locator('input[type="password"]');
    this.submitButton = page.locator('button[type="submit"]');
    this.signUpLink = page.locator('a[href="/register"]');
    // Updated: Tailwind error message styling
    this.errorMessage = page.locator('[class*="bg-danger-50"][class*="text-danger-600"]');
    // Updated: Tailwind loading spinner
    this.loadingIndicator = page.locator('.animate-spin');
  }

  async goto() {
    await this.navigate();
    await this.waitForPageLoad();
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
    await this.waitForPageLoad();
  }

  async clickSignUp() {
    await this.signUpLink.click();
  }

  getSubmitButton() {
    return this.submitButton;
  }

  async expectErrorMessage(expected: string) {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(expected);
  }

  async expectNoErrorMessage() {
    await expect(this.errorMessage).not.toBeVisible();
  }

  async expectLoadingState(isLoading: boolean) {
    if (isLoading) {
      await expect(this.loadingIndicator).toBeVisible();
    } else {
      await expect(this.loadingIndicator).not.toBeVisible();
    }
  }
}