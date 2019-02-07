import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Project } from 'xforge-common/models/project';
import { Resource } from 'xforge-common/models/resource';
import { ProjectService } from 'xforge-common/project.service';
import { SubscriptionDisposable } from 'xforge-common/subscription-disposable';

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
  selector: 'app-projects',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss']
})
export class ProjectComponent extends SubscriptionDisposable {
  project: Project;
  questions: Question[];
  activeQuestion: Question;

  constructor(private activatedRoute: ActivatedRoute, private projectService: ProjectService, private router: Router) {
    super();
    this.subscribe(
      this.activatedRoute.params.pipe(
        switchMap(params => {
          return projectService.get(params['id']);
        })
      ),
      projectData => {
        if (projectData) {
          this.project = projectData.results;
          this.loadQuestions();
        } else {
          this.goHome();
        }
      }
    );
  }

  goHome() {
    this.router.navigateByUrl('/home');
  }

  loadQuestions() {
    const questions = [];
    questions.push(
      new Question({
        id: 'q1',
        title: 'Question One'
      }),
      new Question({
        id: 'q2',
        title: 'Question Two'
      }),
      new Question({
        id: 'q3',
        title: 'Question Three'
      })
    );
    this.questions = questions;
  }

  totalQuestions() {
    return this.questions.length;
  }

  activateQuestion(question: Question) {
    this.activeQuestion = question;

    // Only mark as read if it has been viewed for a set period of time and not an accidental click
    const readTimer = this.subscribe(timer(1000), () => {
      if (this.activeQuestion.id === question.id) {
        question.markAsRead();
        readTimer.unsubscribe();
      }
    });
  }
}
