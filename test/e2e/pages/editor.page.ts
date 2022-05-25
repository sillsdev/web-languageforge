import { Locator, Page } from '@playwright/test';
import { ConfigurationPage } from './configuration.page';
import { EntriesListPage } from './entries-list.page';

type LexAppToolbar = {
  backToListButton: Locator,
  toggleCommentsButton: Locator,
  toggleExtraFieldsButton: Locator
};

export class EditorPage {
  readonly page: Page;
  readonly projectId: string;
  readonly firstEntryId: string;

  readonly entriesListPage: EntriesListPage;
  readonly configurationPage: ConfigurationPage;

  readonly lexAppToolbar: LexAppToolbar;
  readonly renderedDivs: Locator;

  readonly entryCard: Locator;
  readonly senseCard: Locator;

  readonly compactEntryListContainer: Locator;
  readonly compactEntryListItem: Locator;

  readonly url: string;

  constructor(page: Page, projectId: string, firstEntryId: string) {
    this.page = page;
    this.projectId = projectId;
    this.firstEntryId = firstEntryId;

    this.entriesListPage = new EntriesListPage(this.page, this.projectId);
    this.configurationPage = new ConfigurationPage(this.page, this.projectId);

    this.lexAppToolbar = {
      backToListButton: this.page.locator('#toListLink'),
      toggleCommentsButton: this.page.locator('#toCommentsLink'),
      toggleExtraFieldsButton: this.page.locator('#toggleHiddenFieldsBtn')
    };
    this.renderedDivs = this.page.locator('.dc-rendered-entryContainer');

    this.entryCard = this.page.locator('.entry-card');
    this.senseCard = this.page.locator('[data-ng-repeat="sense in $ctrl.model.senses"]');

    this.compactEntryListContainer = this.page.locator('#compactEntryListContainer');
    this.compactEntryListItem = this.compactEntryListContainer.locator('.lexiconListItemCompact');

    this.url = `/app/lexicon/${projectId}/#!/editor/entry/${firstEntryId}`;
  }

  async goto() {
    await this.page.goto(this.url);
    // JeanneSonTODO: wait for an element on the page to be visible
    await this.page.waitForTimeout(3000);
  }

  async navigateToEntriesList() {
    await this.lexAppToolbar.backToListButton.click();
  }

  async getTextarea(card: Locator, label: string): Promise<Locator> {
    return card.locator(`label:has-text("${label}") >> xpath=.. >> textarea`);
  }

  async getPicturesOuterDiv(card: Locator): Promise<Locator> {
    return card.locator('[data-ng-switch-when="pictures"]');
  }

  // returns the locator to the picture or undefined if 0 or more than one pictures with this filename are found
  async getPicture(card: Locator, filename: string): Promise<Locator> {
    const picture: Locator = card.locator(`img[src$="${filename}"]`);
    return (await picture.count() == 1 ? picture : undefined);
  }

  async getPictureDeleteButton(card: Locator, pictureFilename: string): Promise<Locator> {
    const button = card.locator(`[data-ng-repeat="picture in $ctrl.pictures"]:has(img[src$="${pictureFilename}"]) >> [title="Delete Picture"]`);
    return (await button.count() == 1 ? button : undefined);
  }

  async getPictureCaption(picture: Locator, languageCode: string = "en"): Promise<Locator> {
    const caption = picture.locator(`xpath=..//.. >> div.input-group:has-Text("${languageCode}") >> textarea`);
    return (await caption.count() == 1 ? caption : undefined);
  }

  getAddPictureButton(card: Locator): Locator {
    return card.locator('a >> text=Add Picture');
  }

  getDropbox(card: Locator): Locator {
    return card.locator('.drop-box');
  }

  getCancelAddingPicture(card: Locator): Locator {
    return card.locator('[title="Cancel Adding Picture"]');
  }

}
