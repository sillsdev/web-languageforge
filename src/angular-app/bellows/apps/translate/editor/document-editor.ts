import * as angular from 'angular';
import Quill, { RangeStatic } from 'quill';

import { InputSystem } from '../../../shared/model/input-system.model';
import { DocType, SaveState } from '../core/constants';
import { MachineService } from '../core/machine.service';
import { MetricService } from './metric.service';
import { SuggestionsTheme } from './quill/suggestions-theme';
import { RealTimeService } from './realtime.service';
import { Segment } from './segment';
import { MachineSegmenter, Segmenter, UsxSegmenter } from './segmenter';

export abstract class DocumentEditor {
  protected static readonly INITIAL_BLANK_TEXT = '\u00a0';
  protected static readonly NORMAL_BLANK_TEXT = '\u2003\u2003';

  static isTextEmpty(text: string): boolean {
    text = text.endsWith('\n') ? text.substr(0, text.length - 1) : text;
    return text === '';
  }

  modulesConfig: any = {};
  inputSystem: InputSystem = new InputSystem();

  protected segmenter: Segmenter;
  private _currentSegment: Segment;
  private _isScripture: boolean = false;

  private documentSetId: string = '';
  private readonly _created: angular.IDeferred<boolean>;
  private _quill: Quill;
  private initialSegmentRef: string = '';
  private initialSegmentChecksum: number;
  private _isOpening: boolean = true;

  constructor(protected readonly $q: angular.IQService, protected readonly machine: MachineService,
              private readonly realTime: RealTimeService) {
    this._created = this.$q.defer();
    this.segmenter = new MachineSegmenter(this, machine);
  }

  abstract get docType(): string;
  abstract get label(): string;

  get quill(): Quill {
    return this._quill;
  }

  set quill(value: Quill) {
    this._quill = value;
    this._created.resolve(true);
  }

  get hasFocus(): boolean {
    return this.quill != null && this.quill.hasFocus();
  }

  get created(): angular.IPromise<boolean> {
    return this._created.promise;
  }

  get currentSegment(): Segment {
    return this._currentSegment;
  }

  get currentSegmentDocumentSetId(): string {
    return this.currentSegment == null ? '' : this.currentSegment.documentSetId;
  }

  get currentSegmentRef(): string {
    return this.currentSegment == null ? '' : this.currentSegment.ref;
  }

  get currentSegmentChecksum(): number {
    return this.currentSegment == null ? null : this.currentSegment.checksum;
  }

  get saveState(): SaveState {
    return this.getSaveState();
  }

  get isTextEmpty(): boolean {
    return DocumentEditor.isTextEmpty(this.quill.getText());
  }

  get isScripture(): boolean {
    return this._isScripture;
  }

  set isScripture(value: boolean) {
    if (value !== this._isScripture) {
      this._isScripture = value;
      this.segmenter = value ? new UsxSegmenter(this) : new MachineSegmenter(this, this.machine);
    }
  }

  get isOpening(): boolean {
    return this._isOpening;
  }

  setInitialSegment(segmentRef: string, checksum: number): void {
    this.initialSegmentRef = segmentRef;
    this.initialSegmentChecksum = checksum;
  }

  isBackspaceAllowed(range: RangeStatic, context: any): boolean {
    if (!this.isScripture) {
      return true;
    }

    if (range.length > 0) {
      const text = this.quill.getText(range.index, range.length);
      return text !== '';
    }

    return range.index !== this.currentSegment.range.index;
  }

  isDeleteAllowed(range: RangeStatic, context: any): boolean {
    if (!this.isScripture) {
      return true;
    }

    if (range.length > 0) {
      const text = this.quill.getText(range.index, range.length);
      return text !== '';
    }

    return range.index !== this.currentSegment.range.index + this.currentSegment.range.length;
  }

  isEnterAllowed(range: RangeStatic, context: any): boolean {
    return !this.isScripture;
  }

  openDocumentSet(collection: string, documentSetId: string): void {
    if (this.documentSetId !== documentSetId) {
      this._isOpening = true;
      // remove placeholder text while the document is opening
      const editorElem = this.quill.container.getElementsByClassName('ql-editor')[0];
      const placeholderText = editorElem.getAttribute('data-placeholder');
      editorElem.setAttribute('data-placeholder', '');
      this.documentSetId = documentSetId;
      this.realTime.createAndSubscribeRichTextDoc(collection, this.docId, this.quill)
        .finally(() => {
          editorElem.setAttribute('data-placeholder', placeholderText);
          this._isOpening = false;
        });
      this.segmenter.reset();
    }
  }

