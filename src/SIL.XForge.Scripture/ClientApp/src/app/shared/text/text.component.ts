import { Component, Input, OnDestroy, ViewEncapsulation } from '@angular/core';
import Quill, { DeltaStatic, Sources } from 'quill';
import { fromEvent, Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { TextData } from '../../core/models/text-data';
import { TextService, TextType } from '../../core/text.service';
import { registerScripture } from './quill-scripture';

registerScripture();

@Component({
  selector: 'app-text',
  templateUrl: './text.component.html',
  styleUrls: ['./text.component.scss', './usx-styles.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TextComponent implements OnDestroy {
  @Input() textType: TextType = 'target';
  @Input() isReadOnly: boolean = true;
  modules: any = { toolbar: false };

  private _textId: string;
  private editor: Quill;
  private editorSub: Subscription;
  private textDataSub: Subscription;
  private textData: TextData;

  constructor(private readonly textService: TextService) {}

  get textId(): string {
    return this._textId;
  }

  @Input()
  set textId(value: string) {
    this._textId = value;
    this.bindQuill();
  }

  ngOnDestroy(): void {
    this.unbindQuill();
  }

  onEditorCreated(editor: Quill): void {
    this.editor = editor;
    this.bindQuill();
  }

  private async bindQuill(): Promise<void> {
    await this.unbindQuill();
    if (this._textId == null || this.editor == null) {
      return;
    }
    this.textData = await this.textService.connect(
      this.textId,
      this.textType
    );
    this.editor.setContents(this.textData.data);
    this.editorSub = fromEvent<[DeltaStatic, DeltaStatic, Sources]>(this.editor, 'text-change')
      .pipe(
        filter(([, , source]) => source === 'user'),
        map(([delta]) => delta)
      )
      .subscribe(delta => this.textData.submit(delta, this.editor));
    this.textDataSub = this.textData.remoteChanges().subscribe(ops => this.editor.updateContents(ops));
  }

  private async unbindQuill(): Promise<void> {
    if (this.textData == null) {
      return;
    }
    this.textDataSub.unsubscribe();
    this.editorSub.unsubscribe();
    await this.textService.disconnect(this.textData);
    this.editor.setText('', 'silent');
  }
}
