import * as angular from 'angular';
import Quill, { RangeStatic } from 'quill';

import { DocType, SaveState } from '../core/constants';
import { MachineService } from '../core/machine.service';
import { RealTimeService } from '../core/realtime.service';
import { MetricService } from './metric.service';
import { SuggestionsTheme } from './quill/suggestions-theme';
import { Segment } from './segment';

export abstract class DocumentEditor {
  static isSelectionCollapsed(selection: RangeStatic): boolean {
    return selection != null && selection.length === 0;
  }

  modulesConfig: any = {};
  inputSystem: any = {};

  protected currentSegment: Segment;
  protected segmentRanges: RangeStatic[];

  private documentSetId: string = '';
  private readonly _created: angular.IDeferred<boolean>;
  private _quill: Quill;

  constructor(private readonly $q: angular.IQService, protected readonly machine: MachineService,
              private readonly realTime: RealTimeService) {
    this._created = this.$q.defer();
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
    return this.quill.hasFocus();
  }

  get created(): angular.IPromise<boolean> {
    return this._created.promise;
  }

  get currentSegmentDocumentSetId(): string {
    return this.currentSegment == null ? '' : this.currentSegment.documentSetId;
  }

  get currentSegmentIndex(): number {
    return this.currentSegment == null ? -1 : this.currentSegment.index;
  }

  get saveState(): SaveState {
    return this.getSaveState();
  }

  private get docId(): string {
    if (this.documentSetId === '') {
      return '';
    }
    return this.documentSetId + ':' + this.docType;
  }

  private get isTextEmpty(): boolean {
    let text = this.quill.getText();
    text = text.endsWith('\n') ? text.substr(0, text.length - 1) : text;
    return text === '';
  }

