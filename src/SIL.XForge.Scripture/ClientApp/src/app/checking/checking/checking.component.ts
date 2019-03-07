import { Component, HostBinding, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { Resource } from 'xforge-common/models/resource';
import { SubscriptionDisposable } from 'xforge-common/subscription-disposable';
import { nameof } from 'xforge-common/utils';
import { SFProject } from '../../core/models/sfproject';
import { Text } from '../../core/models/text';
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
  project: SFProject;
  text: Text;
  questions: Question[];
  summary: Summary = {
    read: 0,
    unread: 0,
    answered: 0
  };

  constructor(private activatedRoute: ActivatedRoute, private textService: TextService) {
    super();
    this.subscribe(
      this.activatedRoute.params.pipe(
        switchMap(params => {
          return textService.get(params['textId'], [[nameof<Text>('project')]]);
        })
      ),
      textData => {
        this.text = textData.data;
        this.project = textData.getIncluded(this.text.project);
        this.loadQuestions();
      }
    );
  }

  applyFontChange(fontSize: string) {
    this.scripturePanel.applyFontChange(fontSize);
  }

  totalQuestions() {
    return this.questions.length;
  }

  questionUpdate(question: Question) {
    this.refreshSummary();
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
