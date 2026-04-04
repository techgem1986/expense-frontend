import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class RecurringPage extends BasePage {
  readonly addRecurringButton: Locator;
  readonly recurringTable: Locator;
  readonly noRecurringMessage: Locator;
  readonly dialogTitle: Locator;
  readonly nameInput: Locator;
  readonly categorySelect: Locator;
  readonly amountInput: Locator;
  readonly frequencySelect: Locator;
  readonly startDateInput: Locator;
  readonly typeSelect: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;
  readonly errorMessage: Locator;
  readonly deleteConfirmButton: Locator;
  readonly deleteCancelButton: Locator;

  constructor(page: Page) {
    super(page, '/recurring-transactions');
    this.addRecurringButton = page.locator('button:has-text("Add Recurring")');
    this.recurringTable = page.locator('table');
    this.noRecurringMessage = page.locator('text=No recurring transactions found');
    // Updated: Tailwind modal dialog title
    this.dialogTitle = page.locator('[class*="text-xl"][class*="font-semibold"]').first();
    this.nameInput = page.locator('input[name="name"], input#name');
    // Updated: Tailwind select element
    this.categorySelect = page.locator('select[name="categoryId"]').first();
    this.amountInput = page.locator('input[name="amount"], input[type="number"]');
    // Updated: Tailwind select element
    this.frequencySelect = page.locator('select[name="frequency"]').last();
    this.startDateInput = page.locator('input[name="startDate"], input[type="date"]');
    // Updated: Tailwind select element
    this.typeSelect = page.locator('select[name="type"]').nth(1);
    this.submitButton = page.locator('button[type="submit"]');
    this.cancelButton = page.locator('button:has-text("Cancel")').first();
    // Updated: Tailwind error message styling
    this.errorMessage = page.locator('[class*="bg-danger-50"][class*="text-danger-600"]');
    this.deleteConfirmButton = page.locator('button:has-text("Delete")').last();
    this.deleteCancelButton = page.locator('button:has-text("Cancel")').last();
  }

  async goto() {
    await this.navigate();
    await this.waitForPageLoad();
  }

  async clickAddRecurring() {
    await this.addRecurringButton.click();
  }

  async fillRecurringForm(data: {
    name: string;
    category: string;
    amount: string;
    frequency: string;
    startDate: string;
    type: 'INCOME' | 'EXPENSE';
  }) {
    await this.nameInput.fill(data.name);
    await this.categorySelect.selectOption(data.category);
    await this.amountInput.fill(data.amount);
    await this.frequencySelect.selectOption(data.frequency);
    await this.startDateInput.fill(data.startDate);
    await this.typeSelect.selectOption(data.type);
  }

  async submitForm() {
    await this.submitButton.click();
    await this.waitForPageLoad();
  }

  async cancelForm() {
    await this.cancelButton.click();
  }

  async clickEditRecurring(name: string) {
    await this.page.locator('tr', { hasText: name }).locator('button[aria-label="Edit recurring transaction"]').click();
  }

  async clickDeleteRecurring(name: string) {
    await this.page.locator('tr', { hasText: name }).locator('button[aria-label="Delete recurring transaction"]').click();
  }

  async confirmDelete() {
    await this.deleteConfirmButton.click();
    await this.waitForPageLoad();
  }

  async cancelDelete() {
    await this.deleteCancelButton.click();
  }

  async expectRecurringInList(name: string) {
    await expect(this.page.locator('tr', { hasText: name })).toBeVisible();
  }

  async expectRecurringNotInList(name: string) {
    await expect(this.page.locator('tr', { hasText: name })).not.toBeVisible();
  }

  async expectErrorMessage(expected: string) {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(expected);
  }

  async expectNoErrorMessage() {
    await expect(this.errorMessage).not.toBeVisible();
  }

  async getRecurringRow(name: string) {
    return this.page.locator('tr', { hasText: name });
  }

  async expectRecurringStatus(name: string, status: 'Active' | 'Inactive') {
    const row = await this.getRecurringRow(name);
    await expect(row).toContainText(status);
  }
}