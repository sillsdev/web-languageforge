import { Page } from "@playwright/test";

export class NoticeElement {

  readonly notices = this.page.locator('[ng-repeat="notice in $ctrl.notices()"]');
  readonly noticeMessage = this.page.locator('[data-ng-hide="notice.details"]');
  readonly noticeDetails = this.page.locator('[ng-show="notice.details"]');
  readonly closeButton = this.notices.locator('.close');

  constructor(private readonly page: Page) {
  }
}
