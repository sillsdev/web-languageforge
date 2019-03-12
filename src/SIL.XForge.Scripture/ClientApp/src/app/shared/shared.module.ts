import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { QuillModule } from 'ngx-quill';

import { UICommonModule } from 'xforge-common/ui-common.module';
import { ChapterNavComponent } from './chapter-nav/chapter-nav.component';
import { TextComponent } from './text/text.component';

@NgModule({
  imports: [CommonModule, QuillModule, UICommonModule],
  declarations: [TextComponent, ChapterNavComponent],
  exports: [TextComponent, ChapterNavComponent]
})
export class SharedModule {}
