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

  openDocumentSet(collection: string, documentSetId: string): void {
    if (this.documentSetId !== documentSetId) {
      this.documentSetId = documentSetId;
      this.realTime.createAndSubscribeRichTextDoc(collection, this.docId, this.quill);
      this.segmentRanges = null;
    }
  }

  closeDocumentSet(): void {
    if (this.docId !== '') {
      this.realTime.disconnectRichTextDoc(this.docId, this.quill);
    }
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
      this.quill.formatText(range.index, range.length, 'highlight', value ? this.docType : false, Quill.sources.SILENT);
    }
  }

  private getSegmentRange(index: number): RangeStatic {
    if (this.quill.getText().trim() === '') {
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

  save(): angular.IPromise<void> {
    return this.trainSegment();
  }

  update(textChange: boolean): boolean {
    const segmentChanged = super.update(textChange);
    if (!segmentChanged) {
      this.updateSuggestions();
    }

    if (textChange) {
      this.quill.formatText(0, this.quill.getLength(), 'highlight', false, Quill.sources.SILENT);
      const lastSegmentRange = this.segmentRanges[this.segmentRanges.length - 1];
      if (!this.isSegmentComplete(lastSegmentRange)) {
        this.toggleHighlight(lastSegmentRange, true);
      }
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

  updateSuggestions(): void {
    if (this.currentSegment == null) {
      return;
    }

    this.suggestions = this.machine.updatePrefix(this.currentSegment.text);
    if (this.hasSuggestionsChanged && this.hasSuggestions) {
      this.metricService.onSuggestionGiven();
    }
    if (this.isSelectionAtSegmentEnd) {
      setTimeout(() => this.showSuggestions(), 0);
    }
  }

  hideSuggestions(): void {
    (this.quill.theme as SuggestionsTheme).suggestionsTooltip.hide();
    this.isShowingSuggestions = false;
  }

  insertSuggestion(suggestionIndex: number = -1): void {
    if (!this.isShowingSuggestions || suggestionIndex >= this.machine.getCurrentSuggestion().length) {
      return;
    }

    let endIndex = this.currentSegment.range.index + this.currentSegment.range.length;
    const { deleteLength, insertText } = this.machine.getSuggestionTextInsertion(suggestionIndex);
    if (deleteLength > 0) {
      this.quill.deleteText(endIndex - deleteLength, deleteLength, Quill.sources.USER);
      endIndex -= deleteLength;
    }
    this.quill.insertText(endIndex, insertText + ' ', Quill.sources.USER);
    this.quill.setSelection(endIndex + insertText.length, 1, Quill.sources.USER);
    this.metricService.onSuggestionTaken();
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

  private showSuggestions(): void {
    const selection = this.quill.getSelection();
    if (this.hasSuggestions) {
      const tooltip = (this.quill.theme as SuggestionsTheme).suggestionsTooltip;
      tooltip.show();
      tooltip.position(this.quill.getBounds(selection.index, selection.length));
      this.isShowingSuggestions = true;
    } else {
      this.hideSuggestions();
    }
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
}

export class SourceDocumentEditor extends DocumentEditor {
  confidenceThreshold: number = 0.2;

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
    if (!segmentChanged && this.currentSegment != null && this.currentSegment.isChanged) {
        this.translateCurrentSegment();
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
    return this.machine.translate(this.currentSegment.text, this.confidenceThreshold);
  }

  resetTranslation(): angular.IPromise<void> {
    this.machine.resetTranslation();
    return this.translateCurrentSegment();
  }
}
