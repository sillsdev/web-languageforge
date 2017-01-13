import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DefinitionComponent } from './definition.component';
import { DefinitionRoutingModule } from './definition-routing.module';
import { DictionaryService } from '../shared/services/dictionary.service';

@NgModule({
  imports: [CommonModule, DefinitionRoutingModule, FormsModule],
  declarations: [DefinitionComponent],
  exports: [DefinitionComponent],
  providers: [DictionaryService]
})
export class DefinitionModule { }