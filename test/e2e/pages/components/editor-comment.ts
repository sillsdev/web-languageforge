import { Locator } from "@playwright/test";
import { BaseComponent } from './base-component';

export class EditorComment extends BaseComponent {

  readonly content = this.locator('.commentContentContainer .commentContent');
  readonly replyTextArea = this.locator('.commentNewReplyForm textarea');
  readonly commentDate = this.locator('.commentContentContainer .comment-date');
  readonly postReplyButton = this.locator('.commentNewReplyForm button[type="submit"]');
  readonly repliesButton = this.locator('.comment-actions .btn-comments');
  readonly likeButton = this.locator('.comment-actions .can-like');
  private readonly _stateButton = this.locator('.comment-actions .btn-todo > div:visible');
  readonly stateButton = {
    markToDo: this._stateButton.locator('.mark-todo'),
    resolveToDo: this._stateButton.locator('.resolve-todo'),
    openToDo: this._stateButton.locator('.open-todo'),
  }
  readonly replies = this.locator(`.comment-replies > div`);

  readonly reply = (n: number = 1): Locator => this.locator(`.comment-replies > div:nth-child(${n}) .comment-reply`);
  readonly likes = this.locator('.likes');

  constructor(locator: Locator) {
    super(locator);
  }

  async toggleReplies() {
    await this.repliesButton.click();
  }

  getReply(n: number): EditorReply {
    return new EditorReply(this.reply(n));
  }

  async postReply(text: string): Promise<EditorReply> {
    const currNumReplies = await this.replies.count();
    const newReplyNumber = currNumReplies + 1;
    await this.replyTextArea.type(text);
    await this.postReplyButton.click();
    const reply = this.getReply(newReplyNumber);
    await reply.replyDate.waitFor();
    return reply;
  }
}

export class EditorReply extends BaseComponent {

  readonly content = this.locator('.reply-content');
  readonly replyDate = this.locator('.comment-date');

  constructor(locator: Locator) {
    super(locator);
  }
}
