import { Locator, Page } from "@playwright/test";
import { BaseComponent } from './base-component';

export class ConfirmModal extends BaseComponent {

  readonly confirmButton = this.locator('[data-ng-click="modalOptions.ok()"]');

  constructor(page: Page) {
    super(page.locator('.modal-dialog'));
  }
}
