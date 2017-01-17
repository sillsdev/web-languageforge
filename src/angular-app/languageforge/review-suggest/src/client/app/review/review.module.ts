import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ReviewComponent } from './review.component';
import { ReviewRoutingModule } from './review-routing.module';
import { DictionaryService } from '../shared/services/dictionary.service';

import { MaterializeModule } from '../shared/materialize.module';

@NgModule({
  imports: [CommonModule, ReviewRoutingModule, FormsModule, MaterializeModule],
  declarations: [ReviewComponent],
  exports: [ReviewComponent],
  providers: [DictionaryService]
})
export class ReviewModule { }