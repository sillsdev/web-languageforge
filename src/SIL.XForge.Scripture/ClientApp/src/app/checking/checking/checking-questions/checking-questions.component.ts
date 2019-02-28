import { Component, EventEmitter, Input, Output } from '@angular/core';
import { timer } from 'rxjs';
import { SubscriptionDisposable } from 'xforge-common/subscription-disposable';
import { Question } from '../checking.component';

@Component({
  selector: 'app-checking-questions',
  templateUrl: './checking-questions.component.html',
  styleUrls: ['./checking-questions.component.scss']
})
export class CheckingQuestionsComponent extends SubscriptionDisposable {
  @Input() questions: Question[] = [];
  @Output() update: EventEmitter<Question> = new EventEmitter<Question>();
  activeQuestion: Question;

  constructor() {
    super();
  }

  private get activeQuestionIndex() {
    return this.questions.findIndex(question => question.id === this.activeQuestion.id);
  }

  activateQuestion(question: Question) {
    this.activeQuestion = question;

    // Only mark as read if it has been viewed for a set period of time and not an accidental click
    const readTimer = this.subscribe(timer(1000), () => {
      if (this.activeQuestion.id === question.id) {
        question.markAsRead();
        readTimer.unsubscribe();
        this.update.emit(question);
      }
    });
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

  private changeQuestion(newDifferential: number) {
    if (this.activeQuestion && this.checkCanChangeQuestion(newDifferential)) {
      this.activateQuestion(this.questions[this.activeQuestionIndex + newDifferential]);
    }
  }
}
