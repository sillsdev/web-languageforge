import { expect, Locator, Page } from '@playwright/test';
import { AudioPlayer, EditorComment } from '../components';
import { Project } from '../utils';
import { BasePage, GotoOptions } from './base-page';
import { ConfigurationPageFieldsTab } from './configuration-fields.tab';
import { EntryListPage } from './entry-list.page';
import { ProjectSettingsPage } from './project-settings.page';

export interface EditorGotoOptions extends GotoOptions {
  entryId?: string;
}

type UploadType =
  'Audio' |
  'Picture'
  ;

export type EntryList = Omit<EntryListPage, keyof BasePage<EntryListPage>>;

export class EditorPage extends BasePage<EditorPage> {

  readonly entryList: EntryList = new EntryListPage(this.page, this.project);

  readonly settingsMenuLink = this.locator('#settings-dropdown-button');
  readonly settingsMenu = {
    projectSettingsLink: this.locator('#dropdown-project-settings'),
    configurationLink: this.locator('#dropdown-configuration'),
  };
  readonly renderedDivs = this.locator('.dc-rendered-entryContainer');

  readonly search = {
    searchInput: this.locator('#editor-entry-search-entries'),
    matchCount: this.locator('#totalNumberOfEntries >> span')
  };

  readonly noEntries = this.locator('.no-entries');
  readonly entryCard = this.locator('.entry-card');
  readonly senseCard = this.locator('.dc-sense.card');
  readonly exampleCardSelector = '.dc-example';
  readonly semanticDomainSelector = '.dc-semanticdomain-value';

  readonly deleteCardButtonSelector = 'a[data-ng-click^="$ctrl.delete"], a[data-ng-click^="$ctrl.remove"]';
  readonly moveDownButtonSelector = 'a[data-ng-click="$ctrl.move($ctrl.index, 1)"]:not(.ng-hide)';
  readonly moveUpButtonSelector = 'a[data-ng-click="$ctrl.move($ctrl.index, -1)"]:not(.ng-hide)';

  readonly compactEntryListContainer = this.locator('#compactEntryListContainer');
  readonly compactEntryListItem = this.compactEntryListContainer.locator('.lexiconListItemCompact');

  readonly dropbox = {
    dragoverFieldSelector: '.drop-box',
    audioCancelButtonSelector: '#audioAddCancel',
    pictureCancelButtonSelector: '#addCancel'
  };

  readonly addPictureButtonSelector = 'a >> text=Add Picture';

  entryUrl(entryId: string): RegExp {
    return new RegExp(`${this.url}/?#!/editor/entry/${entryId}`)
  }

  fieldGroup(name: string): Locator {
    return this.locator(`.field-container:has(label:has-text("${name}"))`);
  }

  field(name: string, inputSystemAbbr?: string): Locator {
    return this.fieldGroup(name).locator('.comment-bubble-group', {
      has: inputSystemAbbr ? this.locator(`.wsid:text("${inputSystemAbbr}")`) : undefined,
    });
  }

  audioPlayer(fieldName: string, inputSystemAbbr?: string): Locator {
    return this.field(fieldName, inputSystemAbbr).locator('dc-audio');
  }

  commentBubble(fieldName: string, inputSystemAbbr?: string): Locator {
    return this.field(fieldName, inputSystemAbbr).locator('a');
  }

  commentCount(fieldName: string, inputSystemAbbr?: string): Locator {
    return this.commentBubble(fieldName, inputSystemAbbr).locator('.commentCount');
  }

  readonly commentTextArea = this.locator('.newCommentForm textarea');
  readonly postCommentButton = this.locator('#comment-panel-post-button');

  readonly commentsSearchBar = this.locator(`.comments-search-container`);
  readonly commentsButton = this.locator(`#toCommentsLink`);
  readonly commentContainer = this.locator(`.commentListContainer`);
  readonly comments = this.commentContainer.locator(`> div:visible`);
  readonly comment = (n: number) => this.locator(`.commentListContainer > div:nth-child(${n}) .commentContainer`);

