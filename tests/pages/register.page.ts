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
    this.firstNameInput = page.locator('input#firstName');
    this.lastNameInput = page.locator('input#lastName');
    this.emailInput = page.locator('input#email');
    this.passwordInput = page.locator('input#password');
    this.confirmPasswordInput = page.locator('input#confirmPassword');
    this.submitButton = page.locator('button[type="submit"]');
    this.signInLink = page.locator('a[href="/login"]');
    this.errorMessage = page.locator('.MuiAlert-root.MuiAlert-colorError');
    this.loadingIndicator = page.locator('.MuiCircularProgress-root');
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