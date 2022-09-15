import { Locator, Page } from "@playwright/test";

export class NoticeElement {
  readonly page: Page;
  readonly notice: Locator;
  readonly noticeMessage: Locator;
  readonly noticeDetails: Locator;
  readonly closeButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.notice = page.locator('[ng-repeat="notice in $ctrl.notices()"]');
    this.noticeMessage = page.locator('[data-ng-hide="notice.details"]');
    this.noticeDetails = page.locator('[ng-show="notice.details"]');
    this.closeButton = this.notice.locator('.close');
  }
}
