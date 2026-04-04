import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class RegisterPage extends BasePage {
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly submitButton: Locator;
  readonly signInLink: Locator;
  readonly errorMessage: Locator;
  readonly loadingIndicator: Locator;

  constructor(page: Page) {
    super(page, '/register');
    this.firstNameInput = page.locator('input[name="firstName"], input#firstName');
    this.lastNameInput = page.locator('input[name="lastName"], input#lastName');
    this.emailInput = page.locator('input[type="email"]');
    this.passwordInput = page.locator('input[type="password"]').first();
    this.confirmPasswordInput = page.locator('input[type="password"]').last();
    this.submitButton = page.locator('button[type="submit"]');
    this.signInLink = page.locator('a[href="/login"]');
    // Updated: Tailwind error message styling
    this.errorMessage = page.locator('[class*="bg-danger-50"][class*="text-danger-600"]');
    // Updated: Tailwind loading spinner
    this.loadingIndicator = page.locator('.animate-spin');
  }

  async goto() {
    await this.navigate();
    await this.waitForPageLoad();
  }

  async register(
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    confirmPassword: string
  ) {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(confirmPassword);
    await this.submitButton.click();
    await this.waitForPageLoad();
  }

  async clickSignIn() {
    await this.signInLink.click();
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