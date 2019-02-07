import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { UICommonModule } from 'xforge-common/ui-common.module';
import { SharedModule } from '../shared/shared.module';
import { EditorComponent } from './editor/editor.component';
import { SuggestionComponent } from './editor/suggestion.component';
import { TranslateRoutingModule } from './translate-routing.module';

@NgModule({
  declarations: [EditorComponent, SuggestionComponent],
  imports: [TranslateRoutingModule, CommonModule, SharedModule, UICommonModule]
})
export class TranslateModule {}