  closeDocumentSet(): void {
    this.quill.blur();
    if (this.docId !== '') {
      this.realTime.disconnectRichTextDoc(this.docId, this.quill);
    }
    this.documentSetId = '';
  }

  update(textChange: boolean): boolean {
    this.segmenter.update(textChange);

    if (textChange && !this.isTextEmpty && this.initialSegmentRef !== '') {
      // navigate to initial segment after document has been loaded
      const range = this.segmenter.getSegmentRange(this.initialSegmentRef);
      setTimeout(() => this.quill.setSelection(range.index + range.length, 0, Quill.sources.USER));
      return false;
    }

    const selection = this.quill.getSelection();
    if (selection == null) {
      return false;
    }
    let segmentRef = this.segmenter.getSegmentRef(selection);
    if (segmentRef == null) {
      segmentRef = this.currentSegment == null ? this.segmenter.lastSegmentRef : this.currentSegment.ref;
    }

    if (this.switchCurrentSegment(segmentRef)) {
      // the selection has changed to a different segment
      return true;
    } else {
      // the selection has not changed to a different segment, so update existing segment
      this.updateCurrentSegment();
      return false;
    }
  }

  switchCurrentSegment(segmentRef: string): boolean {
    let isInitialSegment = false;
    if (this.initialSegmentRef !== '' && this.initialSegmentRef === segmentRef) {
      isInitialSegment = true;
      this.initialSegmentRef = '';
    }

    if (this.currentSegment != null && this.documentSetId === this.currentSegment.documentSetId
      && segmentRef === this.currentSegment.ref
    ) {
      // the selection has not changed to a different segment
      return false;
    }

    this._currentSegment = new Segment(this.documentSetId, segmentRef);
    if (isInitialSegment) {
      // set the checksum for the initial segment
      this.currentSegment.initialChecksum = this.initialSegmentChecksum;
    }
    this.updateCurrentSegment();
    return true;
  }

  syncScroll(otherEditor: DocumentEditor): void {
    if (!otherEditor.hasFocus) {
      return;
    }

    const otherRange = otherEditor.currentSegment.range;
    const otherBounds = otherEditor.quill.selection.getBounds(otherRange.index);

    const thisRange = this.currentSegment.range;
    const thisBounds = this.quill.selection.getBounds(thisRange.index);
    this.quill.scrollingContainer.scrollTop += thisBounds.top - otherBounds.top;
  }

  adjustSelection(): void {
    if (!this.isScripture) {
      return;
    }

    const sel = this.quill.getSelection();
    if (sel == null) {
      return;
    }
    let newSel: RangeStatic;
    if (this.isBlank(this.currentSegment.text)) {
      // always select whole segment if blank
      newSel = this.currentSegment.range;
    } else {
      // ensure that selection does not extend across segments
      const newStart = Math.max(sel.index, this.currentSegment.range.index);
      const oldEnd = sel.index + sel.length;
      const segEnd = this.currentSegment.range.index + this.currentSegment.range.length;
      const newEnd = Math.min(oldEnd, segEnd);
      newSel = { index: newStart, length: Math.max(0, newEnd - newStart) };
    }
    if (sel.index !== newSel.index || sel.length !== newSel.length) {
      this.quill.setSelection(newSel, Quill.sources.SILENT);
    }
  }

  protected getSaveState(): SaveState {
    return this.realTime.getSaveState(this.docId);
  }

  protected toggleHighlight(range: RangeStatic, value: boolean): void {
    if (range.length > 0) {
      // this changes the underlying HTML, which can mess up some Quill events, so defer this call
      setTimeout(() => {
        this.quill.formatText(range.index, range.length, 'highlight', value ? this.docType : false,
          Quill.sources.SILENT);
      });
    }
  }

  protected isBlank(text: string): boolean {
    return text === DocumentEditor.INITIAL_BLANK_TEXT || text === DocumentEditor.NORMAL_BLANK_TEXT;
  }

  private get docId(): string {
    if (this.documentSetId === '') {
      return '';
    }
    return this.documentSetId + ':' + this.docType;
  }

  private updateCurrentSegment() {
    const range = this.segmenter.getSegmentRange(this.currentSegment.ref);
    const text = this.quill.getText(range.index, range.length);
    this.currentSegment.update(text, range);
  }
}

