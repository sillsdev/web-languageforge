import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { SubscriptionDisposable } from 'xforge-common/subscription-disposable';
import { UserService } from 'xforge-common/user.service';
import { Question } from '../../../core/models/question';
import { SFProjectUser } from '../../../core/models/sfproject-user';
import { SFProjectUserService } from '../../../core/sfproject-user.service';

@Component({
  selector: 'app-checking-questions',
  templateUrl: './checking-questions.component.html',
  styleUrls: ['./checking-questions.component.scss']
})
export class CheckingQuestionsComponent extends SubscriptionDisposable {
  @Input() projectCurrentUser: SFProjectUser;
  @Output() update: EventEmitter<Question> = new EventEmitter<Question>();
  @Output() changed: EventEmitter<Question> = new EventEmitter<Question>();
  _questions: Question[] = [];
  activeQuestion: Question;
  activeQuestionSubject: Subject<Question> = new Subject<Question>();

  constructor(private userService: UserService, private projectUserService: SFProjectUserService) {
    super();
    // Only mark as read if it has been viewed for a set period of time and not an accidental click
    this.subscribe(this.activeQuestionSubject.pipe(debounceTime(2000)), question => {
      if (!this.hasUserRead(question)) {
        this.projectCurrentUser.questionRefsRead.push(question.id);
        this.projectUserService.update(this.projectCurrentUser).then(() => {
          this.update.emit(question);
        });
      }
    });
  }

  get activeQuestionIndex(): number {
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

  getUnreadAnswers(question: Question): number {
    // TODO: (NW) Limit to unread answers and comments
    return question.answers.length;
  }

  checkCanChangeQuestion(newIndex: number): boolean {
    return !!this.questions[this.activeQuestionIndex + newIndex];
  }

  hasUserAnswered(question: Question): boolean {
    return question.answers.filter(answer => (answer.ownerRef = this.userService.currentUserId)).length > 0;
  }

  hasUserRead(question: Question): boolean {
    return this.projectCurrentUser.questionRefsRead
      ? this.projectCurrentUser.questionRefsRead.includes(question.id)
      : false;
  }

  nextQuestion(): void {
    this.changeQuestion(1);
  }

  previousQuestion(): void {
    this.changeQuestion(-1);
  }

  activateQuestion(question: Question): void {
    this.activeQuestion = question;
    this.changed.emit(question);
    this.activeQuestionSubject.next(question);
  }

  private changeQuestion(newDifferential: number): void {
    if (this.activeQuestion && this.checkCanChangeQuestion(newDifferential)) {
      this.activateQuestion(this.questions[this.activeQuestionIndex + newDifferential]);
    }
  }
}
