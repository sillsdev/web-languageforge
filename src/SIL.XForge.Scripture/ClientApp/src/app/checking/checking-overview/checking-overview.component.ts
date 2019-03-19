import { MdcDialog, MdcDialogConfig } from '@angular-mdc/web';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { clone } from '@orbit/utils';
import { Observable } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { getJsonDataIdStr, JsonDataId } from 'xforge-common/models/json-data';
import { UserRef } from 'xforge-common/models/user';
import { NoticeService } from 'xforge-common/notice.service';
import { SubscriptionDisposable } from 'xforge-common/subscription-disposable';
import { UserService } from 'xforge-common/user.service';
import { objectId } from 'xforge-common/utils';
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
  getJsonDataIdStr = getJsonDataIdStr;
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
        for (const text of r) {
          this.textsByBook[text.bookId] = text;
          this.texts.push(text);
          for (const chapter of text.chapters) {
            await this.bindQuestionData(new JsonDataId(text.id, chapter.number));
          }
        }
        this.noticeService.loadingFinished();
      }
    );
  }

  ngOnDestroy(): void {
    if (this.texts != null) {
      for (const text of this.texts) {
        for (const chapter of text.chapters) {
          this.unbindQuestionData(new JsonDataId(text.id, chapter.number));
        }
      }
    }
    super.ngOnDestroy();
    this.noticeService.loadingFinished();
  }

  allQuestionsCount(text: Text): number {
    let count: number;
    for (const chapter of text.chapters) {
      const questionCount = this.questionCount(text.id, chapter.number);
      if (questionCount) {
        if (!count) {
          count = 0;
        }
        count += questionCount;
      }
    }
    return count;
  }

  questionCount(textId: string, chapterNumber: number): number {
    const id = new JsonDataId(textId, chapterNumber);
    if (!(id.toString() in this.questions)) {
      return undefined;
    }

    return this.questions[id.toString()].data.length;
  }

  questionCountLabel(count: number): string {
    return count ? count + ' questions' : '';
  }

  allAnswersCount(text: Text): number {
    let count: number;
    for (const chapter of text.chapters) {
      const answerCount = this.chapterAnswerCount(text.id, chapter.number);
      if (answerCount) {
        if (!count) {
          count = 0;
        }
        count += answerCount;
      }
    }
    return count;
  }

  chapterAnswerCount(textId: string, chapterNumber: number): number {
    const id = new JsonDataId(textId, chapterNumber);
    if (!(id.toString() in this.questions)) {
      return undefined;
    }

    let count: number;
    for (const index of Object.keys(this.questions[id.toString()].data)) {
      const answerCount = this.answerCount(textId, chapterNumber, +index);
      if (answerCount) {
        if (!count) {
          count = 0;
        }
        count += answerCount;
      }
    }

    return count;
  }

  answerCount(textId: string, chapterNumber: number, questionIndex: number = 0): number {
    const id = new JsonDataId(textId, chapterNumber);
    if (!(id.toString() in this.questions)) {
      return undefined;
    }

    let count: number;
    const question = this.questions[id.toString()].data[questionIndex];
    if (question.answers) {
      if (!count) {
        count = 0;
      }
      count += question.answers.length;
    }

    return count;
  }

  answerCountLabel(count: number): string {
    return count ? count + ' answers' : '';
  }

  questionDialog(editMode = false, textId?: string, chapterNumber?: number, questionIndex: number = 0): void {
    let newQuestion: Question = { id: undefined, owner: undefined, project: undefined };
    let id: JsonDataId;
    let question: Question;
    if (editMode) {
      if (
        textId == null ||
        textId === '' ||
        chapterNumber == null ||
        chapterNumber < 0 ||
        questionIndex == null ||
        questionIndex < 0
      ) {
        throw new Error('Must supply valid textId, chapterNumber and questionIndex in editMode');
      }

      id = new JsonDataId(textId, chapterNumber);
      question = this.questions[id.toString()].data[questionIndex];
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
          this.questions[id.toString()].replaceInList(question, newQuestion, [questionIndex]);
        } else {
          id = new JsonDataId(this.textFromBook(verseStart.book).id, verseStart.chapterNum);
          const questionData = await this.questionService.connect(id);
          newQuestion.id = objectId();
          newQuestion.owner = new UserRef(this.userService.currentUserId);
          newQuestion.project = new SFProjectRef(this.projectId);
          newQuestion.source = QuestionSource.Created;
          newQuestion.answers = [];
          questionData.insertInList(newQuestion);
        }
      }
    });
  }

  private async bindQuestionData(id: JsonDataId): Promise<void> {
    if (id == null) {
      return;
    }

    await this.unbindQuestionData(id);
    const questionData: QuestionData = await this.questionService.connect(id);
    this.questions[id.toString()] = questionData;
  }

  private async unbindQuestionData(id: JsonDataId): Promise<void> {
    if (!(id.toString() in this.questions)) {
      return;
    }

    await this.questionService.disconnect(this.questions[id.toString()]);
    delete this.questions[id.toString()];
  }

  private textFromBook(bookId: string): Text {
    if (!(bookId in this.textsByBook)) {
      return undefined;
    }
    return this.textsByBook[bookId];
  }
}
