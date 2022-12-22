import { Page } from "@playwright/test";
import { BaseComponent } from './base-component';

export class NoticeElement extends BaseComponent {

  readonly notices = this.componentLocator;
  readonly noticeMessage = this.locator('[data-ng-hide="notice.details"]');
  readonly noticeDetails = this.locator('[ng-show="notice.details"]');
  readonly closeButton = this.locator('.close');
  readonly success = (text: string) => this.locator(`.alert-success :text("${text}"):visible`);

  constructor(page: Page) {
    super(page.locator('[ng-repeat="notice in $ctrl.notices()"]'));
  }
}
