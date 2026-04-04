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
  // Date range filter locators
  readonly startDateInput: Locator;
  readonly endDateInput: Locator;
  readonly applyDateRangeButton: Locator;
  readonly dateRangeDisplay: Locator;
  readonly currentMonthButton: Locator;
  readonly previousMonthButton: Locator;
  readonly yearToDateButton: Locator;
  readonly lastYearButton: Locator;
  readonly prevNavButton: Locator;
  readonly nextNavButton: Locator;

  constructor(page: Page) {
    super(page, '/transactions');
    this.addTransactionButton = page.locator('button:has-text("Add Transaction")');
    this.transactionTable = page.locator('table');
    this.noTransactionsMessage = page.locator('text=No transactions found');
    // Updated: Tailwind modal dialog title
    this.dialogTitle = page.locator('[class*="text-xl"][class*="font-semibold"]').first();
    this.dateInput = page.locator('input[name="transactionDate"], input[type="date"]');
    // Updated: Tailwind select element
    this.categorySelect = page.locator('select[name="categoryId"]').first();
    this.descriptionInput = page.locator('textarea[name="description"], input[name="description"]');
    // Updated: Tailwind select element
    this.typeSelect = page.locator('select[name="type"]').last();
    this.amountInput = page.locator('input[name="amount"], input[type="number"]');
    this.submitButton = page.locator('button[type="submit"]');
    this.cancelButton = page.locator('button:has-text("Cancel")').first();
    // Updated: Tailwind error message styling
    this.errorMessage = page.locator('[class*="bg-danger-50"][class*="text-danger-600"]');
    this.deleteConfirmButton = page.locator('button:has-text("Delete")').last();
    this.deleteCancelButton = page.locator('button:has-text("Cancel")').last();
    // Updated: Tailwind pagination
    this.pagination = page.locator('div.flex.gap-2:has(button:has-text("Previous")), div:has(button:has-text("Previous")):has(button:has-text("Next"))');
    // Date range filter locators
    this.startDateInput = page.locator('label:has-text("Start Date") + div input[type="date"], input[type="date"]').first();
    this.endDateInput = page.locator('label:has-text("End Date") + div input[type="date"], input[type="date"]').last();
    this.applyDateRangeButton = page.locator('button:has-text("Apply")').first();
    this.dateRangeDisplay = page.locator('[class*="text-sm"]').filter({ has: page.locator('[aria-label*="calendar"], svg').first() });
    this.currentMonthButton = page.locator('button:has-text("Current Month")');
    this.previousMonthButton = page.locator('button:has-text("Previous Month")');
    this.yearToDateButton = page.locator('button:has-text("Year to Date")');
    this.lastYearButton = page.locator('button:has-text("Last Year")');
    this.prevNavButton = page.locator('button[aria-label="Previous month"], button:has(svg) >> text=Prev');
    this.nextNavButton = page.locator('button[aria-label="Next month"], button:has(svg) >> text=Next');
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
    await this.page.locator('tr', { hasText: description }).locator('button[aria-label="Edit transaction"]').click();
  }

  async clickDeleteTransaction(description: string) {
    await this.page.locator('tr', { hasText: description }).locator('button[aria-label="Delete transaction"]').click();
  }

  async confirmDelete() {
    await this.deleteConfirmButton.click();
    await this.waitForPageLoad();
  }

  async cancelDelete() {
    await this.deleteCancelButton.click();
  }

  async goToPage(pageNum: number) {
    // Updated: Tailwind pagination uses Previous/Next buttons
    // Navigate to the desired page by clicking Next multiple times or use direct logic
    const currentPage = await this.getCurrentPage();
    if (pageNum > currentPage) {
      for (let i = currentPage; i < pageNum; i++) {
        await this.pagination.locator('button:has-text("Next")').click();
        await this.waitForPageLoad();
      }
    } else if (pageNum < currentPage) {
      for (let i = currentPage; i > pageNum; i--) {
        await this.pagination.locator('button:has-text("Previous")').click();
        await this.waitForPageLoad();
      }
    }
  }

  async getCurrentPage(): Promise<number> {
    const pageText = await this.pagination.locator('p').first().textContent();
    const match = pageText?.match(/Page (\d+)/);
    return match ? parseInt(match[1]) : 1;
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

  // Date range filter methods
  async setDateRange(startDate: string, endDate: string) {
    await this.startDateInput.fill(startDate);
    await this.endDateInput.fill(endDate);
    await this.applyDateRangeButton.click();
    await this.waitForPageLoad();
  }

  async setStartDate(startDate: string) {
    await this.startDateInput.fill(startDate);
  }

  async setEndDate(endDate: string) {
    await this.endDateInput.fill(endDate);
  }

  async clickApplyDateRange() {
    await this.applyDateRangeButton.click();
    await this.waitForPageLoad();
  }

  async clickCurrentMonth() {
    await this.currentMonthButton.click();
    await this.waitForPageLoad();
  }

  async clickPreviousMonth() {
    await this.previousMonthButton.click();
    await this.waitForPageLoad();
  }

  async clickYearToDate() {
    await this.yearToDateButton.click();
    await this.waitForPageLoad();
  }

  async clickLastYear() {
    await this.lastYearButton.click();
    await this.waitForPageLoad();
  }

  async clickPrevMonth() {
    await this.prevNavButton.click();
  }

  async clickNextMonth() {
    await this.nextNavButton.click();
  }

  async expectDateRangeFilterVisible() {
    await expect(this.startDateInput).toBeVisible();
    await expect(this.endDateInput).toBeVisible();
    await expect(this.applyDateRangeButton).toBeVisible();
  }

  async expectQuickSelectButtonsVisible() {
    await expect(this.currentMonthButton).toBeVisible();
    await expect(this.previousMonthButton).toBeVisible();
    await expect(this.yearToDateButton).toBeVisible();
    await expect(this.lastYearButton).toBeVisible();
  }

  async expectNavButtonsVisible() {
    await expect(this.prevNavButton).toBeVisible();
    await expect(this.nextNavButton).toBeVisible();
  }

  async expectDateRangeDisplayed() {
    await expect(this.dateRangeDisplay).toBeVisible();
  }

  async getTransactionCount(): Promise<number> {
    const rows = this.transactionTable.locator('tbody tr');
    return await rows.count();
  }
}
