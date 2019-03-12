import { Component, ElementRef, HostBinding, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SplitComponent } from 'angular-split';
import { switchMap } from 'rxjs/operators';

import { Resource } from 'xforge-common/models/resource';
import { SubscriptionDisposable } from 'xforge-common/subscription-disposable';
import { nameof } from 'xforge-common/utils';
import { SFProject } from '../../core/models/sfproject';
import { Text } from '../../core/models/text';
import { TextDataId } from '../../core/models/text-data';
import { TextService } from '../../core/text.service';
import { CheckingQuestionsComponent } from './checking-questions/checking-questions.component';
import { CheckingTextComponent } from './checking-text/checking-text.component';

interface Summary {
  unread: number;
  read: number;
  answered: number;
}

export class Question extends Resource {
  title: string;
  read: boolean = false;
  answered: boolean = false;
  answers: Answer[] = [];

  constructor(init?: Partial<Question>) {
    super('question', init);
  }

  totalAnswers() {
    return this.answers.length;
  }

  markAsRead() {
    // TODO: Temporary solution to test functionality - remove when answering panel is ready
    if (this.read) {
      this.addAnswer(
        new Answer({
          id: 'a1',
          text: 'Answer ' + (this.totalAnswers() + 1)
        })
      );
    }
    this.read = true;
  }

  markAsAnswered() {
    this.answered = true;
  }

  addAnswer(answer: Answer) {
    this.answers.push(answer);
    this.markAsAnswered();
  }
}

export class Answer extends Resource {
  text: string;

  constructor(init?: Partial<Answer>) {
    super('answer', init);
  }
}

@Component({
  selector: 'app-checking',
  templateUrl: './checking.component.html',
  styleUrls: ['./checking.component.scss']
})
export class CheckingComponent extends SubscriptionDisposable {
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
  questions: Question[];
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
    this.subscribe(
      this.activatedRoute.params.pipe(
        switchMap(params => {
          return textService.get(params['textId'], [[nameof<Text>('project')]]);
        })
      ),
      textData => {
        const prevTextId = this.text == null ? '' : this.text.id;
        this.text = textData.data;
        this.project = textData.getIncluded(this.text.project);
        this.chapters = this.text.chapters.map(c => c.number);
        if (prevTextId !== this.text.id) {
          this._chapter = 1;
          this.textDataId = new TextDataId(this.text.id, this.chapter);
          this.loadQuestions();
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
  }

  totalQuestions() {
    return this.questions.length;
  }

  private calculateScriptureSliderPosition(): void {
    const scripturePanelHeight = 100 - this.minAnswerPanelHeight;
    const answerPanelHeight = this.minAnswerPanelHeight;
    this.splitComponent.setVisibleAreaSizes([scripturePanelHeight, answerPanelHeight]);
  }

  private loadQuestions() {
    const questions = [];
    for (let q = 1; q < 15; q++) {
      questions.push(
        new Question({
          id: 'q' + q,
          title: 'Question ' + q
        })
      );
    }
    this.questions = questions;
    this.refreshSummary();
  }

  private refreshSummary() {
    this.summary.answered = 0;
    this.summary.read = 0;
    this.summary.unread = 0;
    for (const question of this.questions) {
      if (question.answered) {
        this.summary.answered++;
      } else if (question.read) {
        this.summary.read++;
      } else if (!question.read) {
        this.summary.unread++;
      }
    }
  }
}
