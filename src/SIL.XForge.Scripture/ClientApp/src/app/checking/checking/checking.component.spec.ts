import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { OAuthService } from 'angular-oauth2-oidc';
import { AngularSplitModule } from 'angular-split';
import { QuillModule } from 'ngx-quill';
import Quill, { DeltaStatic } from 'quill';
import { of } from 'rxjs';
import { deepEqual, instance, mock, when } from 'ts-mockito';

import { JsonApiService, MapQueryResults } from 'xforge-common/json-api.service';
import { DomainModel } from 'xforge-common/models/domain-model';
import { RealtimeOfflineStore } from 'xforge-common/realtime-offline-store';
import { UICommonModule } from 'xforge-common/ui-common.module';
import { nameof } from 'xforge-common/utils';
import { XForgeCommonModule } from 'xforge-common/xforge-common.module';
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
    tick();
    env.fixture.detectChanges();
  }));

  describe('Interface', () => {
    it('can load a project', () => {
      expect(env.projectHeading).toEqual('Project 01');
    });

    it('can navigate using next button', () => {
      env.selectQuestion(1);
      const next = env.nextButton;
      next.nativeElement.click();
      env.fixture.detectChanges();
      const nextQuestion = env.currentQuestion;
      expect(nextQuestion).toEqual(2);
    });

    it('can navigate using previous button', () => {
      env.selectQuestion(2);
      const prev = env.previousButton;
      prev.nativeElement.click();
      env.fixture.detectChanges();
      const nextQuestion = env.currentQuestion;
      expect(nextQuestion).toEqual(1);
    });

    it('check navigate buttons disable at the end of the question list', () => {
      env.selectQuestion(1);
      const prev = env.previousButton;
      const next = env.nextButton;
      expect(prev.nativeElement.disabled).toBe(true);
      expect(next.nativeElement.disabled).toBe(false);
      env.selectQuestion(14);
      expect(prev.nativeElement.disabled).toBe(false);
      expect(next.nativeElement.disabled).toBe(true);
    });
  });

  describe('Questions', () => {
    it('questions are displaying', () => {
      expect(env.questions.length).toEqual(14);
    });

    it('can select a question', () => {
      const question = env.selectQuestion(1);
      expect(question.classes['mdc-list-item--activated']).toBeTruthy();
    });

    it('question status change to read', fakeAsync(() => {
      const question = env.selectQuestion(2);
      // Wait for the 1 second time out before the state of the question changes
      tick(2000);
      env.fixture.detectChanges();
      expect(question.classes['question-read']).toBeTruthy();
    }));

    it('question status change to answered', fakeAsync(() => {
      env.selectQuestion(2);
      // Wait for the 1 second time out before the state of the question changes
      tick(2000);
      env.selectQuestion(1);
      const question = env.selectQuestion(2);
      tick(2000);
      env.fixture.detectChanges();
      expect(question.classes['question-answered']).toBeTruthy();
    }));

    it('question shows answers icon and total', fakeAsync(() => {
      env.selectQuestion(2);
      // Wait for the 1 second time out before the state of the question changes
      tick(2000);
      env.selectQuestion(1);
      const question = env.selectQuestion(2);
      tick(2000);
      env.fixture.detectChanges();
      expect(question.query(By.css('.view-answers span')).nativeElement.textContent).toEqual('1');
    }));
  });

  describe('Answers', () => {
    it('answer panel is not initiated without a selected question', () => {
      expect(env.answerPanel).toBeNull();
    });

    it('answer panel is now showing', () => {
      env.selectQuestion(1);
      expect(env.answerPanel).toBeDefined();
      expect(env.answerPanel.query(By.css('.question')).nativeElement.textContent).toBe('Book 1, Q1 text');
    });
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

  mockedRouter: Router;
  mockedTextService: TextService;
  mockedDomainModel: DomainModel;
  mockedOAuthService: OAuthService;
  mockedRealtimeOfflineStore: RealtimeOfflineStore;
  constructor() {
    this.mockedRouter = mock(Router);
    this.mockedTextService = mock(TextService);
    this.mockedDomainModel = mock(DomainModel);
    this.mockedOAuthService = mock(OAuthService);
    this.mockedRealtimeOfflineStore = mock(RealtimeOfflineStore);

    TestBed.configureTestingModule({
      declarations: [
        CheckingComponent,
        FontSizeComponent,
        CheckingTextComponent,
        CheckingQuestionsComponent,
        CheckingAnswersComponent
      ],
      imports: [
        UICommonModule,
        HttpClientTestingModule,
        QuillModule,
        XForgeCommonModule,
        AngularSplitModule.forRoot(),
        SharedModule
      ],
      providers: [
        { provide: Router, useFactory: () => instance(this.mockedRouter) },
        {
          provide: ActivatedRoute,
          useValue: { params: of({ textId: 'text01' }) }
        },
        { provide: TextService, useFactory: () => instance(this.mockedTextService) },
        JsonApiService,
        { provide: DomainModel, useFactory: () => instance(this.mockedDomainModel) },
        { provide: OAuthService, useFactory: () => instance(this.mockedOAuthService) }
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

  get quillEditor(): HTMLElement {
    return <HTMLElement>document.getElementsByClassName('ql-container')[0];
  }

  get increaseFontSizeButton(): DebugElement {
    return this.fixture.debugElement.query(By.css('app-font-size button:last-child'));
  }

  get decreaseFontSizeButton(): DebugElement {
    return this.fixture.debugElement.query(By.css('app-font-size button:first-child'));
  }

  waitForQuestions(): void {
    this.fixture.detectChanges();
    tick();
    this.fixture.detectChanges();
  }

  clickButton(button: DebugElement): void {
    button.nativeElement.click();
    this.fixture.detectChanges();
  }

  selectQuestion(questionNumber: number): DebugElement {
    const question = this.fixture.debugElement.query(
      By.css('#questions-panel .mdc-list-item:nth-child(' + questionNumber + ')')
    );
    question.nativeElement.click();
    this.fixture.detectChanges();
    return question;
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
