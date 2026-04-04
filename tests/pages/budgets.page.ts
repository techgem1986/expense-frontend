import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class BudgetsPage extends BasePage {
  readonly addBudgetButton: Locator;
  readonly budgetTable: Locator;
  readonly noBudgetsMessage: Locator;
  readonly dialogTitle: Locator;
  readonly nameInput: Locator;
  readonly categorySelect: Locator;
  readonly limitAmountInput: Locator;
  readonly periodSelect: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;
  readonly errorMessage: Locator;
  readonly deleteConfirmButton: Locator;
  readonly deleteCancelButton: Locator;
  readonly progressBars: Locator;
  readonly pagination: Locator;

  constructor(page: Page) {
    super(page, '/budgets');
    this.addBudgetButton = page.locator('button:has-text("Add Budget")');
    this.budgetTable = page.locator('table');
    this.noBudgetsMessage = page.locator('text=No budgets found');
    // Updated: Tailwind modal dialog title
    this.dialogTitle = page.locator('[class*="text-xl"][class*="font-semibold"]').first();
    this.nameInput = page.locator('input[name="name"], input#name');
    // Updated: Tailwind select element
    this.categorySelect = page.locator('select[name="categoryId"]').first();
    this.limitAmountInput = page.locator('input[name="limitAmount"], input[type="number"]').first();
    // Updated: Tailwind select element
    this.periodSelect = page.locator('select[name="period"]').last();
    this.submitButton = page.locator('button[type="submit"]');
    this.cancelButton = page.locator('button:has-text("Cancel")').first();
    // Updated: Tailwind error message styling
    this.errorMessage = page.locator('[class*="bg-danger-50"][class*="text-danger-600"]');
    this.deleteConfirmButton = page.locator('button:has-text("Delete")').last();
    this.deleteCancelButton = page.locator('button:has-text("Cancel")').last();
    // Updated: Tailwind progress bars
    this.progressBars = page.locator('[class*="h-2"][class*="rounded-full"]');
    // Updated: Tailwind pagination
    this.pagination = page.locator('div.flex.gap-2:has(button:has-text("Previous")), div:has(button:has-text("Previous")):has(button:has-text("Next"))');
  }

  async goto() {
    await this.navigate();
    await this.waitForPageLoad();
  }

  async clickAddBudget() {
    await this.addBudgetButton.click();
  }

  async fillBudgetForm(data: {
    name: string;
    category: string;
    limitAmount: string;
    period: string;
  }) {
    await this.nameInput.fill(data.name);
    await this.categorySelect.selectOption(data.category);
    await this.limitAmountInput.fill(data.limitAmount);
    await this.periodSelect.selectOption(data.period);
  }

  async submitForm() {
    await this.submitButton.click();
    await this.waitForPageLoad();
  }

  async cancelForm() {
    await this.cancelButton.click();
  }

  async clickEditBudget(budgetName: string) {
    await this.page.locator('tr', { hasText: budgetName }).locator('button[aria-label="Edit budget"]').click();
  }

  async clickDeleteBudget(budgetName: string) {
    await this.page.locator('tr', { hasText: budgetName }).locator('button[aria-label="Delete budget"]').click();
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

  async expectBudgetInList(name: string) {
    await expect(this.page.locator('tr', { hasText: name })).toBeVisible();
  }

  async expectBudgetNotInList(name: string) {
    await expect(this.page.locator('tr', { hasText: name })).not.toBeVisible();
  }

  async expectErrorMessage(expected: string) {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(expected);
  }

  async expectNoErrorMessage() {
    await expect(this.errorMessage).not.toBeVisible();
  }

  async getBudgetRow(name: string) {
    return this.page.locator('tr', { hasText: name });
  }

  async expectBudgetStatus(budgetName: string, status: 'OK' | 'Over Budget') {
    const row = await this.getBudgetRow(budgetName);
    await expect(row).toContainText(status);
  }

  async expectBudgetProgress(budgetName: string, expectedPercentage: string) {
    const row = await this.getBudgetRow(budgetName);
    await expect(row).toContainText(expectedPercentage);
  }
}