  private readonly lexAppToolbar = {
    backToListButton: this.locator('#toListLink'),
    toggleCommentsButton: this.locator('#toCommentsLink'),
    toggleExtraFieldsButton: this.locator('#toggleHiddenFieldsBtn')
  };

  /**
   * Use when creating a new project via the UI
   * when no Project-ID is available for the EditorPage
   */
  static async waitForNewProject(page: Page, project: Omit<Project, 'id'>): Promise<EditorPage> {
    const projectIdPattern = new RegExp('app/lexicon/([^#]*)#');
    await page.waitForURL(projectIdPattern);
    const id = page.url().match(projectIdPattern)[1];
    return new EditorPage(page, { ...project, id }).waitForPage();
  }

  constructor(page: Page, readonly project: Project) {
    super(page, `/app/lexicon/${project.id}`, page.locator('.words-container-title:visible, .no-entries:visible'));
  }

  async goto(options?: EditorGotoOptions): Promise<EditorPage> {
    const alreadyOnPage = this.page.url().endsWith(this.url) || this.page.url().includes('#!/editor');
    await super.goto(options);
    const entryId = options?.entryId;
    if (entryId || alreadyOnPage) {
      // If we're navigating from one entry to another, then goto doesn't cause angular to load the new entry
      // clicking is a more realistic test anyway
      await Promise.all([
        this.locator(`[id^=entryId_${entryId ?? ''}]`).first().click(),
        this.waitForPage(),
      ]);
    }
    await expect(this.locator('.page-name >> text=' + this.project.name)).toBeVisible();
    return this;
  }

  async waitForPage(): Promise<EditorPage> {
    await super.waitForPage();
    if (await this.page.isVisible('[id^=entryId_]')) {
      await this.locator('.entry-card').waitFor();
    }
    return this;
  }

  async navigateToProjectSettings(): Promise<ProjectSettingsPage> {
    await this.settingsMenuLink.click();
    const projectSettingsPage = new ProjectSettingsPage(this.page, this.project);
    await Promise.all([
      this.settingsMenu.projectSettingsLink.click(),
      projectSettingsPage.waitForPage(),
    ]);
    return projectSettingsPage;
  }

  async navigateToProjectConfiguration(): Promise<ConfigurationPageFieldsTab> {
    await this.settingsMenuLink.click();
    const configurationPage = new ConfigurationPageFieldsTab(this.page, this.project);
    await Promise.all([
      this.settingsMenu.configurationLink.click(),
      configurationPage.waitForPage(),
    ]);
    return configurationPage;
  }

  async navigateToEntriesList() {
    await this.lexAppToolbar.backToListButton.click();
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

  getAudioPlayer(fieldName: string, inputSystemAbbr?: string): AudioPlayer {
    return new AudioPlayer(this.audioPlayer(fieldName, inputSystemAbbr));
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

  async showExtraFields(show = true): Promise<void> {
    const showingExtraFields = !(await this.lexAppToolbar.toggleExtraFieldsButton.innerText()).includes('Show Extra Fields');
    if (show !== showingExtraFields) {
      await this.lexAppToolbar.toggleExtraFieldsButton.click();
    }
  }

  getComment(n: number = 1): EditorComment {
    return new EditorComment(this.comment(n));
  }

  async postComment(text: string): Promise<EditorComment> {
    const currNumComments = await this.comments.count();
    const newCommentNumber = currNumComments + 1;
    await this.commentTextArea.type(text);
    await this.postCommentButton.click();
    const comment = this.getComment(newCommentNumber);
    await comment.commentDate.waitFor();
    return comment;
  }

  async toggleComments(fieldName: string, inputSystemAbbr?: string): Promise<void> {
    await this.commentBubble(fieldName, inputSystemAbbr).click();
    await this.waitIfCommentsAreClosing();
  }

  async toggleAllComments(): Promise<void> {
    await this.commentsButton.click();
    await this.waitIfCommentsAreClosing();
  }

  private async waitIfCommentsAreClosing(): Promise<void> {
    const isClosing = await this.locator(`#lexAppCommentView.panel-closing`).isVisible();
    if (isClosing) {
      await this.locator(`#lexAppCommentView:not(.panel-closing)`).waitFor({ state: 'attached' });
    }
  }
}
