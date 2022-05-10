import { Locator, Page } from "@playwright/test";

// type Comment = {
//   contextGuid: Locator
// }

export class SingleCommentElement {
  readonly page: Page;
  readonly commentLocator: Locator;
  readonly contextGuid: Locator;
  readonly likeCounter: Locator;
  readonly likeButton: Locator;
  readonly disabledLikeButton: Locator;
  readonly date: Locator;

  readonly regardingField: Locator;

  constructor(page: Page, commentText: string) {
    this.page = page;
    this.commentLocator = this.page.locator('[data-ng-repeat="comment in $ctrl.currentEntryCommentsFiltered"]', {hasText: commentText});

    this.contextGuid = this.commentLocator.locator('[data-ng-bind="$ctrl.comment.contextGuid"]');
    this.likeCounter = this.commentLocator.locator('text=/\\d+ Likes?/');
    this.likeButton = this.commentLocator.locator('[data-ng-click="$ctrl.plusOneComment({ commentId: $ctrl.comment.id })"]');
    this.disabledLikeButton = this.commentLocator.locator('[data-ng-hide="$ctrl.canLike()"]');
    this.date = this.commentLocator.locator('.comment-date');

    this.regardingField = this.commentLocator.locator('div.commentRegarding');
  }
}
