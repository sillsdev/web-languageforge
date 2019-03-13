import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { AngularSplitModule } from 'angular-split';
import { UICommonModule } from 'xforge-common/ui-common.module';
import { XForgeCommonModule } from 'xforge-common/xforge-common.module';
import { SharedModule } from '../shared/shared.module';
import { CheckingOverviewComponent } from './checking-overview/checking-overview.component';
import { CheckingRoutingModule } from './checking-routing.module';
import { CheckingAnswersComponent } from './checking/checking-answers/checking-answers.component';
import { CheckingQuestionsComponent } from './checking/checking-questions/checking-questions.component';
import { CheckingTextComponent } from './checking/checking-text/checking-text.component';
import { CheckingComponent } from './checking/checking.component';
import { FontSizeComponent } from './checking/font-size/font-size.component';
import { QuestionDialogComponent } from './question-dialog/question-dialog.component';

@NgModule({
  declarations: [
    CheckingComponent,
    CheckingOverviewComponent,
    CheckingQuestionsComponent,
    CheckingTextComponent,
    CheckingAnswersComponent,
    QuestionDialogComponent,
    FontSizeComponent
  ],
  imports: [
    CheckingRoutingModule,
    CommonModule,
    SharedModule,
    UICommonModule,
    XForgeCommonModule,
    AngularSplitModule.forRoot()
  ],
  entryComponents: [QuestionDialogComponent]
})
export class CheckingModule {}