  openDocumentSet(collection: string, documentSetId: string): void {
    if (this.documentSetId !== documentSetId) {
      this.documentSetId = documentSetId;
      this.realTime.createAndSubscribeRichTextDoc(collection, this.docId, this.quill);
      this.segmentRanges = null;
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
    if (this.segmentRanges == null || textChange) {
      this.segmentRanges = this.getSegmentRanges();
    }
    const selection = this.quill.getSelection();
    if (selection == null) {
      return false;
    }
    let segmentIndex = -1;
    if (DocumentEditor.isSelectionCollapsed(selection)) {
      segmentIndex = this.segmentRanges.findIndex(range => selection.index <= range.index + range.length);
    }
    if (segmentIndex === -1) {
      segmentIndex = this.currentSegment == null ? this.segmentRanges.length - 1 : this.currentSegment.index;
    }

    if (this.switchCurrentSegment(segmentIndex)) {
      // the selection has changed to a different segment
      return true;
    } else {
      // the selection has not changed to a different segment, so update existing segment
      this.updateCurrentSegment();
      return false;
    }
  }

  switchCurrentSegment(segmentIndex: number): boolean {
    if (this.currentSegment != null && this.documentSetId === this.currentSegment.documentSetId
      && segmentIndex === this.currentSegment.index
    ) {
      // the selection has not changed to a different segment
      return false;
    }

    this.currentSegment = new Segment(this.documentSetId, segmentIndex);
    this.updateCurrentSegment();
    return true;
  }

  save(): angular.IPromise<void> {
    return this.$q.resolve();
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

  private getSegmentRange(index: number): RangeStatic {
    if (this.isTextEmpty) {
      return { index: 0, length: 0 };
    }

    const segments = this.getSegmentRanges();
    return index < segments.length ? segments[index] : { index: this.quill.getLength() - 1, length: 0 };
  }

  private getSegmentRanges(): RangeStatic[] {
    const text = this.quill.getText().substr(0, this.quill.getLength() - 1);
    const segmentRanges = this.machine.tokenizeDocumentText(this.docType, text);
    if (segmentRanges.length === 0) {
      segmentRanges.push({ index: 0, length: 0 });
    } else {
      const lastSegmentRange = segmentRanges[segmentRanges.length - 1];
      const lastSegmentEnd = lastSegmentRange.index + lastSegmentRange.length;
      if (lastSegmentEnd < text.length) {
        segmentRanges.push({ index: text.length, length: 0 });
      }
    }
    return segmentRanges;
  }

  private updateCurrentSegment() {
    const range = this.getSegmentRange(this.currentSegment.index);
    const text = this.quill.getText(range.index, range.length);
    this.currentSegment.update(text, range);
  }
}

export class TargetDocumentEditor extends DocumentEditor {
  private isShowingSuggestions: boolean = false;
  private _suggestions: string[] = [];
  private previousSuggestions: string[] = [];
  private pendingTrainCount: number;
  private isTranslating: boolean = false;

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

  save(): angular.IPromise<void> {
    return this.trainSegment();
  }

  closeDocumentSet(): void {
    this.hideSuggestions();
    super.closeDocumentSet();
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

    if (textChange && this.currentSegment != null && this.currentSegment.index === this.segmentRanges.length - 1) {
      this.updateHighlight(this.currentSegment.range);
    }

    return segmentChanged;
  }

  switchCurrentSegment(segmentIndex: number): boolean {
    const previousSegment = this.currentSegment;
    const segmentChanged = super.switchCurrentSegment(segmentIndex);
    if (segmentChanged) {
      this.trainSegment(previousSegment);
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
      this.suggestions = this.machine.updatePrefix(this.currentSegment.text);
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
    this.isShowingSuggestions = false;
  }

  insertSuggestion(suggestionIndex: number = -1): void {
    if (suggestionIndex >= this.machine.getCurrentSuggestion().length) {
      return;
    }

    const endIndex = this.currentSegment.range.index + this.currentSegment.range.length;
    const insertText = this.machine.getSuggestionText(suggestionIndex);
    this.quill.insertText(endIndex, insertText + ' ', Quill.sources.USER);
    this.quill.setSelection(endIndex + insertText.length, 1, Quill.sources.USER);
    this.metricService.onSuggestionTaken();
  }

  get productiveCharacterCount(): number {
    return this.currentSegment.productiveCharacterCount;
  }

  protected getSaveState(): SaveState {
    let trainSaveState: SaveState;
    if (this.isSegmentUntrained()) {
      trainSaveState = SaveState.Unsaved;
    } else if (this.pendingTrainCount == null) {
      trainSaveState = SaveState.Unedited;
    } else if (this.pendingTrainCount > 0) {
      trainSaveState = SaveState.Saving;
    } else {
      trainSaveState = SaveState.Saved;
    }
    return Math.min(super.getSaveState(), trainSaveState);
  }

  private showSuggestions(): void {
    if (!this.isSelectionAtSegmentEnd) {
      return;
    }

    const selection = this.quill.getSelection();
    const tooltip = (this.quill.theme as SuggestionsTheme).suggestionsTooltip;
    tooltip.show();
    tooltip.position(this.quill.getBounds(selection.index, selection.length));
    this.isShowingSuggestions = true;
  }

  private isSegmentUntrained(segment: Segment = this.currentSegment): boolean {
    return segment != null && segment.range.length > 0 && this.isSegmentComplete(segment.range) && segment.isChanged;
  }

  private trainSegment(segment: Segment = this.currentSegment): angular.IPromise<void> {
    if (!this.isSegmentUntrained(segment)) {
      return;
    }

    if (this.pendingTrainCount == null) {
      this.pendingTrainCount = 0;
    }
    this.pendingTrainCount++;
    return this.machine.trainSegment()
      .then(() => {
        segment.acceptChanges();
        this.$window.console.log('Segment ' + segment.index + ' of document ' + segment.documentSetId
          + ' was trained successfully.');
      })
      .finally(() => this.pendingTrainCount--);
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
    if (this.hasFocus) {
      this.isCurrentSegmentHighlighted = false;
    }
    const segmentChanged = super.update(textChange);
    if (this.currentSegment != null && (segmentChanged || this.currentSegment.isChanged)) {
        this.translateCurrentSegment().catch(() => { });
    }
    return segmentChanged;
  }

  switchCurrentSegment(segmentIndex: number): boolean {
    if (!this.hasFocus) {
      this.isCurrentSegmentHighlighted = false;
    }
    const segmentChanged = super.switchCurrentSegment(segmentIndex);
    if (!this.hasFocus) {
      this.isCurrentSegmentHighlighted = true;
    }
    return segmentChanged;
  }

  translateCurrentSegment(): angular.IPromise<void> {
    return this.machine.translate(this.currentSegment.text);
  }

  resetTranslation(): angular.IPromise<void> {
    this.machine.resetTranslation();
    return this.translateCurrentSegment();
  }
}
