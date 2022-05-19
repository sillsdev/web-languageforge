import { expect, Locator, Page } from '@playwright/test';
import { EntriesListPage } from './entries-list.page';
import { CommentsPanelElement } from '../components/comments-panel.component';

type LexAppToolbar = {
  backToListButton: Locator,
  toggleCommentsButton: Locator
};

type EntryCard = {
  entryName: string
};

// TOASK: rename this to MeaningCard?
type SenseCard = {
  senseCardLocator: Locator,
  definitionInput: Locator
};

export class EditorPage {
  readonly page: Page;
  readonly projectId: string;

  readonly entriesListPage: EntriesListPage;
  readonly commentsPanelElement: CommentsPanelElement;

  readonly lexAppToolbar: LexAppToolbar;
  readonly entryCard: EntryCard;
  readonly senseCard: SenseCard;

  readonly commentsRightPanel: Locator;
  readonly lexAppCommentView: Locator;
  readonly lexAppEditView: Locator;
  readonly commentSearchContainer: Locator;

  readonly firstCommentBubbleButton: Locator;
  readonly secondCommentBubbleButton: Locator;
  readonly thirdCommentBubbleButton: Locator;
  readonly commentCreationTextInput: Locator;
  readonly commentCreationPostButton: Locator;

  readonly url: string;

  constructor(page: Page, projectId: string) {
    this.page = page;
    this.projectId = projectId;

    this.entriesListPage = new EntriesListPage(this.page, this.projectId);
    this.commentsPanelElement = new CommentsPanelElement(this.page);

    this.lexAppToolbar = {
      backToListButton: this.page.locator('#toListLink'),
      toggleCommentsButton: this.page.locator('#toCommentsLink')
    };
    this.entryCard = {
      entryName: '.entry-card >> textarea'
    };
    this.senseCard = {
      senseCardLocator: this.page.locator('[data-ng-repeat="sense in $ctrl.model.senses"]'),
      definitionInput: this.page.locator('[data-ng-repeat="tag in $ctrl.config.inputSystems"]:has-text("Definition") >> textarea')
    }

    this.commentsRightPanel = this.page.locator('comments-right-panel');
    this.lexAppCommentView = this.page.locator('#lexAppCommentView');
    this.lexAppEditView = this.page.locator('#lexAppEditView');
    this.commentSearchContainer = this.page.locator('.comments-search-container');

    this.firstCommentBubbleButton = this.page.locator('.commentBubble').nth(1);
    this.secondCommentBubbleButton = this.page.locator('.commentBubble').nth(2);
    this.thirdCommentBubbleButton = this.page.locator('.commentBubble').nth(3);
    this.commentCreationTextInput = this.page.locator('[placeholder="Your comment goes here.  Be the first to share!"]');
    this.commentCreationPostButton = this.page.locator('button:has-text("Post")');

    this.url = `/app/lexicon/${projectId}/#!/editor/`;
  }

  async goto() {
    await this.page.goto(this.url);
  }

  async navigateToEntriesList() {
    await this.lexAppToolbar.backToListButton.click();
  }

  async classesOfLocator(locator: Locator): Promise<string[]> {
    return (await locator.getAttribute('class')).split(" ");
  }

  async closeAllComments(positionClosed: number) {
    const currentHorizontalPositionBubble: number = await this.firstCommentBubbleButton.evaluate(ele => ele.getBoundingClientRect().left);
    if (currentHorizontalPositionBubble == positionClosed) {
      console.log('is apparently closed');

    }

    //
    //const lexAppEditView: Locator = this.page.locator('#lexAppEditView');
    let atbs = await this.lexAppEditView.getAttribute('class');
    console.log(atbs);


    // const widthLexAppCommentView: string = await this.lexAppCommentView.evaluate(ele => window.getComputedStyle(ele).getPropertyValue('width'));
    // if (widthLexAppCommentView != '0px') {
    //   console.log('should close');

    // }
    // const commentsRightPanel: Locator = this.page.locator('comments-right-panel');
    // const width = await commentsRightPanel.evaluate(ele => window.getComputedStyle(ele).getPropertyValue('width'));
    // console.log(width);

  }

  // async openSpecificComment(commentBubbleButton: Locator) {
  //   await this.closeAllComments();
  //   const positionCommentBubbleButtonComment = await commentBubbleButton.evaluate(ele => ele.getBoundingClientRect().left);
  //   await commentBubbleButton.click();
  //   const secondPositionCommentBubbleButtonComment = await commentBubbleButton.evaluate(ele => ele.getBoundingClientRect().left);
  //   console.log(typeof secondPositionCommentBubbleButtonComment);

  //   if (positionCommentBubbleButtonComment == secondPositionCommentBubbleButtonComment) {
  //     await commentBubbleButton.click();
  //   }
  //   if (await commentBubbleButton.evaluate(ele => ele.getBoundingClientRect().left > secondPositionCommentBubbleButtonComment)) {
  //     // is closed, now open
  //     await commentBubbleButton.click();
  //   }
  //   await expect(this.lexAppEditView).not.toHaveClass('right-panel-visible');
  //   console.log('closed - ' + positionCommentBubbleButtonComment);
  //   console.log('open   - ' + secondPositionCommentBubbleButtonComment);

  //   await this.page.pause();
  // }

  async locatorHasClass(locator: Locator, potentialClass: string): Promise<boolean> {
    return (await locator.getAttribute('class')).includes(potentialClass);
  }

  async closeAllComments1() {
    // lexAppCommentView -> class panel-visible
    if (this.locatorHasClass(this.lexAppCommentView, 'panel-visible')) {
      await this.lexAppToolbar.toggleCommentsButton.click();
      if (this.locatorHasClass(this.lexAppCommentView, 'panel-visible')) {
        await this.lexAppToolbar.toggleCommentsButton.click();
      }
    }
    await expect(this.lexAppCommentView).not.toHaveClass(/panel-visible/);
    await expect(this.lexAppEditView).not.toHaveClass(/right-panel-visible/);
  }

  async openSpecificComment1(commentBubbleLocator: Locator, commentText: string) {
    // make sure all comments are closed
    await this.closeAllComments1();

    // open comment by clicking on bubble
    await commentBubbleLocator.click();
    await this.page.waitForTimeout(1000);

    if (!this.locatorHasClass(this.lexAppCommentView, 'panel-visible')) {
      await commentBubbleLocator.click();
    }
    if (!this.locatorHasClass(this.lexAppCommentView, 'panel-visible')) {
      await commentBubbleLocator.click();
      // wait for 1 second
      await this.page.waitForTimeout(1000);
      console.log('not visible');

    }
    const commentDescription: Locator = this.page.locator('text=' + commentText);
    const nFoundElements = await commentDescription.count();
    for (let i = 1; i <= nFoundElements; i++) {
      console.log(await commentDescription.nth(i).innerHTML());
      console.log(await commentDescription.nth(i).getAttribute('class'));

    }
    await this.page.locator('text=' + commentText).click();
    await expect(this.page.locator('text=' + commentText)).toBeVisible();
    await expect(this.page.locator('.comments-right-panel-container')).toHaveClass(/context-mode/);
    await expect(this.lexAppCommentView).toHaveClass(/panel-visible/);
  }
  // JeanneSonTODO
  //aync openEmptyComment
}
