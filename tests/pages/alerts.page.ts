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
    this.errorMessage = page.locator('.MuiAlert-root.MuiAlert-colorError');
    this.pagination = page.locator('.MuiPagination-root');
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
    await this.page.locator('tr', { hasText: alertMessage }).locator('button[title="Mark as read"]').click();
    await this.waitForPageLoad();
  }

  async clickDeleteAlert(alertMessage: string) {
    await this.page.locator('tr', { hasText: alertMessage }).locator('button[aria-label="delete"]').click();
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