export class TargetDocumentEditor extends DocumentEditor {
  private _suggestions: string[] = [];
  private previousSuggestions: string[] = [];
  private pendingTrainCount: number;
  private isTranslating: boolean = false;
  private initialSegmentUpdate: boolean = false;

  constructor($q: angular.IQService, machine: MachineService, realTime: RealTimeService,
              private readonly metricService: MetricService, private readonly $window: angular.IWindowService
  ) {
    super($q, machine, realTime);
  }

  get docType(): string {
    return DocType.TARGET;
  }

  get label(): string {
    return 'Target';
  }

  get suggestions(): string[] {
    return this._suggestions;
  }

  set suggestions(suggestions: string[]) {
    this.previousSuggestions = this._suggestions;
    this._suggestions = suggestions;
  }

  get confidence(): number {
    return this.machine.suggestionConfidence;
  }

  closeDocumentSet(): void {
    this.hideSuggestions();
    super.closeDocumentSet();
    this.initialSegmentUpdate = false;
  }

  update(textChange: boolean): boolean {
    const prevSegment = this.currentSegment;
    const segmentChanged = super.update(textChange);
    if (segmentChanged) {
      if (prevSegment != null) {
        this.updateHighlight(prevSegment.range);
      }
    } else {
      this.updateSuggestions();
    }

    if (textChange && this.currentSegment != null && this.currentSegment.ref === this.segmenter.lastSegmentRef) {
      this.updateHighlight(this.currentSegment.range);
    }

    if (this.isScripture && textChange) {
      if (!this.isTextEmpty && !this.initialSegmentUpdate) {
        for (const [ref, range] of this.segmenter.segments) {
          this.updateUsxSegmentFormat(ref, range);
        }
        this.initialSegmentUpdate = true;
      } else if (this.currentSegment != null) {
        this.updateUsxSegmentFormat(this.currentSegment.ref, this.currentSegment.range);
      }
    }

    return segmentChanged;
  }

  onStartTranslating(): void {
    this.isTranslating = true;
    this.suggestions = [];
    setTimeout(() => this.showSuggestions());
  }

  onFinishTranslating(): void {
    this.isTranslating = false;
    this.updateSuggestions();
  }

  updateSuggestions(): void {
    if (this.currentSegment == null) {
      return;
    }

    if (!this.isTranslating && this.isSelectionAtSegmentEnd) {
      // only bother updating the suggestion if the cursor is at the end of the segment
      const range = this.skipInitialWhitespace(this.quill.getSelection());
      const text = this.quill.getText(this.currentSegment.range.index, range.index - this.currentSegment.range.index);
      this.suggestions = this.machine.updatePrefix(text);
      if (this.hasSuggestionsChanged && this.hasSuggestions) {
        this.metricService.onSuggestionGiven();
      }
    }
    setTimeout(() => {
      if ((this.isTranslating || this.hasSuggestions) && this.isSelectionAtSegmentEnd) {
        this.showSuggestions();
      } else {
        this.hideSuggestions();
      }
    });
  }

  hideSuggestions(): void {
    (this.quill.theme as SuggestionsTheme).suggestionsTooltip.hide();
  }

  insertSuggestion(suggestionIndex: number = -1): void {
    if (suggestionIndex >= this.machine.getCurrentSuggestion().length) {
      return;
    }

    this.quill.focus();
    const range = this.skipInitialWhitespace(this.quill.getSelection());
    if (range.length > 0) {
      this.quill.deleteText(range.index, range.length, Quill.sources.USER);
    }
    const insertText = this.machine.getSuggestionText(suggestionIndex);
    this.quill.insertText(range.index, insertText + ' ', Quill.sources.USER);
    setTimeout(() => this.quill.setSelection(range.index + insertText.length, 1, Quill.sources.USER));
    this.metricService.onSuggestionTaken();
  }

  get productiveCharacterCount(): number {
    return this.currentSegment.productiveCharacterCount;
  }

  trainSegment(segment: Segment): angular.IPromise<void> {
    if (!this.isSegmentUntrained(segment)) {
      return this.$q.resolve();
    }

    if (this.pendingTrainCount == null) {
      this.pendingTrainCount = 0;
    }
    this.pendingTrainCount++;
    return this.machine.trainSegment()
      .then(() => {
        segment.acceptChanges();
        this.$window.console.log('Segment ' + segment.ref + ' of document ' + segment.documentSetId
          + ' was trained successfully.');
      })
      .finally(() => this.pendingTrainCount--);
  }

