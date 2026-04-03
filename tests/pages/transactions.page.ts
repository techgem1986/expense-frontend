import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class TransactionsPage extends BasePage {
  readonly addTransactionButton: Locator;
  readonly transactionTable: Locator;
  readonly noTransactionsMessage: Locator;
  readonly dialogTitle: Locator;
  readonly dateInput: Locator;
  readonly categorySelect: Locator;
  readonly descriptionInput: Locator;
  readonly typeSelect: Locator;
  readonly amountInput: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;
  readonly errorMessage: Locator;
  readonly deleteConfirmButton: Locator;
  readonly deleteCancelButton: Locator;
  readonly pagination: Locator;

  constructor(page: Page) {
    super(page, '/transactions');
    this.addTransactionButton = page.locator('button:has-text("Add Transaction")');
    this.transactionTable = page.locator('table');
    this.noTransactionsMessage = page.locator('text=No transactions found');
    this.dialogTitle = page.locator('.MuiDialogTitle-root');
    this.dateInput = page.locator('input[name="transactionDate"], input[type="date"]');
    this.categorySelect = page.locator('select[name="categoryId"], .MuiSelect-select').first();
    this.descriptionInput = page.locator('input[name="description"], input#description');
    this.typeSelect = page.locator('select[name="type"], .MuiSelect-select').last();
    this.amountInput = page.locator('input[name="amount"], input[type="number"]');
    this.submitButton = page.locator('button[type="submit"]');
    this.cancelButton = page.locator('button:has-text("Cancel")').first();
    this.errorMessage = page.locator('.MuiAlert-root.MuiAlert-colorError');
    this.deleteConfirmButton = page.locator('button:has-text("Delete")').last();
    this.deleteCancelButton = page.locator('button:has-text("Cancel")').last();
    this.pagination = page.locator('.MuiPagination-root');
  }

  async goto() {
    await this.navigate();
    await this.waitForPageLoad();
  }

  async clickAddTransaction() {
    await this.addTransactionButton.click();
  }

  async fillTransactionForm(data: {
    date: string;
    category: string;
    description: string;
    type: 'INCOME' | 'EXPENSE';
    amount: string;
  }) {
    await this.dateInput.fill(data.date);
    await this.categorySelect.selectOption(data.category);
    await this.descriptionInput.fill(data.description);
    await this.typeSelect.selectOption(data.type);
    await this.amountInput.fill(data.amount);
  }

  async submitForm() {
    await this.submitButton.click();
    await this.waitForPageLoad();
  }

  async cancelForm() {
    await this.cancelButton.click();
  }

  async clickEditTransaction(description: string) {
    await this.page.locator('tr', { hasText: description }).locator('button[aria-label="edit"]').click();
  }

  async clickDeleteTransaction(description: string) {
    await this.page.locator('tr', { hasText: description }).locator('button[aria-label="delete"]').click();
  }

  async confirmDelete() {
    await this.deleteConfirmButton.click();
    await this.waitForPageLoad();
  }

  async cancelDelete() {
    await this.deleteCancelButton.click();
  }

  async goToPage(pageNum: number) {
    await this.pagination.locator(`button[aria-label="Go to page ${pageNum}"]`).click();
    await this.waitForPageLoad();
  }

  async expectTransactionInList(description: string) {
    await expect(this.page.locator('tr', { hasText: description })).toBeVisible();
  }

  async expectTransactionNotInList(description: string) {
    await expect(this.page.locator('tr', { hasText: description })).not.toBeVisible();
  }

  async expectErrorMessage(expected: string) {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(expected);
  }

  async expectNoErrorMessage() {
    await expect(this.errorMessage).not.toBeVisible();
  }

  async getTransactionRow(description: string) {
    return this.page.locator('tr', { hasText: description });
  }

  async expectAmountVisible(description: string, expectedAmount: string) {
    const row = await this.getTransactionRow(description);
    await expect(row).toContainText(expectedAmount);
  }
}