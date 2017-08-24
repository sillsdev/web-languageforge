import { Segment } from './segment';
import { Quill, RangeStatic, DeltaStatic, Delta, StringMap, FormatMachine } from './quill/quill.customization';
import * as angular from 'angular';

export class DocumentData {
  private static readonly LINE_INDEX = 0;

  static removeTrailingCarriageReturn(text: string): string {
    return (text.endsWith('\n')) ? text.substr(0, text.length - 1) : text;
  }

  static isTextEmpty(text: string): boolean {
    return !DocumentData.removeTrailingCarriageReturn(text);
  }

  static hasNoSelectionAtCursor(range?: RangeStatic): boolean {
    return range != null && range.length === 0;
  }

  docType: string;
  label: string;
  html: string = '';
  suggestions: string[] = [];
  segment: Segment = new Segment();
  editor: Quill;
  editorIsCreated: angular.IDeferred<{}>;
  modulesConfig: any = {};
  inputSystem: any = {};

  constructor($q: angular.IQService, docType: string, label: string) {
    this.docType = docType || '';
    this.label = label || '';

    this.editorIsCreated = $q.defer();
  }

  hasSuggestion(): boolean {
    return this.suggestions != null && this.suggestions.length > 0;
  }

  updateSegmentLearntData(segmentIndex: number, documentSetId: string): void {
      this.updateSegmentState(segmentIndex);
      this.segment.text = this.getSegment(segmentIndex);
      this.segment.setLearntText();
      this.segment.learnt.documentSetId = documentSetId;
      this.setPreviousLearntRange(segmentIndex);
      this.updateSegmentBlockEndIndex();
  }

  updateSegmentState(segmentIndex: number): void {
    let formats: StringMap;
    if (DocumentData.hasNoSelectionAtCursor(this.editor.getSelection())) {
      formats = this.editor.getFormat();
    } else {
      let index = this.getSegmentBlockStartIndex(segmentIndex);
      formats = this.editor.getFormat(index);
    }

    this.segment.updateState(formats);
  }

  setPreviousLearntRange(segmentIndex: number): void {
    let range = this.editor.getSelection();
    if (range == null) {
      range = {
        index: this.getSegmentBlockStartIndex(segmentIndex),
        length: 0
      };
    }

    this.segment.learnt.previousRange = range;
  }

  getSegmentBlockStartIndex(segmentIndex: number): number {
    let editorIndex = 0;
    let segments = this.getSegments();
    for (let index = 0; index < segments.length && index < segmentIndex; index++) {
      editorIndex += segments[index].length + '\n'.length;
    }

    return editorIndex;
  }

  updateSegmentBlockEndIndex(range?: RangeStatic): void {
    if (range == null) range = this.editor.getSelection();

    if (DocumentData.hasNoSelectionAtCursor(range)) {
      let block = this.editor.getLine(range.index);
      let line = block[DocumentData.LINE_INDEX];
      this.segment.blockEndIndex = this.editor.getIndex(line) + line.length() - 1;
    }
  }

  formatSegmentStateStatus(value: number, range?: RangeStatic): void {
    this.formatSegmentState('status', value, range);
  }

  formatSegmentStateMachineHasLearnt(value: boolean, range?: RangeStatic): void {
    this.formatSegmentState('machineHasLearnt', value, range);
  }

  private formatSegmentState(name: string, value: any, range?: RangeStatic): void {
    if (range == null) range = this.editor.getSelection();

    if (DocumentData.hasNoSelectionAtCursor(range)) {
      let block = this.editor.getLine(range.index);
      let blockStartIndex = this.editor.getIndex(block[DocumentData.LINE_INDEX]);
      let hasNoState = this.segment.hasNoState();
      let format: FormatMachine = {};
      format[name] = value.toString();
      this.segment.state[name] = value;
      let formats: StringMap;
      if (hasNoState) {
        formats = {};
        formats['state'] = format;
      } else {
        formats = format;
      }
      this.editor.formatLine(blockStartIndex, 1, formats, 'user');
    }
  }

  createDeltaSegmentStateMachineHasLearnt(value: boolean, index: number, segment: Segment,
                                          length: number = 1): DeltaStatic {
    let format: FormatMachine = {};
    if (segment.state.status != null) {
      format.status = segment.state.status.toString();
    }
    format.machineHasLearnt = value.toString();
    let formats: StringMap = {};
    formats['state'] = format;

    return new Delta().retain(index).retain(length, formats);
  }

  getSegment(index: number): string {
    if (DocumentData.isTextEmpty(this.editor.getText()) || index < 0) return '';

    if (index > this.getLastSegmentIndex()) {
      index = this.getLastSegmentIndex();
    }

    return this.getSegments()[index];
  }

  getSegmentIndex(): number {
    if (DocumentData.hasNoSelectionAtCursor(this.editor.getSelection())) {
      let range = this.editor.getSelection();
      let segmentIndex = 0;
      let nextSegmentIndex = 0;
      for (let segment of this.getSegments()) {
        nextSegmentIndex += segment.length + '\n'.length;
        if (range.index < nextSegmentIndex) break;

        segmentIndex++;
      }

      return segmentIndex;
    } else {
      return this.getLastSegmentIndex();
    }
  }

  getLastSegmentIndex(): number {
    return this.getNumberOfSegments() - 1;
  }

  getNumberOfSegments(): number {
    return this.getSegments().length;
  }

  getSegments(): string[] {
    return DocumentData.removeTrailingCarriageReturn(this.editor.getText()).split('\n');
  }
}
