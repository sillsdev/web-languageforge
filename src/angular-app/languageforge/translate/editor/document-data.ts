import * as angular from 'angular';
import Quill, { Delta, DeltaStatic, RangeStatic, StringMap } from 'quill';

import { FormatMachine } from './quill/suggestions-theme';
import { Segment } from './segment';

export class DocumentData {
  private static readonly LINE_INDEX = 0;

  static removeTrailingCarriageReturn(text: string): string {
    return (text.endsWith('\n')) ? text.substr(0, text.length - 1) : text;
  }

  static isSelectionCollapsed(selection: RangeStatic): boolean {
    return selection != null && selection.length === 0;
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

  isTextEmpty(): boolean {
    return !DocumentData.removeTrailingCarriageReturn(this.editor.getText());
  }

  hasSuggestion(): boolean {
    return this.suggestions != null && this.suggestions.length > 0;
  }

  updateSegmentLearntData(segmentIndex: number, documentSetId: string): void {
      this.updateSegmentState(segmentIndex);
      this.segment.text = this.getSegment(segmentIndex);
      this.segment.setLearntText();
      this.segment.learnt.documentSetId = documentSetId;
      this.setPreviousLearntSelection(segmentIndex);
      this.updateSegmentBlockEndIndex();
  }

  updateSegmentState(segmentIndex: number): void {
    let formats: StringMap;
    if (DocumentData.isSelectionCollapsed(this.editor.getSelection())) {
      formats = this.editor.getFormat();
    } else {
      const index = this.getSegmentBlockStartIndex(segmentIndex);
      formats = this.editor.getFormat(index);
    }

    this.segment.updateState(formats);
  }

  setPreviousLearntSelection(segmentIndex: number): void {
    let selection = this.editor.getSelection();
    if (selection == null) {
      selection = {
        index: this.getSegmentBlockStartIndex(segmentIndex),
        length: 0
      };
    }

    this.segment.learnt.previousSelection = selection;
  }

  getSegmentBlockStartIndex(segmentIndex: number): number {
    let editorIndex = 0;
    const segments = this.getSegments();
    for (let index = 0; index < segments.length && index < segmentIndex; index++) {
      editorIndex += segments[index].length + '\n'.length;
    }

    return editorIndex;
  }

  updateSegmentBlockEndIndex(selection?: RangeStatic): void {
    if (selection == null) {
      selection = this.editor.getSelection();
    }

    if (DocumentData.isSelectionCollapsed(selection)) {
      const block = this.editor.getLine(selection.index);
      const line = block[DocumentData.LINE_INDEX];
      this.segment.blockEndIndex = this.editor.getIndex(line) + line.length() - 1;
    }
  }

  formatSegmentStateStatus(value: number, selection?: RangeStatic): void {
    this.formatSegmentState('status', value, selection);
  }

  formatSegmentStateMachineHasLearnt(value: boolean, selection?: RangeStatic): void {
    this.formatSegmentState('machineHasLearnt', value, selection);
  }

  private formatSegmentState(name: string, value: any, selection?: RangeStatic): void {
    if (selection == null) {
      selection = this.editor.getSelection();
    }

    if (DocumentData.isSelectionCollapsed(selection)) {
      const block = this.editor.getLine(selection.index);
      const blockStartIndex = this.editor.getIndex(block[DocumentData.LINE_INDEX]);
      const hasNoState = this.segment.hasNoState();
      const format: FormatMachine = {};
      format[name] = value.toString();
      this.segment.state[name] = value;
      let formats: StringMap;
      if (hasNoState) {
        formats = { state: format };
      } else {
        formats = format;
      }
      this.editor.formatLine(blockStartIndex, 1, formats, Quill.sources.USER);
    }
  }

  createDeltaSegmentStateMachineHasLearnt(value: boolean, index: number, segment: Segment,
                                          length: number = 1): DeltaStatic {
    const format: FormatMachine = {};
    if (segment.state.status != null) {
      format.status = segment.state.status.toString();
    }
    format.machineHasLearnt = value.toString();
    const formats: StringMap = { state: format };
    return new Delta().retain(index).retain(length, formats);
  }

  getSegment(index: number): string {
    if (this.isTextEmpty() || index < 0) {
      return '';
    }

    if (index > this.getLastSegmentIndex()) {
      index = this.getLastSegmentIndex();
    }

    return this.getSegments()[index];
  }

  getSegmentIndex(): number {
    const selection = this.editor.getSelection();
    if (DocumentData.isSelectionCollapsed(selection)) {
      let segmentIndex = 0;
      let nextSegmentIndex = 0;
      for (const segment of this.getSegments()) {
        nextSegmentIndex += segment.length + '\n'.length;
        if (selection.index < nextSegmentIndex) {
          break;
        }

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
