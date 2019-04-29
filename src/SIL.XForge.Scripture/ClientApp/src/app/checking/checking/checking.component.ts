import { Component, ElementRef, HostBinding, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SplitComponent } from 'angular-split';
import { switchMap } from 'rxjs/operators';

import { clone } from '@orbit/utils';
import { SubscriptionDisposable } from 'xforge-common/subscription-disposable';
import { UserService } from 'xforge-common/user.service';
import { nameof, objectId } from 'xforge-common/utils';
import { Answer } from '../../core/models/answer';
import { Question } from '../../core/models/question';
import { QuestionData } from '../../core/models/question-data';
import { SFProject } from '../../core/models/sfproject';
import { Text } from '../../core/models/text';
import { TextDataId } from '../../core/models/text-data';
import { getTextJsonDataIdStr, TextJsonDataId } from '../../core/models/text-json-data-id';
import { TextService } from '../../core/text.service';
import { AnswerAction } from './checking-answers/checking-answers.component';
import { CheckingQuestionsComponent } from './checking-questions/checking-questions.component';
import { CheckingTextComponent } from './checking-text/checking-text.component';

interface Summary {
  unread: number;
  read: number;
  answered: number;
}

@Component({
  selector: 'app-checking',
  templateUrl: './checking.component.html',
  styleUrls: ['./checking.component.scss']
})
export class CheckingComponent extends SubscriptionDisposable implements OnInit {
  @ViewChild('answerPanelContainer') set answersPanelElement(answersPanelContainerElement: ElementRef) {
    // Need to trigger the calculation for the slider after DOM has been updated
    this.answersPanelContainerElement = answersPanelContainerElement;
    this.calculateScriptureSliderPosition();
  }
  @HostBinding('class') classes = 'flex-max';
  @ViewChild(CheckingTextComponent) scripturePanel: CheckingTextComponent;
  @ViewChild(CheckingQuestionsComponent) questionsPanel: CheckingQuestionsComponent;
  @ViewChild(SplitComponent) splitComponent: SplitComponent;
  @ViewChild('splitContainer') splitContainerElement: ElementRef;
  @ViewChild('scripturePanelContainer') scripturePanelContainerElement: ElementRef;

  project: SFProject;
  text: Text;
  questions: Question[] = [];
  questionData: { [textId: string]: QuestionData } = {};
  summary: Summary = {
    read: 0,
    unread: 0,
    answered: 0
  };
  answersPanelContainerElement: ElementRef;
  textDataId: TextDataId;
  chapters: number[] = [];

  private _chapter: number;

  constructor(
    private activatedRoute: ActivatedRoute,
    private textService: TextService,
    private readonly userService: UserService
  ) {
    super();
  }

  get chapter(): number {
    return this._chapter;
  }

  set chapter(value: number) {
    if (this._chapter !== value) {
      this._chapter = value;
      this.textDataId = new TextDataId(this.text.id, this.chapter);
      this.bindQuestionData(new TextJsonDataId(this.text.id, this.chapter)).then(() => {
        this.questions = this.questionData[getTextJsonDataIdStr(this.text.id, this.chapter)].data;
      });
    }
  }

  private get answerPanelElementHeight(): number {
    return this.answersPanelContainerElement ? this.answersPanelContainerElement.nativeElement.offsetHeight : 0;
  }

  private get minAnswerPanelHeight(): number {
    // Add 1 extra percentage to allow for gutter (slider toggle) height eating in to calculated space requested
    return Math.ceil((this.answerPanelElementHeight / this.splitContainerElementHeight) * 100) + 1;
  }

  private get splitContainerElementHeight(): number {
    return this.splitContainerElement ? this.splitContainerElement.nativeElement.offsetHeight : 0;
  }

  ngOnInit(): void {
    this.subscribe(
      this.activatedRoute.params.pipe(
        switchMap(params => {
          return this.textService.get(params['textId'], [[nameof<Text>('project')]]);
        })
      ),
      textData => {
        const prevTextId = this.text == null ? '' : this.text.id;
        this.text = textData.data;
        if (this.text != null) {
          this.project = textData.getIncluded(this.text.project);
          this.chapters = this.text.chapters.map(c => c.number);
          this._chapter = undefined;
          if (prevTextId !== this.text.id) {
            this.chapter = 1;
          }
        }
      }
    );
  }

  applyFontChange(fontSize: string) {
    this.scripturePanel.applyFontChange(fontSize);
  }

