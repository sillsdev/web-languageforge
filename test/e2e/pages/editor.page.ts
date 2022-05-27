import { Locator, Page } from '@playwright/test';
import { ConfigurationPage } from './configuration.page';
import { EntriesListPage } from './entries-list.page';

type LexAppToolbar = {
  backToListButton: Locator,
  toggleCommentsButton: Locator,
  toggleExtraFieldsButton: Locator
};

type AudioPlayer = {
  togglePlaybackAnchorSelector: string,
  playIconSelector: string,
  dropdownToggleSelector: string,
  uploadButtonSelector: string,
  downloadButtonSelector: string
};

type Dropbox = {
  dragoverFieldSelector: string,
  audioCancelButtonSelector: string,
  pictureCancelButtonSelector: string
};

type UploadType =
    'Audio' |
    'Picture'
;

type AudioDropdownMenu = {
  uploadReplacementButtonSelector: string
}

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

  readonly audioPlayer: AudioPlayer;

  readonly dropbox: Dropbox;

  readonly audioDropdownMenu: AudioDropdownMenu;

  readonly addPictureButtonSelector: string;

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

    this.audioPlayer = {
      togglePlaybackAnchorSelector: '[ng-click="$ctrl.togglePlayback()"]',
      playIconSelector: 'i.fa-play',
      dropdownToggleSelector: 'a.dropdown-toggle',
      uploadButtonSelector: 'button.upload-audio',
      downloadButtonSelector: 'a.buttonAppend'
    };

    this.dropbox = {
      dragoverFieldSelector: '.drop-box',
      audioCancelButtonSelector: '#audioAddCancel',
      pictureCancelButtonSelector: '#addCancel'
    };

    this.audioDropdownMenu = {
      uploadReplacementButtonSelector: 'a >> text=Upload a replacement'
    };

    this.addPictureButtonSelector = 'a >> text=Add Picture';

    this.url = `/app/lexicon/${projectId}/#!/editor/entry/`;
  }

  async goto(entryId: string = this.firstEntryId) {
    await this.page.goto(this.url + entryId);

    await this.page.reload();
    // JeanneSonTODO: wait for an element on the page to be visible
    await this.page.waitForTimeout(3000);
  }

  async navigateToEntriesList() {
    await this.lexAppToolbar.backToListButton.click();
  }

  async getTextarea(card: Locator, field: string, ws: string): Promise<Locator> {
    return card.locator(`label:has-text("${field}") >> xpath=.. >> div.input-group:has(span.wsid:has-text("${ws}")) >> textarea`);
  }

  async getSoundplayer(card: Locator, field: string, ws: string): Promise<Locator> {
    return card.locator(`label:has-text("${field}") >> xpath=.. >> div.input-group:has(span.wsid:has-text("${ws}")) >> dc-audio`);
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

  getCancelDropboxButton(card: Locator, uploadType: UploadType): Locator {
    switch (uploadType) {
      case 'Audio':
        return card.locator(this.dropbox.audioCancelButtonSelector);

      case 'Picture':
        return card.locator(this.dropbox.pictureCancelButtonSelector);

      default:
        console.log('Warning: invalid upload type, something went wrong');
        return undefined;
    }
  }

}
