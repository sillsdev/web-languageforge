import { Component, EventEmitter, Input, OnDestroy, Output, ViewEncapsulation } from '@angular/core';
import { deepMerge } from '@orbit/utils';
import Quill, { DeltaStatic, RangeStatic, Sources } from 'quill';
import { Subscription } from 'rxjs';

import { TextData } from '../../core/models/text-data';
import { TextService, TextType } from '../../core/text.service';
import { registerScripture } from './quill-scripture';
import { Segment } from './segment';
import { Segmenter } from './segmenter';
import { UsxSegmenter } from './usx-segmenter';

export const INITIAL_BLANK_TEXT = '\u00a0';
export const NORMAL_BLANK_TEXT = '\u2003\u2003';
const EDITORS = new Set<Quill>();

export function isBlankText(text: string): boolean {
  return text === INITIAL_BLANK_TEXT || text === NORMAL_BLANK_TEXT;
}

function onNativeSelectionChanged(): void {
  // workaround for bug where Quill allows a selection inside of an embed
  const sel = window.document.getSelection();
  if (sel.rangeCount === 0 || !sel.isCollapsed) {
    return;
  }
  const text = sel.getRangeAt(0).commonAncestorContainer.textContent;
  if (text === '\ufeff') {
    for (const editor of EDITORS) {
      if (editor.hasFocus()) {
        editor.setSelection(editor.getSelection(), 'silent');
        break;
      }
    }
  }
}

registerScripture();
window.document.addEventListener('selectionchange', onNativeSelectionChanged);

export interface TextUpdatedEvent {
  delta?: DeltaStatic;
  prevSegment?: Segment;
  segment: Segment;
}

