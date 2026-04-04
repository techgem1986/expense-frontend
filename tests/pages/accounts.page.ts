import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class AccountsPage extends BasePage {
  readonly addAccountButton: Locator;
  readonly accountTable: Locator;
  readonly noAccountsMessage: Locator;
  readonly dialogTitle: Locator;
  readonly nameInput: Locator;
  readonly accountTypeSelect: Locator;
  readonly bankNameInput: Locator;
  readonly accountNumberInput: Locator;
  readonly ifscCodeInput: Locator;
  readonly openingBalanceInput: Locator;
  readonly descriptionInput: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;
  readonly errorMessage: Locator;
  readonly successMessage: Locator;
  readonly deleteConfirmButton: Locator;
  readonly deleteCancelButton: Locator;
  readonly totalBalanceDisplay: Locator;

  constructor(page: Page) {
    super(page, '/accounts');
    this.addAccountButton = page.locator('button:has-text("Add Account")').first();
    this.accountTable = page.locator('table');
    this.noAccountsMessage = page.locator('text=No accounts yet');
    this.dialogTitle = page.locator('[class*="text-xl"][class*="font-semibold"]').first();
    this.nameInput = page.locator('input[name="name"]');
    this.accountTypeSelect = page.locator('select[name="accountType"]');
    this.bankNameInput = page.locator('input[name="bankName"]');
    this.accountNumberInput = page.locator('input[name="accountNumber"]');
    this.ifscCodeInput = page.locator('input[name="ifscCode"]');
    this.openingBalanceInput = page.locator('input[name="openingBalance"]');
    this.descriptionInput = page.locator('textarea[name="description"]');
    this.submitButton = page.locator('button:has-text("Create"), button:has-text("Update")').last();
    this.cancelButton = page.locator('button:has-text("Cancel")').first();
    this.errorMessage = page.locator('[class*="bg-danger-50"][class*="text-danger-600"]');
    this.successMessage = page.locator('[class*="bg-success-50"][class*="text-success-600"]');
    this.deleteConfirmButton = page.locator('button:has-text("Delete")').last();
    this.deleteCancelButton = page.locator('button:has-text("Cancel")').last();
    this.totalBalanceDisplay = page.locator('text=Total Balance').first();
  }

  async goto() {
    await this.navigate();
    await this.waitForPageLoad();
  }

  async clickAddAccount() {
    await this.addAccountButton.click();
  }

  async fillAccountForm(data: {
    name: string;
    accountType?: string;
    bankName?: string;
    accountNumber?: string;
    ifscCode?: string;
    openingBalance?: string;
    description?: string;
  }) {
    await this.nameInput.fill(data.name);
    if (data.accountType) {
      await this.accountTypeSelect.selectOption(data.accountType);
    }
    if (data.bankName !== undefined) {
      await this.bankNameInput.fill(data.bankName);
    }
    if (data.accountNumber !== undefined) {
      await this.accountNumberInput.fill(data.accountNumber);
    }
    if (data.ifscCode !== undefined) {
      await this.ifscCodeInput.fill(data.ifscCode);
    }
    if (data.openingBalance !== undefined) {
      await this.openingBalanceInput.fill(data.openingBalance);
    }
    if (data.description !== undefined) {
      await this.descriptionInput.fill(data.description);
    }
  }

  async submitForm() {
    await this.submitButton.click();
    await this.waitForPageLoad();
  }

  async cancelForm() {
    await this.cancelButton.click();
  }

  async clickEditAccount(accountName: string) {
    await this.page.locator('tr', { hasText: accountName }).locator('button[aria-label="Edit account"]').click();
  }

  async clickDeleteAccount(accountName: string) {
    await this.page.locator('tr', { hasText: accountName }).locator('button[aria-label="Delete account"]').click();
  }

  async confirmDelete() {
    await this.deleteConfirmButton.click();
    await this.waitForPageLoad();
  }

  async cancelDelete() {
    await this.deleteCancelButton.click();
  }

  async expectAccountInList(name: string) {
    await expect(this.page.locator('tr', { hasText: name })).toBeVisible();
  }

  async expectAccountNotInList(name: string) {
    await expect(this.page.locator('tr', { hasText: name })).not.toBeVisible();
  }

  async expectErrorMessage(expected: string) {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(expected);
  }

  async expectNoErrorMessage() {
    await expect(this.errorMessage).not.toBeVisible();
  }

  async expectSuccessMessage(expected: string) {
    await expect(this.successMessage).toBeVisible();
    await expect(this.successMessage).toContainText(expected);
  }

  async getAccountRow(name: string) {
    return this.page.locator('tr', { hasText: name });
  }

  async expectDialogTitle(expected: string) {
    await expect(this.dialogTitle).toHaveText(expected);
  }
}