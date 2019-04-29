import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { AngularSplitModule } from 'angular-split';
import Quill, { DeltaStatic } from 'quill';
import { of } from 'rxjs';
import { deepEqual, instance, mock, when } from 'ts-mockito';

import { MapQueryResults } from 'xforge-common/json-api.service';
import { User } from 'xforge-common/models/user';
import { RealtimeOfflineStore } from 'xforge-common/realtime-offline-store';
import { UICommonModule } from 'xforge-common/ui-common.module';
import { UserService } from 'xforge-common/user.service';
import { nameof } from 'xforge-common/utils';
import { Question } from '../../core/models/question';
import { QuestionData } from '../../core/models/question-data';
import { SFProjectRef } from '../../core/models/sfdomain-model.generated';
import { SFProject } from '../../core/models/sfproject';
import { Text } from '../../core/models/text';
import { getTextDataIdStr, TextData, TextDataId } from '../../core/models/text-data';
import { TextJsonDataId } from '../../core/models/text-json-data-id';
import { TextService } from '../../core/text.service';
import { MockRealtimeDoc } from '../../shared/models/mock-realtime-doc';
import { SharedModule } from '../../shared/shared.module';
import { CheckingAnswersComponent } from './checking-answers/checking-answers.component';
import { CheckingOwnerComponent } from './checking-answers/checking-owner/checking-owner.component';
import { CheckingQuestionsComponent } from './checking-questions/checking-questions.component';
import { CheckingTextComponent } from './checking-text/checking-text.component';
import { CheckingComponent } from './checking.component';
import { FontSizeComponent } from './font-size/font-size.component';

describe('CheckingComponent', () => {
  let env: TestEnvironment;
  beforeEach(fakeAsync(() => {
    env = new TestEnvironment();
    // Need to wait for questions and text promises to finish
    env.fixture.detectChanges();
    tick(1);
    env.fixture.detectChanges();
  }));

  describe('Interface', () => {
    it('can load a project', () => {
      expect(env.projectHeading).toEqual('Project 01');
    });

    it('can navigate using next button', fakeAsync(() => {
      env.selectQuestion(1);
      env.clickButton(env.nextButton);
      tick(env.questionReadTimer);
      const nextQuestion = env.currentQuestion;
      expect(nextQuestion).toEqual(2);
    }));

    it('can navigate using previous button', fakeAsync(() => {
      env.selectQuestion(2);
      env.clickButton(env.previousButton);
      tick(env.questionReadTimer);
      const nextQuestion = env.currentQuestion;
      expect(nextQuestion).toEqual(1);
    }));

    it('check navigate buttons disable at the end of the question list', fakeAsync(() => {
      env.selectQuestion(1);
      const prev = env.previousButton;
      const next = env.nextButton;
      expect(prev.nativeElement.disabled).toBe(true);
      expect(next.nativeElement.disabled).toBe(false);
      env.selectQuestion(14);
      expect(prev.nativeElement.disabled).toBe(false);
      expect(next.nativeElement.disabled).toBe(true);
    }));
  });

  describe('Questions', () => {
    it('questions are displaying', () => {
      expect(env.questions.length).toEqual(14);
    });

    it('can select a question', fakeAsync(() => {
      const question = env.selectQuestion(1);
      expect(question.classes['mdc-list-item--activated']).toBeTruthy();
    }));

    it('question status change to read', fakeAsync(() => {
      let question = env.selectQuestion(1, false);
      expect(question.classes['question-read']).toBeFalsy();
      question = env.selectQuestion(2);
      expect(question.classes['question-read']).toBeTruthy();
    }));

    it('question status change to answered', fakeAsync(() => {
      const question = env.selectQuestion(2);
      env.answerQuestion('Answer question 2');
      expect(question.classes['question-answered']).toBeTruthy();
    }));

    it('question shows answers icon and total', fakeAsync(() => {
      const question = env.selectQuestion(2);
      env.answerQuestion('Answer question 2');
      expect(question.query(By.css('.view-answers span')).nativeElement.textContent).toEqual('1');
    }));
  });

  describe('Answers', () => {
    it('answer panel is not initiated without a selected question', () => {
      expect(env.answerPanel).toBeNull();
    });

    it('answer panel is now showing', fakeAsync(() => {
      env.selectQuestion(1);
      expect(env.answerPanel).toBeDefined();
      expect(env.answerPanel.query(By.css('.question')).nativeElement.textContent).toBe('Book 1, Q1 text');
    }));

    it('can answer a question', fakeAsync(() => {
      const question = env.selectQuestion(2);
      env.answerQuestion('Answer question 2');
      expect(env.answers.length).toEqual(1);
      expect(env.answers[0].query(By.css('.answer-text')).nativeElement.textContent).toBe('Answer question 2');
    }));

    it('can cancel answering a question', fakeAsync(() => {
      const question = env.selectQuestion(2);
      env.clickButton(env.addAnswerButton);
      expect(env.yourAnswerField).toBeDefined();
      env.clickButton(env.cancelAnswerButton);
      tick(1);
      expect(env.yourAnswerField).toBeNull();
      expect(env.addAnswerButton).toBeDefined();
    }));

    it('check answering validation', fakeAsync(() => {
      const question = env.selectQuestion(2);
      env.clickButton(env.addAnswerButton);
      env.clickButton(env.saveAnswerButton);
      tick(1);
      expect(env.yourAnswerField.classes['mdc-text-field--invalid']).toBeTruthy();
    }));

    it('can edit an answer', fakeAsync(() => {
      env.selectQuestion(2);
      env.answerQuestion('Answer question 2');
      env.clickButton(env.answers[0].query(By.css('.answer-edit')));
      env.setTextFieldValue(env.yourAnswerField, 'Edited question 2 answer');
      env.clickButton(env.saveAnswerButton);
      tick(1);
      env.fixture.detectChanges();
      expect(env.answers[0].query(By.css('.answer-text')).nativeElement.textContent).toBe('Edited question 2 answer');
    }));

    it('can delete an answer', fakeAsync(() => {
      const question = env.selectQuestion(2);
      env.answerQuestion('Answer question 2');
      expect(env.answers.length).toEqual(1);
      env.clickButton(env.answers[0].query(By.css('.answer-delete')));
      tick(1);
      env.fixture.detectChanges();
      expect(env.answers.length).toEqual(0);
    }));

    it('answers reset when changing questions', fakeAsync(() => {
      env.selectQuestion(2);
      env.answerQuestion('Answer question 2');
      expect(env.answers.length).toEqual(1);
      env.selectQuestion(1);
      expect(env.answers.length).toEqual(0);
    }));
  });

  describe('Text', () => {
    it('can increase and decrease font size', fakeAsync(() => {
      const editor = env.quillEditor;
      expect(editor.style.fontSize).toBe('1rem');
      env.clickButton(env.increaseFontSizeButton);
      expect(editor.style.fontSize).toBe('1.1rem');
      env.clickButton(env.decreaseFontSizeButton);
      expect(editor.style.fontSize).toBe('1rem');
    }));
  });
});

