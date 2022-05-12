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
  readonly commentsPanel: Locator;
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
      definitionInput:  this.page.locator('[data-ng-repeat="tag in $ctrl.config.inputSystems"]:has-text("Definition") >> textarea')
    }

    this.commentsRightPanel = this.page.locator('comments-right-panel');
    this.commentsPanel = this.page.locator('#lexAppCommentView');
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
    // work around bug
    const lexAppCommentView: Locator = this.page.locator('#lexAppCommentView');
    // await lexAppCommentView.evaluate(
    //   node => {
    //     node.classList.add('panel-visible')
    //   }
    // );
  }

  async navigateToEntriesList() {
    await this.lexAppToolbar.backToListButton.click();
  }

  async getWidthOfCommentsRightPanel() {
    const commentsRightPanel: Locator = this.page.locator('comments-right-panel');
    const width = await commentsRightPanel.evaluate(ele => window.getComputedStyle(ele).getPropertyValue('width'));
    console.log(width);

  }
}
