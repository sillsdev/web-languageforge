import { MdcDialog, MdcDialogConfig } from '@angular-mdc/web';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';

import { UserRef } from 'xforge-common/models/user';
import { UserService } from 'xforge-common/user.service';
import { Question, QuestionSource } from '../../core/models/question';
import { ScrVers } from '../../core/models/scripture/scr-vers';
import { VerseRef } from '../../core/models/scripture/verse-ref';
import { ScrVersType, VerseRefData } from '../../core/models/sfdomain-model.generated';
import { SFProjectRef } from '../../core/models/sfproject';
import { QuestionService } from '../../core/question.service';
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
    private readonly userService: UserService,
    private readonly questionService: QuestionService
  ) {}

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      this.projectId = params['id'];
      this.isProjectAdmin$ = this.adminAuthGuard.allowTransition(this.projectId);
    });
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
        const verseStart = VerseRef.fromStr(result.scriptureStart, ScrVers.English);
        const verseEnd = VerseRef.fromStr(result.scriptureEnd, ScrVers.English);
        const question = new Question({
          owner: new UserRef(this.userService.currentUserId),
          project: new SFProjectRef(this.projectId),
          source: QuestionSource.Created,
          scriptureStart: new VerseRefDataConstructor(verseStart.book, verseStart.chapter, verseStart.verse),
          scriptureEnd: new VerseRefDataConstructor(verseEnd.book, verseEnd.chapter, verseEnd.verse),
          text: result.text
        });
        this.questionService.create(question);
      }
    });
  }
}

class VerseRefDataConstructor implements VerseRefData {
  constructor(
    public book?: string,
    public chapter?: string,
    public verse?: string,
    public versification: ScrVersType = ScrVersType.English
  ) {}
}
