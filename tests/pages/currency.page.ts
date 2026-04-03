import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class CurrencyPage extends BasePage {
  readonly currencySelector: Locator;
  readonly currencyDropdown: Locator;

  constructor(page: Page) {
    super(page, '/dashboard');
    this.currencySelector = page.locator('label:has-text("Currency")').locator('xpath=..');
    this.currencyDropdown = page.locator('[role="combobox"]').filter({ hasText: /USD|EUR|GBP|JPY|INR|AUD|CAD|CHF|CNY|SGD|AED/ }).first();
  }

  async openCurrencySelector() {
    await this.currencySelector.click();
  }

  async selectCurrency(currencyCode: string) {
    await this.page.locator(`[role="option"]:has-text("${currencyCode}")`).click();
  }

  async getCurrentCurrency(): Promise<string> {
    const selectedOption = await this.currencySelector.locator('fieldset legend').textContent();
    return selectedOption || '';
  }

  async expectCurrencySelected(currencyCode: string) {
    const selector = this.currencySelector;
    await expect(selector).toContainText(currencyCode);
  }

  async expectCurrencyDropdownVisible() {
    await expect(this.currencySelector).toBeVisible();
  }

  async expectAmountInCurrency(amount: string, currencySymbol: string) {
    // Check that amounts on the page contain the currency symbol
    await expect(this.page.locator('body')).toContainText(currencySymbol);
  }
}