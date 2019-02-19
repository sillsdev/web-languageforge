import { MdcDialog, MdcDialogConfig } from '@angular-mdc/web';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';

import { VerseRefData } from 'src/app/core/models/verse-ref-data';
import { Question, QuestionSource } from '../../core/models/question';
import { SFProjectRef } from '../../core/models/sfproject';
import { SFUserRef } from '../../core/models/sfuser';
import { QuestionService } from '../../core/question.service';
import { SFUserService } from '../../core/sfuser.service';
import { SFAdminAuthGuard } from '../../shared/sfadmin-auth.guard';
import {
  QuestionDialogComponent,
  QuestionDialogData,
  QuestionDialogResult
} from '../question-dialog/question-dialog.component';

@Component({
  selector: 'app-checking-overview',
  templateUrl: './checking-overview.component.html',
  styleUrls: ['./checking-overview.component.scss']
})
export class CheckingOverviewComponent implements OnInit {
  isProjectAdmin$: Observable<boolean>;

  private projectId: string;

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly dialog: MdcDialog,
    private readonly adminAuthGuard: SFAdminAuthGuard,
    private readonly userService: SFUserService,
    private readonly questionService: QuestionService
  ) {}

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => (this.projectId = params['id']));
    this.isProjectAdmin$ = this.adminAuthGuard.allowTransition();
  }

  questionDialog(newMode = false) {
    const dialogConfig = {
      data: {
        newMode
      } as QuestionDialogData
    } as MdcDialogConfig;
    const dialogRef = this.dialog.open(QuestionDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result: QuestionDialogResult) => {
      if (result !== 'close') {
        const MAT_BOOK_NUM = 39;
        const question = new Question({
          owner: new SFUserRef(this.userService.currentUserId),
          project: new SFProjectRef(this.projectId),
          source: QuestionSource.Created,
          scriptureStart: new VerseRefData(MAT_BOOK_NUM, 3, 1),
          scriptureEnd: new VerseRefData(MAT_BOOK_NUM, 3, 2),
          text: result.text
        });
        this.questionService.create(question);
      }
    });
  }
}
