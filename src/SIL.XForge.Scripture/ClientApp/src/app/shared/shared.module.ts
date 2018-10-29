import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { QuillModule } from 'ngx-quill';

import { TextComponent } from './text/text.component';

@NgModule({
  imports: [
    CommonModule,
    QuillModule
  ],
  declarations: [TextComponent],
  exports: [TextComponent]
})
export class SharedModule { }