  answerAction(answerAction: AnswerAction) {
    if (answerAction.action === 'save') {
      let answer: Answer = answerAction.answer;
      if (!answer) {
        answer = {
          id: objectId(),
          ownerRef: this.userService.currentUserId,
          text: ''
        };
      }
      answer.text = answerAction.text;
      this.saveAnswer(answer);
    } else if (answerAction.action === 'delete') {
      this.deleteAnswer(answerAction.answer);
    }
    this.calculateScriptureSliderPosition();
  }

  checkSliderPosition(event: any) {
    if (event.hasOwnProperty('sizes')) {
      if (event.sizes[1] < this.minAnswerPanelHeight) {
        this.calculateScriptureSliderPosition();
      }
    }
  }

  questionUpdated(question: Question) {
    this.refreshSummary();
  }

  questionChanged(question: Question) {
    this.calculateScriptureSliderPosition();
    this.refreshSummary();
  }

  totalQuestions() {
    return this.questions.length;
  }

  private getAnswerIndex(answer: Answer) {
    return this.questionsPanel.activeQuestion.answers.findIndex(existingAnswer => existingAnswer.id === answer.id);
  }

  private deleteAnswer(answer: Answer) {
    const answerIndex = this.getAnswerIndex(answer);
    if (answerIndex >= 0) {
      const answers = clone(this.questionsPanel.activeQuestion.answers);
      answers.splice(answerIndex, 1);
      this.questionData[getTextJsonDataIdStr(this.text.id, this.chapter)].deleteFromList(
        this.questionsPanel.activeQuestion,
        [this.questionsPanel.activeQuestionIndex, 'answers', answerIndex]
      );
      this.refreshSummary();
    }
  }

  private saveAnswer(answer: Answer) {
    const answers = clone(this.questionsPanel.activeQuestion.answers);
    const answerIndex = this.getAnswerIndex(answer);
    if (answerIndex >= 0) {
      answers[answerIndex] = answer;
    } else {
      answers.push(answer);
    }
    this.updateQuestionAnswers(answers, answerIndex);
  }

  private updateQuestionAnswers(answers: Answer[], answerIndex: number) {
    const questionWithAnswer = clone(this.questionsPanel.activeQuestion);
    questionWithAnswer.answers = answers;
    if (answerIndex >= 0) {
      this.questionData[getTextJsonDataIdStr(this.text.id, this.chapter)].replaceInList(
        this.questionsPanel.activeQuestion.answers[answerIndex],
        questionWithAnswer.answers[answerIndex],
        [this.questionsPanel.activeQuestionIndex, 'answers', answerIndex]
      );
    } else {
      this.questionData[getTextJsonDataIdStr(this.text.id, this.chapter)].insertInList(questionWithAnswer.answers[0], [
        this.questionsPanel.activeQuestionIndex,
        'answers',
        0
      ]);
    }
    this.refreshSummary();
  }

  private calculateScriptureSliderPosition(): void {
    // Wait while Angular updates visible DOM elements before we can calculate the height correctly
    setTimeout((): void => {
      const scripturePanelHeight = 100 - this.minAnswerPanelHeight;
      const answerPanelHeight = this.minAnswerPanelHeight;
      this.splitComponent.setVisibleAreaSizes([scripturePanelHeight, answerPanelHeight]);
    }, 1);
  }

  private async bindQuestionData(id: TextJsonDataId): Promise<void> {
    if (id == null) {
      return;
    }

    this.unbindQuestionData(id);
    const questionData: QuestionData = await this.textService.getQuestionData(id);
    this.questionData[id.toString()] = questionData;
  }

  private unbindQuestionData(id: TextJsonDataId): void {
    if (!(id.toString() in this.questionData)) {
      return;
    }

    delete this.questionData[id.toString()];
  }

  private refreshSummary() {
    this.summary.answered = 0;
    this.summary.read = 0;
    this.summary.unread = 0;
    for (const question of this.questions) {
      if (question.answers.length) {
        if (question.answers.filter(answer => (answer.ownerRef = this.userService.currentUserId)).length) {
          this.summary.answered++;
        }
      } else if (question.read) {
        // TODO: (NW) Change once read variable is actually being set
        this.summary.read++;
      } else if (!question.read) {
        // TODO: (NW) Change once read variable is actually being set
        this.summary.unread++;
      }
    }
  }
}
