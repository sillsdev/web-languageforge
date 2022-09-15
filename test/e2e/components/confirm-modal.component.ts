import { Locator, Page } from "@playwright/test";

export class ConfirmModalElement {
  readonly page: Page;
  readonly modalDialog: Locator;
  readonly confirmButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.modalDialog = page.locator('.modal-dialog');
    this.confirmButton = this.modalDialog.locator('[data-ng-click="modalOptions.ok()"]');
  }
}
