import { MdcDialog, MdcDialogConfig } from '@angular-mdc/web';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { clone } from '@orbit/utils';
import { ObjectId } from 'bson';
import { Observable } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

import { UserRef } from 'xforge-common/models/user';
import { NoticeService } from 'xforge-common/notice.service';
import { SubscriptionDisposable } from 'xforge-common/subscription-disposable';
import { UserService } from 'xforge-common/user.service';
import { Question, QuestionSource } from '../../core/models/question';
import { QuestionData } from '../../core/models/question-data';
import { ScrVers } from '../../core/models/scripture/scr-vers';
import { VerseRef } from '../../core/models/scripture/verse-ref';
import { ScrVersType } from '../../core/models/scripture/versification';
import { SFProjectRef } from '../../core/models/sfproject';
import { Text } from '../../core/models/text';
import { QuestionService } from '../../core/question.service';
import { SFProjectService } from '../../core/sfproject.service';
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
export class CheckingOverviewComponent extends SubscriptionDisposable implements OnInit, OnDestroy {
  itemVisible: { [textId: string]: boolean } = {};
  questions: { [textId: string]: QuestionData } = {};
  isProjectAdmin$: Observable<boolean>;
  texts: Text[];
  textsByBook: { [bookId: string]: Text };

  private projectId: string;

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly adminAuthGuard: SFAdminAuthGuard,
    private readonly dialog: MdcDialog,
    private readonly noticeService: NoticeService,
    private readonly projectService: SFProjectService,
    private readonly questionService: QuestionService,
    private readonly userService: UserService
  ) {
    super();
  }

  ngOnInit(): void {
    this.subscribe(
      this.activatedRoute.params.pipe(
        tap(params => {
          this.noticeService.loadingStarted();
          this.projectId = params['projectId'];
          this.isProjectAdmin$ = this.adminAuthGuard.allowTransition(this.projectId);
        }),
        switchMap(() => this.projectService.getTexts(this.projectId))
      ),
      async r => {
        this.textsByBook = {};
        this.texts = [];
        for (const t of r) {
          this.textsByBook[t.bookId] = t;
          this.texts.push(t);
          await this.bindQuestionData(t.id);
        }
        this.noticeService.loadingFinished();
      }
    );
  }

  ngOnDestroy(): void {
    for (const text of this.texts) {
      this.unbindQuestionData(text.id);
    }
    super.ngOnDestroy();
    this.noticeService.loadingFinished();
  }

  questionCount(textId: string): number {
    if (!(textId in this.questions)) {
      return undefined;
    }

    return this.questions[textId].data.length;
  }

  questionDialog(editMode = false, textId?: string, questionIndex: number = 0): void {
    let newQuestion: Question = { id: undefined, owner: undefined, project: undefined };
    let question: Question;
    if (editMode) {
      if (textId == null || textId === '' || questionIndex == null || questionIndex < 0) {
        throw new Error('Must supply valid textId and questionIndex in editMode');
      }

      question = this.questions[textId].data[questionIndex];
      newQuestion = clone(question);
    }
    const dialogConfig: MdcDialogConfig<QuestionDialogData> = {
      data: {
        editMode,
        question
      }
    };
    const dialogRef = this.dialog.open(QuestionDialogComponent, dialogConfig);

    dialogRef.afterClosed().subscribe(async (result: QuestionDialogResult) => {
      if (result !== 'close') {
        const verseStart = VerseRef.fromStr(result.scriptureStart, ScrVers.English);
        const verseEnd = VerseRef.fromStr(result.scriptureEnd, ScrVers.English);
        const versification: string = ScrVersType[ScrVersType.English];
        newQuestion.scriptureStart = {
          book: verseStart.book,
          chapter: verseStart.chapter,
          verse: verseStart.verse,
          versification
        };
        newQuestion.scriptureEnd = {
          book: verseEnd.book,
          chapter: verseEnd.chapter,
          verse: verseEnd.verse,
          versification
        };
        newQuestion.text = result.text;

        if (editMode) {
          this.questions[textId].replaceInList(question, newQuestion, questionIndex);
        } else {
          const newTextId = this.textIdFrom(verseStart.book);
          const questionData = await this.questionService.connect(newTextId);
          newQuestion.id = new ObjectId().toHexString();
          newQuestion.owner = new UserRef(this.userService.currentUserId);
          newQuestion.project = new SFProjectRef(this.projectId);
          newQuestion.source = QuestionSource.Created;
          questionData.insertInList(newQuestion);
        }
      }
    });
  }

  private async bindQuestionData(textId: string): Promise<void> {
    if (textId == null) {
      return;
    }

    await this.unbindQuestionData(textId);
    const questionData: QuestionData = await this.questionService.connect(textId);
    this.questions[textId] = questionData;
  }

  private async unbindQuestionData(textId: string): Promise<void> {
    if (!(textId in this.questions)) {
      return;
    }

    await this.questionService.disconnect(this.questions[textId]);
    delete this.questions[textId];
  }

  private textIdFrom(bookId: string): string {
    if (!(bookId in this.textsByBook)) {
      return undefined;
    }
    return this.textsByBook[bookId].id;
  }
}
