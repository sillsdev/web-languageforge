import * as angular from 'angular';
import Quill, { Delta, DeltaStatic, RangeStatic, Tooltip } from 'quill';

import { MachineService } from '../core/machine.service';
import { MetricService } from './metric.service';
import { SuggestionsTheme } from './quill/suggestions-theme';
import { Segment } from './segment';

export class DocumentEditor {
  static readonly SOURCE = 'source';
  static readonly TARGET = 'target';

  static isSelectionCollapsed(selection: RangeStatic): boolean {
    return selection != null && selection.length === 0;
  }

  currentDocumentSetId: string;
  currentSegment: Segment;
  quill: Quill;
  modulesConfig: any = {};
  inputSystem: any = {};

  private isShowingSuggestions: boolean = false;
  private _suggestions: string[] = [];
  private previousSuggestions: string[] = [];

  constructor(public docType: string, public label: string,
              public quillIsCreated: angular.IDeferred<boolean>,
              private machineService: MachineService, private metricService: MetricService) { }

  isTextEmpty(): boolean {
    return this.quill.getText().trim() === '';
  }

  get hasSuggestions(): boolean {
    return this._suggestions != null && this._suggestions.length > 0;
  }

  get suggestions(): string[] {
    return this._suggestions;
  }

  set suggestions(suggestions: string[]) {
    this.previousSuggestions = this._suggestions;
    this._suggestions = suggestions;
  }

  hasSuggestionsChanged(suggestions: string[] = this._suggestions): boolean {
    return !angular.equals(suggestions, this.previousSuggestions);
  }

  get isSelectionAtSegmentEnd(): boolean {
    const selection = this.quill.getSelection();
    if (selection == null) {
      return false;
    }
    const selectionEndIndex = selection.index + selection.length;
    const segmentEndIndex = this.currentSegment.range.index + this.currentSegment.range.length;
    return selectionEndIndex === segmentEndIndex;
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

    if (this.docType === DocumentEditor.TARGET && !documentChanged && this.currentSegment != null) {
      // remove machine formatting from the whitespace at the end of a segment
      const endIndex = this.currentSegment.range.index + this.currentSegment.range.length;
      if (this.quill.getText(endIndex, 1).trim() === '') {
        this.quill.formatText(endIndex, 1, 'segment', false);
      }
    }

    const segmentRange = this.getSegmentRange(segmentIndex);
    const text = this.quill.getText(segmentRange.index, segmentRange.length);
    this.currentSegment = new Segment(segmentIndex, text, segmentRange);

    if (this.docType === DocumentEditor.TARGET) {
      const format = this.quill.getFormat(segmentRange);
      this.currentSegment.updateFromFormat(format);
    }
    return true;
  }

  formatSegment(segment: Segment = this.currentSegment): void {
    const format = segment.getFormat();
    this.quill.formatText(segment.range.index, segment.range.length, format, Quill.sources.USER);
  }

  static createDeltaSegment(segment: Segment): DeltaStatic {
    const format = segment.getFormat();
    const QuillDelta = Quill.import('delta') as typeof Delta;
    return new QuillDelta().retain(segment.range.index).retain(segment.range.length, format);
  }

  showSuggestions(): void {
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

  private getSegmentRange(index: number): RangeStatic {
    if (this.isTextEmpty()) {
      return { index: 0, length: 0 };
    }

    const segments = this.getSegmentRanges();
    return index < segments.length ? segments[index] : { index: this.quill.getLength() - 1, length: 0 };
  }

  private getSegmentRanges(): RangeStatic[] {
    const text = this.quill.getText().substr(0, this.quill.getLength() - 1);
    const segmentRanges = this.machineService.tokenizeDocumentText(text);
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
    const segmentRange = this.getSegmentRange(this.currentSegment.index);
    const text = this.quill.getText(segmentRange.index, segmentRange.length);
    const isChanged = this.currentSegment.text !== text;
    this.currentSegment.text = text;
    this.currentSegment.range = segmentRange;

    if (this.docType === DocumentEditor.TARGET) {
      const format = this.quill.getFormat(segmentRange);
      this.currentSegment.updateFromFormat(format);
      if (isChanged && this.currentSegment.isTrained) {
        this.currentSegment.isTrained = false;
        this.formatSegment();
      }
    }
  }
}
