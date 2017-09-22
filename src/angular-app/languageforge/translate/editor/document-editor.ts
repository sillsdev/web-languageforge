import * as angular from 'angular';
import Parchment from 'parchment';
import Quill, { Delta, DeltaStatic, RangeStatic, Tooltip } from 'quill';

import { DocType } from '../core/constants';
import { MachineService } from '../core/machine.service';
import { MetricService } from './metric.service';
import { SuggestionsTheme } from './quill/suggestions-theme';
import { Segment } from './segment';

export abstract class DocumentEditor {
  static isSelectionCollapsed(selection: RangeStatic): boolean {
    return selection != null && selection.length === 0;
  }

  currentDocumentSetId: string;
  currentSegment: Segment;
  modulesConfig: any = {};
  inputSystem: any = {};

  private readonly _created: angular.IDeferred<boolean>;
  private _quill: Quill;

  constructor($q: angular.IQService,
              protected readonly machineService: MachineService) {
    this._created = $q.defer();
  }

  abstract get docType(): string;
  abstract get label(): string;

  get quill(): Quill {
    return this._quill;
  }

  set quill(quill: Quill) {
    this._quill = quill;
    this._created.resolve(true);
  }

  get hasFocus(): boolean {
    return this.quill.hasFocus();
  }

  get created(): angular.IPromise<boolean> {
    return this._created.promise;
  }

  update(documentSetId: string): boolean {
    const segmentRanges = this.getSegmentRanges();
    const selection = this.quill.getSelection();
    if (selection == null) {
      return false;
    }
    let segmentIndex = -1;
    if (DocumentEditor.isSelectionCollapsed(selection)) {
      segmentIndex = segmentRanges.findIndex(range => selection.index <= range.index + range.length);
    }
    if (segmentIndex === -1) {
      segmentIndex = this.currentSegment == null ? segmentRanges.length - 1 : this.currentSegment.index;
    }

    if (this.switchCurrentSegment(documentSetId, segmentIndex)) {
      // the selection has changed to a different segment
      return true;
    } else {
      // the selection has not changed to a different segment, so update existing segment
      this.updateCurrentSegment();
      return false;
    }
  }

  switchCurrentSegment(documentSetId: string, segmentIndex: number): boolean {
    let documentChanged = false;
    if (this.currentDocumentSetId !== documentSetId) {
      this.currentDocumentSetId = documentSetId;
      documentChanged = true;
    }

    if (!documentChanged && this.currentSegment != null && segmentIndex === this.currentSegment.index) {
      // the selection has not changed to a different segment
      return false;
    }

    this.currentSegment = new Segment(segmentIndex);
    this.updateCurrentSegment();
    return true;
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
    const segmentRanges = this.machineService.tokenizeDocumentText(this.docType, text);
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

  constructor($q: angular.IQService, machineService: MachineService, private readonly metricService: MetricService,
              private readonly $window: Window
  ) {
    super($q, machineService);
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

  update(documentSetId: string): boolean {
    const segmentChanged = super.update(documentSetId);
    if (!segmentChanged) {
      this.updateSuggestions();
    }
    return segmentChanged;
  }

  switchCurrentSegment(documentSetId: string, segmentIndex: number): boolean {
    const previousDocumentSetId = this.currentDocumentSetId;
    const previousSegment = this.currentSegment;
    const segmentChanged = super.switchCurrentSegment(documentSetId, segmentIndex);
    if (segmentChanged) {
      this.trainSegmentIfNecessary(previousDocumentSetId, previousSegment);
    }
    return segmentChanged;
  }

  trainSegmentIfNecessary(documentSetId: string = this.currentDocumentSetId, segment: Segment = this.currentSegment): void {
    if (segment != null && segment.isChanged && segment.range.length > 0) {
      this.machineService.trainSegment().then(() => {
        this.$window.console.log('Segment ' + segment.index + ' of document ' + documentSetId +
          ' was trained successfully.');
      });
    }
  }

  updateSuggestions(): void {
    if (this.currentSegment == null) {
      return;
    }

    this.suggestions = this.machineService.updatePrefix(this.currentSegment.text);
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
    if (!this.isShowingSuggestions || suggestionIndex >= this.machineService.getCurrentSuggestion().length) {
      return;
    }

    let endIndex = this.currentSegment.range.index + this.currentSegment.range.length;
    const { deleteLength, insertText } = this.machineService.getSuggestionTextInsertion(suggestionIndex);
    if (deleteLength > 0) {
      this.quill.deleteText(endIndex - deleteLength, deleteLength, Quill.sources.USER);
      endIndex -= deleteLength;
    }
    this.quill.insertText(endIndex, insertText + ' ', Quill.sources.USER);
    this.quill.setSelection(endIndex + insertText.length, 1, Quill.sources.USER);
    this.metricService.onSuggestionTaken();
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

    if (this.currentSegment == null || this.currentSegment.range.length === 0) {
      return;
    }

    this.quill.formatText(this.currentSegment.range.index, this.currentSegment.range.length, 'highlight', value,
      Quill.sources.SILENT);
  }

  update(documentSetId: string): boolean {
    if (this.hasFocus) {
      this.isCurrentSegmentHighlighted = false;
    }
    const segmentChanged = super.update(documentSetId);
    if (!segmentChanged && this.currentSegment != null && this.currentSegment.isChanged) {
        this.translateCurrentSegment();
    }
    return segmentChanged;
  }

  switchCurrentSegment(documentSetId: string, segmentIndex: number): boolean {
    if (!this.hasFocus) {
      this.isCurrentSegmentHighlighted = false;
    }
    const segmentChanged = super.switchCurrentSegment(documentSetId, segmentIndex);
    if (!this.hasFocus) {
      this.isCurrentSegmentHighlighted = true;
    }
    return segmentChanged;
  }

  translateCurrentSegment(): angular.IPromise<void> {
    return this.machineService.translateInteractively(this.currentSegment.text, this.confidenceThreshold);
  }
}
