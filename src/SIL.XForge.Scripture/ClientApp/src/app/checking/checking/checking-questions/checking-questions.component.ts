import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { SubscriptionDisposable } from 'xforge-common/subscription-disposable';
import { Question } from '../../../core/models/question';

@Component({
  selector: 'app-checking-questions',
  templateUrl: './checking-questions.component.html',
  styleUrls: ['./checking-questions.component.scss']
})
export class CheckingQuestionsComponent extends SubscriptionDisposable {
  private get activeQuestionIndex() {
    return this.questions.findIndex(question => question.id === this.activeQuestion.id);
  }
  @Input() questions: Question[] = [];
  @Output() update: EventEmitter<Question> = new EventEmitter<Question>();
  @Output() changed: EventEmitter<Question> = new EventEmitter<Question>();
  activeQuestion: Question;
  activeQuestionSubject: Subject<Question> = new Subject<Question>();

  constructor() {
    super();
    // Only mark as read if it has been viewed for a set period of time and not an accidental click
    this.subscribe(this.activeQuestionSubject.pipe(debounceTime(2000)), question => {
      if (question) {
        question.read = true;
        this.update.emit(question);
      }
    });
  }

  getUserAnswers(question: Question) {
    // TODO: (NW) Limit to answers by the current user
    return question.answers.length;
  }

  checkCanChangeQuestion(newIndex: number) {
    return !!this.questions[this.activeQuestionIndex + newIndex];
  }

  nextQuestion() {
    this.changeQuestion(1);
  }

  previousQuestion() {
    this.changeQuestion(-1);
  }

  activateQuestion(question: Question) {
    this.activeQuestion = question;
    this.changed.emit(question);
    this.activeQuestionSubject.next(question);
  }

  private changeQuestion(newDifferential: number) {
    if (this.activeQuestion && this.checkCanChangeQuestion(newDifferential)) {
      this.activateQuestion(this.questions[this.activeQuestionIndex + newDifferential]);
    }
  }
}
