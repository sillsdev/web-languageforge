import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MultitextComponent } from './multitext.component';
import { SharedModule } from '../shared/shared.module';
import { NameListService } from '../shared/name-list/name-list.service';

@NgModule({
  imports: [CommonModule, SharedModule],
  declarations: [MultitextComponent],
  exports: [MultitextComponent],
  providers: []
})
export class MultitextModule { }
