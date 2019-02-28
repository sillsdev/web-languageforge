import { DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { instance, mock, when } from 'ts-mockito';

import { MapQueryResults } from 'xforge-common/json-api.service';
import { ProjectService } from 'xforge-common/project.service';
import { UICommonModule } from 'xforge-common/ui-common.module';
import { SFProject } from '../../core/models/sfproject';
import { CheckingComponent } from './checking.component';
import { FontSizeComponent } from './font-size/font-size.component';

describe('CheckingComponent', () => {
  let env: TestEnvironment;
  beforeEach(() => {
    env = new TestEnvironment();
    env.fixture.detectChanges();
  });

  describe('Interface', () => {
    it('can load a project', () => {
      expect(env.projectHeading).toEqual('Project 01');
    });
    it('can navigate using next button', () => {
      const question = env.selectQuestion(1);
      const next = env.nextButton;
      next.nativeElement.click();
      env.fixture.detectChanges();
      const nextQuestion = env.currentQuestion;
      expect(nextQuestion).toEqual(2);
    });

    it('can navigate using previous button', () => {
      const question = env.selectQuestion(2);
      const prev = env.previousButton;
      prev.nativeElement.click();
      env.fixture.detectChanges();
      const nextQuestion = env.currentQuestion;
      expect(nextQuestion).toEqual(1);
    });

    it('check navigate buttons disable at the end of the question list', () => {
      let question = env.selectQuestion(1);
      const prev = env.previousButton;
      const next = env.nextButton;
      expect(prev.nativeElement.disabled).toBe(true);
      expect(next.nativeElement.disabled).toBe(false);
      question = env.selectQuestion(3);
      expect(prev.nativeElement.disabled).toBe(false);
      expect(next.nativeElement.disabled).toBe(true);
    });
  });

  describe('Questions', () => {
    it('questions are displaying', () => {
      expect(env.questions.length).toEqual(3);
    });

    it('can select a question', () => {
      const question = env.selectQuestion(1);
      expect(question.classes['mdc-list-item--activated']).toBeTruthy();
    });

    it('question status change to read', fakeAsync(() => {
      const question = env.selectQuestion(2);
      // Wait for the 1 second time out before the state of the question changes
      tick(1000);
      env.fixture.detectChanges();
      expect(question.classes['question-read']).toBeTruthy();
    }));

    it('question status change to answered', fakeAsync(() => {
      let question = env.selectQuestion(2);
      // Wait for the 1 second time out before the state of the question changes
      tick(1000);
      question = env.selectQuestion(1);
      question = env.selectQuestion(2);
      tick(1000);
      env.fixture.detectChanges();
      expect(question.classes['question-answered']).toBeTruthy();
    }));

    it('question shows answers icon and total', fakeAsync(() => {
      let question = env.selectQuestion(2);
      // Wait for the 1 second time out before the state of the question changes
      tick(1000);
      question = env.selectQuestion(1);
      question = env.selectQuestion(2);
      tick(1000);
      env.fixture.detectChanges();
      expect(question.query(By.css('.view-answers span')).nativeElement.textContent).toEqual('1');
    }));
  });

  describe('Answers', () => {
    it('answer panel is not initiated without a selected question', () => {
      expect(env.answerPanel).toBeNull();
    });

    it('answer panel is now showing', () => {
      const question = env.selectQuestion(1);
      expect(env.answerPanel).toBeDefined();
    });
  });
});

class TestEnvironment {
  component: CheckingComponent;
  fixture: ComponentFixture<CheckingComponent>;

  mockedRouter: Router;
  mockedProjectService: ProjectService;
  constructor() {
    this.mockedRouter = mock(Router);
    this.mockedProjectService = mock(ProjectService);

    TestBed.configureTestingModule({
      declarations: [CheckingComponent, FontSizeComponent],
      imports: [UICommonModule],
      providers: [
        { provide: Router, useFactory: () => instance(this.mockedRouter) },
        {
          provide: ActivatedRoute,
          useValue: { params: of({ projectId: 'project01' }) }
        },
        { provide: ProjectService, useFactory: () => instance(this.mockedProjectService) }
      ]
    });
    this.setupProjectData();
    this.fixture = TestBed.createComponent(CheckingComponent);
    this.component = this.fixture.componentInstance;
  }

  get answerPanel(): DebugElement {
    return this.fixture.debugElement.query(By.css('#answer-panel'));
  }

  get currentQuestion(): number {
    const questions = this.questions;
    for (const questionNumber in questions) {
      if (
        questions[questionNumber].classes.hasOwnProperty('mdc-list-item--activated') &&
        questions[questionNumber].classes['mdc-list-item--activated'] === true
      ) {
        // Need to add one as css selector nth-child starts index from 1 instead of zero
        return Number(questionNumber) + 1;
      }
    }
    return -1;
  }

  get nextButton(): DebugElement {
    return this.fixture.debugElement.query(By.css('#project-navigation .next-question'));
  }

  get previousButton(): DebugElement {
    return this.fixture.debugElement.query(By.css('#project-navigation .prev-question'));
  }

  get projectHeading(): string {
    return this.fixture.debugElement.query(By.css('h1')).nativeElement.textContent;
  }

  get questions(): DebugElement[] {
    return this.fixture.debugElement.queryAll(By.css('#questions-panel .mdc-list-item'));
  }

  selectQuestion(questionNumber: number): DebugElement {
    const question = this.fixture.debugElement.query(
      By.css('#questions-panel .mdc-list-item:nth-child(' + questionNumber + ')')
    );
    question.nativeElement.click();
    this.fixture.detectChanges();
    return question;
  }

  setupProjectData(): void {
    when(this.mockedProjectService.get('project01')).thenReturn(
      of(
        new MapQueryResults<SFProject>(
          new SFProject({
            id: 'project01',
            projectName: 'Project 01'
          })
        )
      )
    );
  }
}
