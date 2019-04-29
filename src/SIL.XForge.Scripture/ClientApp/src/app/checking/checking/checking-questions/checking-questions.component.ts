import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { SubscriptionDisposable } from 'xforge-common/subscription-disposable';
import { UserService } from 'xforge-common/user.service';
import { Question } from '../../../core/models/question';

@Component({
  selector: 'app-checking-questions',
  templateUrl: './checking-questions.component.html',
  styleUrls: ['./checking-questions.component.scss']
})
export class CheckingQuestionsComponent extends SubscriptionDisposable {
  @Output() update: EventEmitter<Question> = new EventEmitter<Question>();
  @Output() changed: EventEmitter<Question> = new EventEmitter<Question>();
  _questions: Question[] = [];
  activeQuestion: Question;
  activeQuestionSubject: Subject<Question> = new Subject<Question>();

  constructor(private userService: UserService) {
    super();
    // Only mark as read if it has been viewed for a set period of time and not an accidental click
    this.subscribe(this.activeQuestionSubject.pipe(debounceTime(2000)), question => {
      if (question) {
        question.read = true;
        this.update.emit(question);
      }
    });
  }

  get activeQuestionIndex() {
    return this.questions.findIndex(question => question.id === this.activeQuestion.id);
  }

  get questions(): Question[] {
    return this._questions;
  }

  @Input() set questions(questions: Question[]) {
    if (this.activeQuestion && questions.length) {
      this.activateQuestion(questions[Object.keys(questions)[0]]);
    } else {
      this.activeQuestion = undefined;
    }
    this._questions = questions;
  }

  getUnreadAnswers(question: Question) {
    // TODO: (NW) Limit to unread answers and comments
    return question.answers.length;
  }

  checkCanChangeQuestion(newIndex: number) {
    return !!this.questions[this.activeQuestionIndex + newIndex];
  }

  hasUserAnswered(question: Question) {
    return question.answers.filter(answer => (answer.ownerRef = this.userService.currentUserId)).length > 0;
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