  protected getSaveState(): SaveState {
    let trainSaveState: SaveState;
    if (this.pendingTrainCount == null) {
      trainSaveState = SaveState.Unedited;
    } else if (this.pendingTrainCount > 0) {
      trainSaveState = SaveState.Saving;
    } else {
      trainSaveState = SaveState.Saved;
    }
    return Math.min(super.getSaveState(), trainSaveState);
  }

  private skipInitialWhitespace(range: RangeStatic): RangeStatic {
    let i: number;
    for (i = range.index; i < range.index + range.length; i++) {
      const ch = this.quill.getText(i, 1);
      if (ch === DocumentEditor.INITIAL_BLANK_TEXT[0] || ch === DocumentEditor.NORMAL_BLANK_TEXT[0] || !/\s/.test(ch)) {
        return { index: i, length: range.length - (i - range.index) };
      }
    }
    return { index: i, length: 0 };
  }

  private updateUsxSegmentFormat(ref: string, range: RangeStatic): void {
    const text = this.quill.getText(range.index, range.length);

    if (text === '' && range.length === 0) {
      // insert blank
      let blankText: string;
      if (ref.indexOf('/p') !== -1) {
        blankText = DocumentEditor.INITIAL_BLANK_TEXT;
      } else {
        blankText = DocumentEditor.NORMAL_BLANK_TEXT;
      }
      this.quill.insertText(range.index, blankText, Quill.sources.USER);
      range = { index: range.index, length: blankText.length };
    }

    const formats = this.quill.getFormat(range.index, range.length);
    if (formats.segment == null) {
      // add segment format if missing
      this.quill.formatText(range.index, range.length, 'segment', ref, Quill.sources.USER);
    }
  }

  private showSuggestions(): void {
    if (!this.isSelectionAtSegmentEnd) {
      return;
    }

    const selection = this.quill.getSelection();
    const tooltip = (this.quill.theme as SuggestionsTheme).suggestionsTooltip;
    tooltip.position(this.quill.getBounds(selection.index, selection.length));
    tooltip.show();
  }

  private isSegmentUntrained(segment: Segment = this.currentSegment): boolean {
    return segment != null && segment.range.length > 0 && !this.isBlank(segment.text) &&
      this.isSegmentComplete(segment.range) && segment.isChanged;
  }

  private get hasSuggestions(): boolean {
    return this._suggestions != null && this._suggestions.length > 0;
  }

  private get hasSuggestionsChanged(): boolean {
    return !angular.equals(this._suggestions, this.previousSuggestions);
  }

  private get isSelectionAtSegmentEnd(): boolean {
    const selection = this.quill.getSelection();
    if (selection == null) {
      return false;
    }
    const selectionEndIndex = selection.index + selection.length;
    const segmentEndIndex = this.currentSegment.range.index + this.currentSegment.range.length;
    return selectionEndIndex === segmentEndIndex;
  }

  private isSegmentComplete(range: RangeStatic): boolean {
    return range.index + range.length !== this.quill.getLength() - 1;
  }

  private updateHighlight(range: RangeStatic): void {
    this.toggleHighlight(range, !this.isSegmentComplete(range));
  }
}

export class SourceDocumentEditor extends DocumentEditor {
  private _isCurrentSegmentHighlighted: boolean = false;

  get docType(): string {
    return DocType.SOURCE;
  }

  get label(): string {
    return 'Source';
  }

  get isCurrentSegmentHighlighted(): boolean {
    return this._isCurrentSegmentHighlighted;
  }

  set isCurrentSegmentHighlighted(value: boolean) {
    if (this._isCurrentSegmentHighlighted === value) {
      return;
    }

    this._isCurrentSegmentHighlighted = value;
    if (this.currentSegment != null) {
      this.toggleHighlight(this.currentSegment.range, value);
    }
  }

  update(textChange: boolean): boolean {
    this.isCurrentSegmentHighlighted = false;
    if (this.isScripture) {
      // the source editor is readonly, so don't change segment if the user selects anything
      this.segmenter.update(textChange);
      return false;
    }
    const segmentChanged = super.update(textChange);
    if (this.currentSegment != null && (segmentChanged || this.currentSegment.isChanged)) {
        this.translateCurrentSegment().catch(() => { });
    }
    return segmentChanged;
  }

  translateCurrentSegment(): angular.IPromise<void> {
    this.machine.resetTranslation();
    return this.machine.translate(this.currentSegment == null ? '' : this.currentSegment.text);
  }
}
