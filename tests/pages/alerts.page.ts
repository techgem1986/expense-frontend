import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class AlertsPage extends BasePage {
  readonly markAllAsReadButton: Locator;
  readonly alertTable: Locator;
  readonly noAlertsMessage: Locator;
  readonly deleteConfirmButton: Locator;
  readonly deleteCancelButton: Locator;
  readonly errorMessage: Locator;
  readonly pagination: Locator;

  constructor(page: Page) {
    super(page, '/alerts');
    this.markAllAsReadButton = page.locator('button:has-text("Mark All as Read")');
    this.alertTable = page.locator('table');
    this.noAlertsMessage = page.locator('text=No alerts found');
    this.deleteConfirmButton = page.locator('button:has-text("Delete")').last();
    this.deleteCancelButton = page.locator('button:has-text("Cancel")').last();
    // Updated: Tailwind error message styling
    this.errorMessage = page.locator('[class*="bg-danger-50"][class*="text-danger-600"]');
    // Updated: Tailwind pagination
    this.pagination = page.locator('div.flex.gap-2:has(button:has-text("Previous")), div:has(button:has-text("Previous")):has(button:has-text("Next"))');
  }

  async goto() {
    await this.navigate();
    await this.waitForPageLoad();
  }

  async clickMarkAllAsRead() {
    await this.markAllAsReadButton.click();
    await this.waitForPageLoad();
  }

  async clickMarkAsRead(alertMessage: string) {
    await this.page.locator('tr', { hasText: alertMessage }).locator('button[aria-label="Mark as read"]').click();
    await this.waitForPageLoad();
  }

  async clickDeleteAlert(alertMessage: string) {
    await this.page.locator('tr', { hasText: alertMessage }).locator('button[aria-label="Delete alert"]').click();
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

  async expectAlertInList(message: string) {
    await expect(this.page.locator('tr', { hasText: message })).toBeVisible();
  }

  async expectAlertNotInList(message: string) {
    await expect(this.page.locator('tr', { hasText: message })).not.toBeVisible();
  }

  async expectAlertStatus(message: string, status: 'Read' | 'Unread') {
    const row = this.page.locator('tr', { hasText: message });
    await expect(row).toContainText(status);
  }

  async expectErrorMessage(expected: string) {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(expected);
  }

  async expectNoErrorMessage() {
    await expect(this.errorMessage).not.toBeVisible();
  }

  async expectNoAlerts() {
    await expect(this.noAlertsMessage).toBeVisible();
  }

  async getAlertRow(message: string) {
    return this.page.locator('tr', { hasText: message });
  }
}