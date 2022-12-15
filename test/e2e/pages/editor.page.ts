import { expect, Locator, Page } from '@playwright/test';
import { Project } from '../utils/types';
import { BasePage, GotoOptions } from './base-page';
import { ConfigurationPage } from './configuration.page';
import { EntriesListPage } from './entries-list.page';
import { ProjectSettingsPage } from './project-settings.page';

export interface EditorGotoOptions extends GotoOptions {
  entryId?: string;
}

type UploadType =
    'Audio' |
    'Picture'
;

export class EditorPage extends BasePage {
  readonly entriesListPage = new EntriesListPage(this.page, this.project);
  readonly configurationPage = new ConfigurationPage(this.page, this.project);

  readonly settingsMenuLink = this.page.locator('#settings-dropdown-button');
  readonly projectSettingsLink = this.page.locator('#dropdown-project-settings');

  readonly lexAppToolbar = {
    backToListButton: this.page.locator('#toListLink'),
    toggleCommentsButton: this.page.locator('#toCommentsLink'),
    toggleExtraFieldsButton: this.page.locator('#toggleHiddenFieldsBtn')
  };
  readonly renderedDivs = this.page.locator('.dc-rendered-entryContainer');

  readonly search = {
    searchInput: this.page.locator('#editor-entry-search-entries'),
    matchCount: this.page.locator('#totalNumberOfEntries >> span')
  };

  readonly entryCard = this.page.locator('.entry-card');
  readonly senseCard = this.page.locator('.dc-sense.card');
  readonly exampleCardSelector = '.dc-example';
  readonly semanticDomainSelector = '.dc-semanticdomain-value';

  readonly deleteCardButtonSelector = 'a[data-ng-click^="$ctrl.delete"], a[data-ng-click^="$ctrl.remove"]';
  readonly moveDownButtonSelector = 'a[data-ng-click="$ctrl.move($ctrl.index, 1)"]:not(.ng-hide)';
  readonly moveUpButtonSelector = 'a[data-ng-click="$ctrl.move($ctrl.index, -1)"]:not(.ng-hide)';

  readonly compactEntryListContainer = this.page.locator('#compactEntryListContainer');
  readonly compactEntryListItem = this.compactEntryListContainer.locator('.lexiconListItemCompact');

  readonly audioPlayer = {
    togglePlaybackAnchorSelector: '[ng-click="$ctrl.togglePlayback()"]',
    playIconSelector: 'i.fa-play',
    dropdownToggleSelector: 'a.dropdown-toggle',
    uploadButtonSelector: 'button.upload-audio',
    downloadButtonSelector: 'a.buttonAppend',
    slider: 'input.seek-slider',
    audioProgressTime: 'span.audio-progress'
  };

  readonly dropbox = {
    dragoverFieldSelector: '.drop-box',
    audioCancelButtonSelector: '#audioAddCancel',
    pictureCancelButtonSelector: '#addCancel',
    browseButtonSelector: '#browseButton'
  };

  readonly audioDropdownMenu = {
    uploadReplacementButtonSelector: 'a >> text=Upload a replacement',
    deleteAudioButtonSelector: 'a >> text=Delete'
  };

  readonly addPictureButtonSelector = 'a >> text=Add Picture';

  constructor(page: Page, readonly project: Project) {
    super(page, `/app/lexicon/${project.id}/`, page.locator('.words-container-title, .no-entries'));
  }

  async goto(options?: EditorGotoOptions): Promise<void> {
    await super.goto(options);
    const entryId = options?.entryId;
    const gotoEntry = entryId || await this.page.isVisible('[id^=entryId_]');
    if (gotoEntry) {
      // If we're navigating from one entry to another, then goto doesn't cause angular to load the new entry
      // clicking is a more realistic test anyway
      await this.page.locator(`[id^=entryId_${entryId ?? ''}]`).first().click();
      await super.goto({waitFor: this.page.locator('.entry-card')});
    }
    await expect(this.page.locator('.page-name >> text=' + this.project.name)).toBeVisible();
  }

  async navigateToSettings(): Promise<ProjectSettingsPage> {
    await expect(this.settingsMenuLink).toBeVisible();
    await this.settingsMenuLink.click();
    await expect(this.projectSettingsLink).toBeVisible();
    const projectSettingsPage = new ProjectSettingsPage(this.page, this.project);
    await Promise.all([
      this.projectSettingsLink.click(),
      projectSettingsPage.waitForPage(),
    ]);
    return projectSettingsPage;
  }

  async navigateToEntriesList() {
    await this.lexAppToolbar.backToListButton.click();
  }

  getLabel(card: Locator, label: string): Locator {
    return card.locator(`label:has-text("${label}")`).first();
  }

  async getNumberOfElementsWithSameLabel(card: Locator, label: string): Promise<number> {
    return card.locator(`label:has-text("${label}")`).count();
  }

  getTextarea(card: Locator, field: string, ws: string): Locator {
    return card.locator(`label:has-text("${field}") >> xpath=.. >> div.input-group:has(span.wsid:has-text("${ws}")) >> textarea`);
  }

  getDropdown(card: Locator, field: string): Locator {
    return card.locator(`label:has-text("${field}") >> xpath=.. >> select`);
  }

  async getSelectedValueFromSelectDropdown(card: Locator, field: string): Promise<string> {
    return card.locator(`label:has-text("${field}") >> xpath=.. >> select >> [selected="selected"]`).innerText();
  }

  getSoundplayer(card: Locator, field: string, ws: string): Locator {
    return card.locator(`label:has-text("${field}") >> xpath=.. >> div.input-group:has(span.wsid:has-text("${ws}")) >> dc-audio`);
  }

  getPicturesOuterDiv(card: Locator): Locator {
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

  getCancelDropboxButton(card: Locator, uploadType: UploadType): Locator {
    switch (uploadType) {
      case 'Audio':
        return card.locator(this.dropbox.audioCancelButtonSelector);

      case 'Picture':
        return card.locator(this.dropbox.pictureCancelButtonSelector);

      default:
        throw new Error('Warning: invalid upload type, something went wrong');
    }
  }

}
