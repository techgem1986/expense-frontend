import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class DashboardPage extends BasePage {
  readonly totalIncomeCard: Locator;
  readonly totalExpensesCard: Locator;
  readonly netBalanceCard: Locator;
  readonly saveRateCard: Locator;
  readonly startDateInput: Locator;
  readonly endDateInput: Locator;
  readonly applyButton: Locator;
  readonly categoryChart: Locator;
  readonly monthlyChart: Locator;
  readonly spendingBreakdown: Locator;

  constructor(page: Page) {
    super(page, '/dashboard');
    this.totalIncomeCard = page.locator('text=Total Income').locator('xpath=..').locator('xpath=..');
    this.totalExpensesCard = page.locator('text=Total Expenses').locator('xpath=..').locator('xpath=..');
    this.netBalanceCard = page.locator('text=Net Balance').locator('xpath=..').locator('xpath=..');
    this.saveRateCard = page.locator('text=Save Rate').locator('xpath=..').locator('xpath=..');
    this.startDateInput = page.locator('input[type="date"]').first();
    this.endDateInput = page.locator('input[type="date"]').last();
    this.applyButton = page.locator('button:has-text("Apply")');
    this.categoryChart = page.locator('canvas').first();
    this.monthlyChart = page.locator('canvas').last();
    this.spendingBreakdown = page.locator('text=Spending Breakdown').locator('xpath=..');
  }

  async goto() {
    await this.navigate();
    await this.waitForPageLoad();
  }

  async setDateRange(startDate: string, endDate: string) {
    await this.startDateInput.fill(startDate);
    await this.endDateInput.fill(endDate);
    await this.applyButton.click();
    await this.waitForPageLoad();
  }

  async expectTotalIncome(expected: string) {
    await expect(this.totalIncomeCard).toContainText(expected);
  }

  async expectTotalExpenses(expected: string) {
    await expect(this.totalExpensesCard).toContainText(expected);
  }

  async expectChartsVisible() {
    await expect(this.categoryChart).toBeVisible();
    await expect(this.monthlyChart).toBeVisible();
  }

  async expectSpendingBreakdownVisible() {
    await expect(this.spendingBreakdown).toBeVisible();
  }
}