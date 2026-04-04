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
  readonly accountBalancesSection: Locator;
  readonly accountBalanceWidgets: Locator;
  readonly dateRangeDisplay: Locator;
  readonly currentMonthButton: Locator;
  readonly previousMonthButton: Locator;
  readonly yearToDateButton: Locator;
  readonly lastYearButton: Locator;
  readonly prevNavButton: Locator;
  readonly nextNavButton: Locator;

  constructor(page: Page) {
    super(page, '/dashboard');
    this.totalIncomeCard = page.locator('text=Total Income').locator('xpath=..').locator('xpath=..');
    this.totalExpensesCard = page.locator('text=Total Expenses').locator('xpath=..').locator('xpath=..');
    this.netBalanceCard = page.locator('text=Net Balance').locator('xpath=..').locator('xpath=..');
    this.saveRateCard = page.locator('text=Save Rate').locator('xpath=..').locator('xpath=..');
    this.startDateInput = page.locator('label:has-text("Start Date") + div input[type="date"], input[type="date"]').first();
    this.endDateInput = page.locator('label:has-text("End Date") + div input[type="date"], input[type="date"]').last();
    this.applyButton = page.locator('button:has-text("Apply")');
    this.categoryChart = page.locator('canvas').first();
    this.monthlyChart = page.locator('canvas').last();
    this.spendingBreakdown = page.locator('text=Spending Breakdown').locator('xpath=..');
    this.accountBalancesSection = page.locator('text=Account Balances').locator('xpath=..').locator('xpath=..').locator('xpath=..');
    this.accountBalanceWidgets = page.locator('[class*="bg-gray-50"]').filter({ has: page.locator('[aria-label*="wallet"], svg') });
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

  async setDateRange(startDate: string, endDate: string) {
    await this.startDateInput.fill(startDate);
    await this.endDateInput.fill(endDate);
    await this.applyButton.click();
    await this.waitForPageLoad();
  }

  async setStartDate(startDate: string) {
    await this.startDateInput.fill(startDate);
  }

  async setEndDate(endDate: string) {
    await this.endDateInput.fill(endDate);
  }

  async clickApply() {
    await this.applyButton.click();
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

  async expectAccountBalancesVisible() {
    await expect(this.accountBalancesSection).toBeVisible();
  }

  async expectAccountBalanceWidgetCount(expected: number) {
    await expect(this.accountBalanceWidgets).toHaveCount(expected);
  }

  async expectAccountBalanceContains(accountName: string) {
    await expect(this.accountBalancesSection).toContainText(accountName);
  }

  async expectDateRangeDisplayed(startDate: string, endDate: string) {
    await expect(this.dateRangeDisplay).toBeVisible();
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
}
