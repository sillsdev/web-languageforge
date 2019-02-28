import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { UICommonModule } from 'xforge-common/ui-common.module';
import { SharedModule } from '../shared/shared.module';
import { CheckingOverviewComponent } from './checking-overview/checking-overview.component';
import { CheckingRoutingModule } from './checking-routing.module';
import { CheckingQuestionsComponent } from './checking/checking-questions/checking-questions.component';
import { CheckingTextComponent } from './checking/checking-text/checking-text.component';
import { CheckingComponent } from './checking/checking.component';
import { FontSizeComponent } from './checking/font-size/font-size.component';
import { QuestionDialogComponent } from './question-dialog/question-dialog.component';

@NgModule({
  declarations: [
    CheckingComponent,
    CheckingOverviewComponent,
    QuestionDialogComponent,
    FontSizeComponent,
    CheckingQuestionsComponent,
    CheckingTextComponent
  ],
  imports: [CheckingRoutingModule, CommonModule, SharedModule, UICommonModule],
  entryComponents: [QuestionDialogComponent]
})
export class CheckingModule {}
