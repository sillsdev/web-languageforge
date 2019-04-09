import { Component, EventEmitter, Input, OnDestroy, Output, ViewEncapsulation } from '@angular/core';
import { deepMerge, eq } from '@orbit/utils';
import Quill, { DeltaStatic, RangeStatic, Sources } from 'quill';
import { Subscription } from 'rxjs';
import { TextData, TextDataId } from '../../core/models/text-data';
import { TextService } from '../../core/text.service';
import { registerScripture } from './quill-scripture';
import { Segment } from './segment';
import { Segmenter } from './segmenter';
import { UsxSegmenter } from './usx-segmenter';

const Delta: new () => DeltaStatic = Quill.import('delta');

const EDITORS = new Set<Quill>();

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
  @Input() isReadOnly: boolean = true;
  @Output() updated = new EventEmitter<TextUpdatedEvent>(true);
  @Output() segmentRefChange = new EventEmitter<string>();
  @Output() loaded = new EventEmitter(true);

  private _editorStyles: any = { fontSize: '1rem' };
  private readonly DEFAULT_MODULES: any = {
    toolbar: false,
    keyboard: {
      bindings: {
        disableBackspace: {
          key: 'backspace',
          altKey: null,
          ctrlKey: null,
          metaKey: null,
          shiftKey: null,
          handler: (range: RangeStatic) => this.isBackspaceAllowed(range)
        },
        disableDelete: {
          key: 'delete',
          handler: (range: RangeStatic) => this.isDeleteAllowed(range)
        },
        disableEnter: {
          key: 'enter',
          shiftKey: null,
          handler: () => false
        }
      }
    }
  };
  private _id?: TextDataId;
  private _modules: any = this.DEFAULT_MODULES;
  private _editor?: Quill;
  private textDataSub?: Subscription;
  private textData?: TextData;
  private segmenter?: Segmenter;
  private _segment?: Segment;
  private initialTextFetched: boolean = false;
  private initialSegmentRef?: string;
  private initialSegmentChecksum?: number;
  private initialSegmentFocus?: boolean;
  private _highlightSegment: boolean = false;

  constructor(private readonly textService: TextService) {}

  get id(): TextDataId {
    return this._id;
  }

  @Input()
  set id(value: TextDataId) {
    if (!eq(this._id, value)) {
      this._id = value;
      this._segment = undefined;
      this.initialSegmentRef = undefined;
      this.initialSegmentChecksum = undefined;
      this.initialSegmentFocus = undefined;
      this.initialTextFetched = false;
      if (this.editor != null) {
        this.segmenter.reset();
        this.bindQuill();
      }
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
      this.setSegment(value);
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

  get editorStyles(): object {
    return this._editorStyles;
  }

  @Input()
  set editorStyles(styles: object) {
    this._editorStyles = styles;
    this.applyEditorStyles();
  }

  ngOnDestroy(): void {
    this.unbindQuill();
    EDITORS.delete(this._editor);
  }

  onEditorCreated(editor: Quill): void {
    this._editor = editor;
    this.segmenter = new UsxSegmenter(this._editor);
    if (this.id != null) {
      this.bindQuill();
    }
    EDITORS.add(this._editor);
  }

  focus(): void {
    if (this.editor != null) {
      this.editor.focus();
    }
  }

  blur(): void {
    if (this.editor != null) {
      this.editor.blur();
    }
  }

  setSegment(segmentRef: string, checksum?: number, focus: boolean = false): boolean {
    if (!this.initialTextFetched) {
      this.initialSegmentRef = segmentRef;
      this.initialSegmentChecksum = checksum;
      this.initialSegmentFocus = focus;
      return true;
    }
    const prevSegment = this.segment;
    if (this.tryChangeSegment(segmentRef, checksum, focus)) {
      this.updated.emit({ prevSegment, segment: this._segment });
      return true;
    }
    return false;
  }

  getSegmentRange(ref: string): RangeStatic {
    return this.segmenter.getSegmentRange(ref);
  }

  getSegmentText(ref: string): string {
    const range = this.segmenter.getSegmentRange(ref);
    return this._editor.getText(range.index, range.length);
  }

  onContentChanged(delta: DeltaStatic, source: Sources): void {
    if (source === 'user') {
      this.textData.submit(delta, this._editor);
    }

    // skip updating when only formatting changes occurred
    if (delta.ops.every(op => op.retain != null)) {
      return;
    }

    this.update(delta);
  }

  onSelectionChanged(): void {
    this.update();
  }

  private applyEditorStyles() {
    if (this._editor != null) {
      const container = this._editor.container as HTMLElement;
      for (const style in this.editorStyles) {
        if (container.style.hasOwnProperty(style)) {
          container.style[style] = this.editorStyles[style];
        }
      }
    }
  }

  private async bindQuill(): Promise<void> {
    this.unbindQuill();
    if (this._id == null || this._editor == null) {
      return;
    }
    // remove placeholder text while the document is opening
    const editorElem = this._editor.container.getElementsByClassName('ql-editor')[0];
    const placeholderText = editorElem.getAttribute('data-placeholder');
    editorElem.setAttribute('data-placeholder', '');
    this.textData = await this.textService.getTextData(this._id);
    this._editor.setContents(this.textData.data);
    this.textDataSub = this.textData.remoteChanges().subscribe(ops => this._editor.updateContents(ops));
    editorElem.setAttribute('data-placeholder', placeholderText);
    this.loaded.emit();
    this.applyEditorStyles();
  }

  private unbindQuill(): void {
    if (this.textData == null) {
      return;
    }
    this.textDataSub.unsubscribe();
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
    if (delta != null && !this.initialTextFetched) {
      segmentRef = this.initialSegmentRef;
      checksum = this.initialSegmentChecksum;
      focus = this.initialSegmentFocus;
      updateUsxFormatForAllSegments = true;
      this.initialSegmentRef = undefined;
      this.initialSegmentChecksum = undefined;
      this.initialSegmentFocus = undefined;

      this.initialTextFetched = true;
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
      if (!this.tryChangeSegment(segmentRef, checksum, focus)) {
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
        if (this.updateUsxSegmentFormat(this._segment.ref, this._segment.range)) {
          // if the segment is no longer blank, ensure that the selection is at the end of the segment.
          // Sometimes after typing in a blank segment, the selection will be at the beginning. This seems to be a bug
          // in Quill.
          Promise.resolve().then(() =>
            this.editor.setSelection(this._segment.range.index + this._segment.range.length, 0, 'user')
          );
        }
      }
    }

    Promise.resolve().then(() => this.adjustSelection());
    this.updated.emit({ delta, prevSegment, segment: this._segment });
  }

  private tryChangeSegment(segmentRef: string, checksum?: number, focus: boolean = false): boolean {
    if (this._segment != null && this._id.textId === this._segment.textId && segmentRef === this._segment.ref) {
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
    this._segment = new Segment(this._id.textId, segmentRef);
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
    if (this._segment.text === '') {
      // always select at the beginning if blank
      newSel = { index: this._segment.range.index, length: 0 };
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

  private updateUsxSegmentFormat(ref: string, range: RangeStatic): boolean {
    const text = this._editor.getText(range.index, range.length);

    if (text === '') {
      if (range.length === 0) {
        // insert blank
        const type = ref.includes('/p') ? 'initial' : 'normal';
        const delta = new Delta();
        delta.retain(range.index);
        delta.insert({ blank: type }, { segment: ref });
        this._editor.updateContents(delta, 'user');
      }
    } else {
      const segmentDelta = this._editor.getContents(range.index, range.length);
      if (segmentDelta.ops.length > 1) {
        const lastOp = segmentDelta.ops[segmentDelta.ops.length - 1];
        if (lastOp.insert != null && lastOp.insert.blank != null) {
          // delete blank
          const delta = new Delta()
            .retain(range.index)
            .retain(range.length - 1, { segment: ref })
            .delete(1);
          this._editor.updateContents(delta, 'user');
          return true;
        } else if (segmentDelta.ops.some(op => op.attributes == null || op.attributes.segment == null)) {
          // add segment format if missing
          this._editor.formatText(range.index, range.length, 'segment', ref, 'user');
        }
      }
    }
    return false;
  }

  private toggleHighlight(range: RangeStatic, value: boolean): void {
    if (range.length > 0) {
      // this changes the underlying HTML, which can mess up some Quill events, so defer this call
      Promise.resolve().then(() =>
        this._editor.formatText(range.index, range.length, 'highlight', value ? this._id.textType : false, 'silent')
      );
    }
  }
}
