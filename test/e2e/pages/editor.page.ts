import { expect, Locator, Page } from '@playwright/test';

export class EditorPage {
  readonly page: Page;
  readonly projectId: string;

  readonly url: string;

  constructor(page: Page, projectId: string) {
    this.page = page;
    this.projectId = projectId;
    this.url = `/app/lexicon/${projectId}/#!/editor/`;
  }

  async goto() {
    await this.page.goto(this.url);
  }
}
