import { Locator, Page } from "@playwright/test";

// type Comment = {
//   contextGuid: Locator
// }

export class CommentsPanelElement {
  readonly page: Page;
  readonly allComments: Locator;
  //readonly commentLocator: Locator;
  //readonly comment: Comment;
  //readonly contextGuid: string;


  constructor(page: Page) {
    this.page = page;
    this.allComments = page.locator('.commentListContainer');
    // this.comment = page.locator('.commentContainer');
    // this.contextGuid = '[data-ng-bind="$ctrl.comment.contextGuid"]';
  }
}