class TestEnvironment {
  component: CheckingComponent;
  fixture: ComponentFixture<CheckingComponent>;
  questionReadTimer: number = 2000;

  mockedTextService: TextService;
  mockedRealtimeOfflineStore: RealtimeOfflineStore;
  mockedUserService: UserService;
  testUser = new User({
    id: 'user01',
    email: 'user01@example.com',
    name: 'User 01',
    password: 'password01',
    role: 'user',
    active: true,
    dateCreated: '2019-01-01T12:00:00.000Z'
  });

  constructor() {
    this.mockedTextService = mock(TextService);
    this.mockedRealtimeOfflineStore = mock(RealtimeOfflineStore);
    this.mockedUserService = mock(UserService);

    TestBed.configureTestingModule({
      declarations: [
        CheckingComponent,
        FontSizeComponent,
        CheckingTextComponent,
        CheckingQuestionsComponent,
        CheckingAnswersComponent,
        CheckingOwnerComponent
      ],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [UICommonModule, AngularSplitModule.forRoot(), SharedModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { params: of({ textId: 'text01' }) }
        },
        { provide: TextService, useFactory: () => instance(this.mockedTextService) },
        { provide: UserService, useFactory: () => instance(this.mockedUserService) }
      ]
    });
    this.setupProjectData();
    this.fixture = TestBed.createComponent(CheckingComponent);
    this.component = this.fixture.componentInstance;
  }

  get answerPanel(): DebugElement {
    return this.fixture.debugElement.query(By.css('#answer-panel'));
  }

  get answers(): DebugElement[] {
    return this.fixture.debugElement.queryAll(By.css('#answer-panel .answers-container .answer'));
  }

  get addAnswerButton(): DebugElement {
    return this.fixture.debugElement.query(By.css('#add-answer'));
  }

  get saveAnswerButton(): DebugElement {
    return this.fixture.debugElement.query(By.css('#save-answer'));
  }

  get cancelAnswerButton(): DebugElement {
    return this.fixture.debugElement.query(By.css('#cancel-answer'));
  }

  get yourAnswerField(): DebugElement {
    return this.fixture.debugElement.query(By.css('mdc-text-field[formControlName="answerText"]'));
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

  get quillEditor(): HTMLElement {
    return <HTMLElement>document.getElementsByClassName('ql-container')[0];
  }

  get increaseFontSizeButton(): DebugElement {
    return this.fixture.debugElement.query(By.css('app-font-size button:last-child'));
  }

  get decreaseFontSizeButton(): DebugElement {
    return this.fixture.debugElement.query(By.css('app-font-size button:first-child'));
  }

  answerQuestion(answer: string): void {
    this.clickButton(this.addAnswerButton);
    this.setTextFieldValue(this.yourAnswerField, answer);
    this.clickButton(this.saveAnswerButton);
    tick(1);
    this.fixture.detectChanges();
  }

  clickButton(button: DebugElement): void {
    button.nativeElement.click();
    this.fixture.detectChanges();
  }

  selectQuestion(questionNumber: number, includeReadTimer: boolean = true): DebugElement {
    const question = this.fixture.debugElement.query(
      By.css('#questions-panel .mdc-list-item:nth-child(' + questionNumber + ')')
    );
    question.nativeElement.click();
    tick(1);
    this.fixture.detectChanges();
    if (includeReadTimer) {
      tick(this.questionReadTimer);
      this.fixture.detectChanges();
    }
    return question;
  }

  setTextFieldValue(textField: DebugElement, value: string): void {
    const input = textField.query(By.css('input'));
    const inputElem = input.nativeElement as HTMLInputElement;
    inputElem.value = value;
    inputElem.dispatchEvent(new Event('input'));
    this.fixture.detectChanges();
    tick();
  }

  private setupProjectData(): void {
    when(this.mockedTextService.get('text01', deepEqual([[nameof<Text>('project')]]))).thenReturn(
      of(
        new MapQueryResults<Text>(
          new Text({
            id: 'text01',
            bookId: 'JHN',
            name: 'John',
            chapters: [{ number: 1 }],
            project: new SFProjectRef('project01')
          }),
          undefined,
          [
            new SFProject({
              id: 'project01',
              projectName: 'Project 01'
            })
          ]
        )
      )
    );
    when(this.mockedTextService.getTextData(deepEqual(new TextDataId('text01', 1)))).thenResolve(this.createTextData());
    const text1_1id = new TextJsonDataId('text01', 1);
    const questionData = [];
    for (let questionNumber = 1; questionNumber <= 14; questionNumber++) {
      questionData.push({
        id: 'q' + questionNumber + 'Id',
        ownerRef: undefined,
        projectRef: undefined,
        text: 'Book 1, Q' + questionNumber + ' text',
        scriptureStart: { book: 'JHN', chapter: '1', verse: '1', versification: 'English' },
        scriptureEnd: { book: 'JHN', chapter: '1', verse: '2', versification: 'English' },
        answers: []
      });
    }
    when(this.mockedTextService.getQuestionData(deepEqual(text1_1id))).thenResolve(
      this.createQuestionData(text1_1id, questionData)
    );
    when(this.mockedUserService.currentUserId).thenReturn('user01');
    when(this.mockedUserService.onlineGet('user01')).thenReturn(of(new MapQueryResults(this.testUser)));
  }

  private createQuestionData(id: TextJsonDataId, data: Question[]): QuestionData {
    const doc = new MockRealtimeDoc<Question[]>('ot-json0', id.toString(), data);
    return new QuestionData(doc, instance(this.mockedRealtimeOfflineStore));
  }

  private createTextData(): TextData {
    const mockedRealtimeOfflineStore = mock(RealtimeOfflineStore);
    const delta = new Delta();
    delta.insert({ chapter: 1 }, { chapter: { style: 'c' } });
    delta.insert({ verse: 1 }, { verse: { style: 'v' } });
    delta.insert('target: chapter 1, verse 1.', { segment: 'verse_1_1' });
    delta.insert({ verse: 2 }, { verse: { style: 'v' } });
    delta.insert({ blank: 'normal' }, { segment: 'verse_1_2' });
    delta.insert('\n', { para: { style: 'p' } });
    delta.insert({ verse: 3 }, { verse: { style: 'v' } });
    delta.insert(`target: chapter 1, verse 3.`, { segment: 'verse_1_3' });
    delta.insert({ verse: 4 }, { verse: { style: 'v' } });
    delta.insert(`target: chapter 1, verse 4.`, { segment: 'verse_1_4' });
    delta.insert('\n', { para: { style: 'p' } });
    delta.insert({ blank: 'initial' }, { segment: 'verse_1_4/p_1' });
    delta.insert({ verse: 5 }, { verse: { style: 'v' } });
    delta.insert(`target: chapter 1, `, { segment: 'verse_1_5' });
    delta.insert('\n', { para: { style: 'p' } });
    const doc = new MockRealtimeDoc<DeltaStatic>('rich-text', getTextDataIdStr('text01', 1, 'target'), delta);
    return new TextData(doc, instance(mockedRealtimeOfflineStore));
  }
}

const Delta: new () => DeltaStatic = Quill.import('delta');
