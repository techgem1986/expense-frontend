import { Page, Locator, expect } from '@playwright/test';

export class BasePage {
  readonly page: Page;
  readonly url: string;

  constructor(page: Page, url: string) {
    this.page = page;
    this.url = url;
  }

  async navigate() {
    await this.page.goto(this.url);
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  get title() {
    return this.page.locator('h1').first();
  }

  async expectTitle(expected: string) {
    await expect(this.title).toHaveText(expected);
  }

  async expectUrl(expected: string) {
    await expect(this.page).toHaveURL(expected);
  }

  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `test-results/${name}.png` });
  }
}