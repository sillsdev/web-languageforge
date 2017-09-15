import * as angular from 'angular';
import Parchment from 'parchment';
import Quill, { Delta, DeltaStatic, RangeStatic, Tooltip } from 'quill';

import { MachineService } from '../core/machine.service';
import { MetricService } from './metric.service';
import { SuggestionsTheme } from './quill/suggestions-theme';
import { Segment, TargetSegment } from './segment';

export abstract class DocumentEditor {
  static readonly SOURCE = 'source';
  static readonly TARGET = 'target';

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

  get isSelectionAtSegmentEnd(): boolean {
    const selection = this.quill.getSelection();
    if (selection == null) {
      return false;
    }
    const selectionEndIndex = selection.index + selection.length;
    const segmentEndIndex = this.currentSegment.range.index + this.currentSegment.range.length;
    return selectionEndIndex === segmentEndIndex;
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

    if (!documentChanged && this.currentSegment != null) {
      // remove segment formatting from whitespace at the end of a segment
      const endIndex = this.currentSegment.range.index + this.currentSegment.range.length;
      let len = 0;
      while ((endIndex + len) < this.quill.getLength() && this.quill.getText(endIndex, len + 1).trim() === '') {
        len++;
      }
      if (len > 0) {
        this.quill.formatText(endIndex, len, 'segment', false, Quill.sources.USER);
      }
    }

    this.currentSegment = this.createSegment(segmentIndex);
    this.updateCurrentSegment();
    return true;
  }

  formatSegment(segment: Segment = this.currentSegment): void {
    if (segment.range.length === 0) {
      return;
    }

    const format = segment.getFormat();
    this.quill.formatText(segment.range.index, segment.range.length, format, Quill.sources.USER);
  }

  static createDeltaSegment(segment: Segment): DeltaStatic {
    const format = segment.getFormat();
    const QuillDelta = Quill.import('delta') as typeof Delta;
    return new QuillDelta().retain(segment.range.index).retain(segment.range.length, format);
  }

  protected createSegment(index: number): Segment {
    return new Segment(index);
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
    const range = this.getSegmentRange(this.currentSegment.index);
    const text = this.quill.getText(range.index, range.length);
    const format = this.quill.getFormat(range);
    if (this.currentSegment.update(text, range, format)) {
      this.formatSegment();
    }
  }
}

export class TargetDocumentEditor extends DocumentEditor {
  private isShowingSuggestions: boolean = false;
  private _suggestions: string[] = [];
  private previousSuggestions: string[] = [];

  constructor($q: angular.IQService, machineService: MachineService, private readonly metricService: MetricService) {
    super($q, machineService);
  }

  get docType(): string {
    return DocumentEditor.TARGET;
  }

  get label(): string {
    return 'Target';
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

  protected createSegment(index: number): Segment {
    return new TargetSegment(index);
  }
}

export class SourceDocumentEditor extends DocumentEditor {
  get docType(): string {
    return DocumentEditor.SOURCE;
  }

  get label(): string {
    return 'Source';
  }

  highlightCurrentSegment(): void {
    if (this.currentSegment == null || this.currentSegment.range.length === 0) {
      return;
    }

    const { found, elem } = this.getCurrentSegmentElement();
    if (found) {
      elem.classList.add('highlight');
    }
  }

  unhighlightCurrentSegment(): void {
    if (this.currentSegment == null || this.currentSegment.range.length === 0) {
      return;
    }

    const { found, elem } = this.getCurrentSegmentElement();
    if (found) {
      elem.classList.remove('highlight');
    }
  }

  private getCurrentSegmentElement(): { found: boolean, elem?: HTMLElement } {
    let blot = this.quill.getLeaf(this.currentSegment.range.index + this.currentSegment.range.length)[0];
    while (blot != null) {
      const node = blot.domNode as Node;
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        if (element.classList.contains('segment')) {
          return { found: true, elem: element };
        }
      }
      blot = blot.parent;
    }
    return { found: false };
  }
}
