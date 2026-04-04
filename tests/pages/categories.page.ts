import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class CategoriesPage extends BasePage {
  readonly addCategoryButton: Locator;
  readonly categoryTable: Locator;
  readonly noCategoriesMessage: Locator;
  readonly dialogTitle: Locator;
  readonly nameInput: Locator;
  readonly descriptionInput: Locator;
  readonly typeSelect: Locator;
  readonly submitButton: Locator;
  readonly cancelButton: Locator;
  readonly errorMessage: Locator;
  readonly deleteConfirmButton: Locator;
  readonly deleteCancelButton: Locator;

  constructor(page: Page) {
    super(page, '/categories');
    this.addCategoryButton = page.locator('button:has-text("Add Category")');
    this.categoryTable = page.locator('table');
    this.noCategoriesMessage = page.locator('text=No categories found');
    // Updated: Tailwind modal dialog title
    this.dialogTitle = page.locator('[class*="text-xl"][class*="font-semibold"]').first();
    this.nameInput = page.locator('input[name="name"], input#name');
    this.descriptionInput = page.locator('textarea[name="description"], input[name="description"]');
    // Updated: Tailwind select element
    this.typeSelect = page.locator('select[name="type"]').first();
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

  async clickAddCategory() {
    await this.addCategoryButton.click();
  }

  async fillCategoryForm(name: string, description: string, type: 'INCOME' | 'EXPENSE') {
    await this.nameInput.fill(name);
    await this.descriptionInput.fill(description);
    await this.typeSelect.selectOption(type);
  }

  async submitForm() {
    await this.submitButton.click();
    await this.waitForPageLoad();
  }

  async cancelForm() {
    await this.cancelButton.click();
  }

  async clickEditCategory(categoryName: string) {
    await this.page.locator('tr', { hasText: categoryName }).locator('button[aria-label="Edit category"]').click();
  }

  async clickDeleteCategory(categoryName: string) {
    await this.page.locator('tr', { hasText: categoryName }).locator('button[aria-label="Delete category"]').click();
  }

  async confirmDelete() {
    await this.deleteConfirmButton.click();
    await this.waitForPageLoad();
  }

  async cancelDelete() {
    await this.deleteCancelButton.click();
  }

  async expectCategoryInList(name: string) {
    await expect(this.page.locator('tr', { hasText: name })).toBeVisible();
  }

  async expectCategoryNotInList(name: string) {
    await expect(this.page.locator('tr', { hasText: name })).not.toBeVisible();
  }

  async expectErrorMessage(expected: string) {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(expected);
  }

  async expectNoErrorMessage() {
    await expect(this.errorMessage).not.toBeVisible();
  }

  async getCategoryRow(name: string) {
    return this.page.locator('tr', { hasText: name });
  }
}