@Component({
  selector: 'app-text',
  templateUrl: './text.component.html',
  styleUrls: ['./text.component.scss', './usx-styles.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TextComponent implements OnDestroy {
  @Input() textType: TextType = 'target';
  @Input() isReadOnly: boolean = true;
  @Output() updated = new EventEmitter<TextUpdatedEvent>(true);
  @Output() segmentRefChange = new EventEmitter<string>();
  @Output() loaded = new EventEmitter(true);

  private readonly DEFAULT_MODULES: any = {
    toolbar: false,
    keyboard: {
      bindings: {
        disableBackspace: {
          key: 'backspace',
          handler: (range: RangeStatic) => this.isBackspaceAllowed(range)
        },
        disableDelete: {
          key: 'delete',
          handler: (range: RangeStatic) => this.isDeleteAllowed(range)
        },
        disableEnter: {
          key: 'enter',
          handler: () => false
        }
      }
    }
  };

  private _textId?: string;
  private _modules: any = this.DEFAULT_MODULES;
  private _editor?: Quill;
  private textDataSub?: Subscription;
  private textData?: TextData;
  private segmenter?: Segmenter;
  private _segment?: Segment;
  private initialSegmentRef?: string;
  private initialSegmentChecksum?: number;
  private initialSegmentFocus?: boolean;
  private initialSegmentUpdate: boolean = false;
  private _highlightSegment: boolean = false;

  constructor(private readonly textService: TextService) {}

  get textId(): string {
    return this._textId;
  }
  @Input()
  set textId(value: string) {
    this._textId = value;
    if (this.editor != null) {
      this.bindQuill();
    }
  }

  get modules(): any {
    return this._modules;
  }
  @Input()
  set modules(value: any) {
    this._modules = deepMerge(value, this.DEFAULT_MODULES);
  }

  get highlightSegment(): boolean {
    return this._highlightSegment;
  }
  @Input()
  set highlightSegment(value: boolean) {
    if (this._highlightSegment !== value) {
      this._highlightSegment = value;
      if (this._segment != null) {
        this.toggleHighlight(this._segment.range, value);
      }
    }
  }

  get segmentRef(): string {
    if (this._segment == null) {
      return this.initialSegmentRef == null ? '' : this.initialSegmentRef;
    }
    return this._segment.ref;
  }
  @Input()
  set segmentRef(value: string) {
    if (value !== this.segmentRef) {
      this.switchSegment(value);
    }
  }

  get hasFocus(): boolean {
    return this._editor == null ? false : this._editor.hasFocus();
  }

  get editor(): Quill {
    return this._editor;
  }

  get segment(): Segment {
    return this._segment;
  }

  get segmentText(): string {
    return this._segment == null ? '' : this._segment.text;
  }

  get segmentChecksum(): number {
    return this._segment == null ? 0 : this._segment.checksum;
  }

  get isEmpty(): boolean {
    return this.text === '';
  }

  get length(): number {
    return this.text.length;
  }

  get text(): string {
    const text = this._editor.getText();
    return text.endsWith('\n') ? text.substr(0, text.length - 1) : text;
  }

  ngOnDestroy(): void {
    this.unbindQuill();
    EDITORS.delete(this._editor);
  }

  onEditorCreated(editor: Quill): void {
    this._editor = editor;
    this.segmenter = new UsxSegmenter(this._editor);
    if (this.textId != null) {
      this.bindQuill();
    }
    EDITORS.add(this._editor);
  }

  focus(): void {
    return this.editor.focus();
  }

  switchSegment(segmentRef: string, checksum?: number, focus: boolean = false): boolean {
    if (!this.initialSegmentUpdate) {
      this.initialSegmentRef = segmentRef;
      this.initialSegmentChecksum = checksum;
      this.initialSegmentFocus = focus;
      return;
    }

    if (this._segment != null && this._textId === this._segment.textId && segmentRef === this._segment.ref) {
      // the selection has not changed to a different segment
      return false;
    }

    if (focus) {
      const selection = this._editor.getSelection();
      const selectedSegmentRef = selection == null ? null : this.segmenter.getSegmentRef(selection);
      if (selectedSegmentRef !== segmentRef) {
        const range = this.segmenter.getSegmentRange(segmentRef);
        Promise.resolve().then(() => this._editor.setSelection(range.index + range.length, 0, 'user'));
      }
    }

    if (this._segment != null && this.highlightSegment) {
      this.toggleHighlight(this._segment.range, false);
    }
    this._segment = new Segment(this._textId, segmentRef);
    if (checksum != null) {
      this._segment.initialChecksum = checksum;
    }
    this.updateSegment();
    this.segmentRefChange.emit(this.segmentRef);
    if (this.highlightSegment) {
      this.toggleHighlight(this._segment.range, true);
    }
    return true;
  }

  getSegmentRange(ref: string): RangeStatic {
    return this.segmenter.getSegmentRange(ref);
  }

  onContentChanged(delta: DeltaStatic, source: Sources): void {
    if (source === 'user') {
      this.textData.submit(delta, this._editor);
    }
    this.update(delta);
  }

  onSelectionChanged(): void {
    this.update();
  }

  private async bindQuill(): Promise<void> {
    await this.unbindQuill();
    if (this._textId == null || this._editor == null) {
      return;
    }
    this.segmenter.reset();
    this.initialSegmentUpdate = false;
    // remove placeholder text while the document is opening
    const editorElem = this._editor.container.getElementsByClassName('ql-editor')[0];
    const placeholderText = editorElem.getAttribute('data-placeholder');
    editorElem.setAttribute('data-placeholder', '');
    this.textData = await this.textService.connect(
      this.textId,
      this.textType
    );
    this._editor.setContents(this.textData.data);
    this.textDataSub = this.textData.remoteChanges().subscribe(ops => this._editor.updateContents(ops));
    editorElem.setAttribute('data-placeholder', placeholderText);
    this.loaded.emit();
  }

  private async unbindQuill(): Promise<void> {
    if (this.textData == null) {
      return;
    }
    this.textDataSub.unsubscribe();
    await this.textService.disconnect(this.textData);
    this._editor.setText('', 'silent');
  }

  private isBackspaceAllowed(range: RangeStatic): boolean {
    if (range.length > 0) {
      const text = this._editor.getText(range.index, range.length);
      return text !== '';
    }

    return range.index !== this._segment.range.index;
  }

  private isDeleteAllowed(range: RangeStatic): boolean {
    if (range.length > 0) {
      const text = this._editor.getText(range.index, range.length);
      return text !== '';
    }

    return range.index !== this._segment.range.index + this._segment.range.length;
  }

  private update(delta?: DeltaStatic): void {
    this.segmenter.update(delta != null);

    let segmentRef: string;
    let checksum: number;
    let focus: boolean;
    let updateUsxFormatForAllSegments = false;
    if (delta != null && !this.isEmpty && !this.initialSegmentUpdate) {
      segmentRef = this.initialSegmentRef;
      checksum = this.initialSegmentChecksum;
      focus = this.initialSegmentFocus;
      updateUsxFormatForAllSegments = true;
      this.initialSegmentRef = undefined;
      this.initialSegmentChecksum = undefined;
      this.initialSegmentFocus = undefined;

      this.initialSegmentUpdate = true;
    }

    if (segmentRef == null) {
      const selection = this._editor.getSelection();
      if (selection != null) {
        // get currently selected segment ref
        segmentRef = this.segmenter.getSegmentRef(selection);
      }
    }

    const prevSegment = this._segment;
    if (segmentRef != null) {
      // update/switch current segment
      if (!this.switchSegment(segmentRef, checksum, focus)) {
        if (this.highlightSegment) {
          this.toggleHighlight(this._segment.range, false);
        }
        // the selection has not changed to a different segment, so update existing segment
        this.updateSegment();
        if (this.highlightSegment) {
          this.toggleHighlight(this._segment.range, true);
        }
      }
    }

    if (delta != null) {
      // ensure that segment format is correct
      if (updateUsxFormatForAllSegments) {
        for (const [ref, range] of this.segmenter.segments) {
          this.updateUsxSegmentFormat(ref, range);
        }
      } else if (this._segment != null) {
        this.updateUsxSegmentFormat(this._segment.ref, this._segment.range);
      }
    }

    Promise.resolve().then(() => this.adjustSelection());
    this.updated.emit({ delta, prevSegment, segment: this._segment });
  }

  private updateSegment(): void {
    const range = this.segmenter.getSegmentRange(this._segment.ref);
    const text = this._editor.getText(range.index, range.length);
    this._segment.update(text, range);
  }

  private adjustSelection(): void {
    if (!this._editor.hasFocus() || this._segment == null) {
      return;
    }
    const sel = this._editor.getSelection();
    if (sel == null) {
      return;
    }
    let newSel: RangeStatic;
    if (isBlankText(this._segment.text)) {
      // always select whole segment if blank
      newSel = this._segment.range;
    } else {
      // ensure that selection does not extend across segments
      const newStart = Math.max(sel.index, this._segment.range.index);
      const oldEnd = sel.index + sel.length;
      const segEnd = this._segment.range.index + this._segment.range.length;
      const newEnd = Math.min(oldEnd, segEnd);
      newSel = { index: newStart, length: Math.max(0, newEnd - newStart) };
    }
    if (sel.index !== newSel.index || sel.length !== newSel.length) {
      this._editor.setSelection(newSel, 'user');
    }
  }

  private updateUsxSegmentFormat(ref: string, range: RangeStatic): void {
    const text = this._editor.getText(range.index, range.length);

    if (text === '' && range.length === 0) {
      // insert blank
      let blankText: string;
      if (ref.includes('/p')) {
        blankText = INITIAL_BLANK_TEXT;
      } else {
        blankText = NORMAL_BLANK_TEXT;
      }
      this._editor.insertText(range.index, blankText, 'user');
      range = { index: range.index, length: blankText.length };
    }

    const formats = this._editor.getFormat(range.index, range.length);
    if (formats.segment == null) {
      // add segment format if missing
      this._editor.formatText(range.index, range.length, 'segment', ref, 'user');
    }
  }

  private toggleHighlight(range: RangeStatic, value: boolean): void {
    if (range.length > 0) {
      // this changes the underlying HTML, which can mess up some Quill events, so defer this call
      Promise.resolve().then(() =>
        this._editor.formatText(range.index, range.length, 'highlight', value ? this.textType : false, 'silent')
      );
    }
  }
}
