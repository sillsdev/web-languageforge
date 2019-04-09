import { Component, ElementRef, HostBinding, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SplitComponent } from 'angular-split';
import { switchMap } from 'rxjs/operators';

import { SubscriptionDisposable } from 'xforge-common/subscription-disposable';
import { nameof } from 'xforge-common/utils';
import { Answer } from '../../core/models/answer';
import { Question } from '../../core/models/question';
import { QuestionData } from '../../core/models/question-data';
import { SFProject } from '../../core/models/sfproject';
import { Text } from '../../core/models/text';
import { TextDataId } from '../../core/models/text-data';
import { getTextJsonDataIdStr, TextJsonDataId } from '../../core/models/text-json-data-id';
import { TextService } from '../../core/text.service';
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
  @HostBinding('class') classes = 'flex-max';
  @ViewChild(CheckingTextComponent) scripturePanel: CheckingTextComponent;
  @ViewChild(CheckingQuestionsComponent) questionsPanel: CheckingQuestionsComponent;
  @ViewChild(SplitComponent) splitComponent: SplitComponent;
  @ViewChild('splitContainer') splitContainerElement: ElementRef;
  @ViewChild('scripturePanelContainer') scripturePanelContainerElement: ElementRef;

  @ViewChild('answerPanelContainer') set answersPanelElement(answersPanelContainerElement: ElementRef) {
    // Need to trigger the calculation for the slider after DOM has been updated
    this.answersPanelContainerElement = answersPanelContainerElement;
    this.calculateScriptureSliderPosition();
  }

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

  constructor(private activatedRoute: ActivatedRoute, private textService: TextService) {
    super();
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

  private get splitContainerElementHeight(): number {
    return this.splitContainerElement ? this.splitContainerElement.nativeElement.offsetHeight : 0;
  }

  private get answerPanelElementHeight(): number {
    return this.answersPanelContainerElement ? this.answersPanelContainerElement.nativeElement.offsetHeight : 0;
  }

  private get minAnswerPanelHeight(): number {
    // Add 1 extra percentage to allow for gutter (slider toggle) height eating in to calculated space requested
    return Math.ceil((this.answerPanelElementHeight / this.splitContainerElementHeight) * 100) + 1;
  }

  applyFontChange(fontSize: string) {
    this.scripturePanel.applyFontChange(fontSize);
  }

  addAnswer(answer: Answer) {
    // TODO: (NW) Update the document once the answer functionality is ready
    this.questionsPanel.activeQuestion.answers.push(answer);
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
    // TODO: (NW) Temporary solution to test functionality - remove when answering panel is ready
    if (question.read) {
      this.addAnswer({
        id: 'a1',
        ownerRef: '',
        text: 'Answer ' + (question.answers.length + 1)
      });
    }
    this.calculateScriptureSliderPosition();
  }

  totalQuestions() {
    return this.questions.length;
  }

  private calculateScriptureSliderPosition(): void {
    const scripturePanelHeight = 100 - this.minAnswerPanelHeight;
    const answerPanelHeight = this.minAnswerPanelHeight;
    this.splitComponent.setVisibleAreaSizes([scripturePanelHeight, answerPanelHeight]);
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
        // TODO: (NW) Only check answers for the current user - requires real answers being in the question document
        this.summary.answered++;
      } else if (question.read) {
        this.summary.read++;
      } else if (!question.read) {
        this.summary.unread++;
      }
    }
  }
}
