import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MeaningDetailsComponent } from './meaning-details.component';
import { SharedModule } from '../shared/shared.module';
import { NameListService } from '../shared/name-list/name-list.service';
import { SemanticDomainListService } from '../shared/main-view/main-view.service';

@NgModule({
  imports: [CommonModule, SharedModule],
  declarations: [MeaningDetailsComponent],
  exports: [MeaningDetailsComponent],
  providers: [SemanticDomainListService]
})
export class MeaningDetailsModule { }
