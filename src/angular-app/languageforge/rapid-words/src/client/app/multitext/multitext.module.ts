import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MultitextComponent } from './multitext.component';
import { SharedModule } from '../shared/shared.module';
import { NameListService } from '../shared/name-list/name-list.service';
import { SemanticDomainListService } from '../shared/main-view/main-view.service';

@NgModule({
  imports: [CommonModule, SharedModule],
  declarations: [MultitextComponent],
  exports: [MultitextComponent],
  providers: [SemanticDomainListService]
})
export class MultitextModule { }
