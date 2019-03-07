import { Component, Input, ViewChild } from '@angular/core';
import { TextComponent } from '../../../shared/text/text.component';

@Component({
  selector: 'app-checking-text',
  templateUrl: './checking-text.component.html',
  styleUrls: ['./checking-text.component.scss']
})
export class CheckingTextComponent {
  @ViewChild(TextComponent) textComponent: TextComponent;
  @Input() textId: string = '';

  constructor() {}

  applyFontChange(fontSize: string) {
    this.textComponent.editorStyles = {
      fontSize: fontSize
    };
  }
}
