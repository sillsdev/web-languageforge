import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WordDetailsComponent } from './word-details.component';
import { SharedModule } from '../shared/shared.module';
import { NameListService } from '../shared/name-list/name-list.service';
import { MultitextModule } from '../multitext/multitext.module';
@NgModule({
  imports: [CommonModule, SharedModule, MultitextModule],
  declarations: [WordDetailsComponent],
  exports: [WordDetailsComponent],
  providers: []
})
export class WordDetailsModule { }
