import { DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { deepEqual, instance, mock, when } from 'ts-mockito';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { OAuthService } from 'angular-oauth2-oidc';
import { QuillModule } from 'ngx-quill';
import Quill, { DeltaStatic } from 'quill';
import { Snapshot } from 'sharedb/lib/client';
import { JsonApiService, MapQueryResults } from 'xforge-common/json-api.service';
import { DomainModel } from 'xforge-common/models/domain-model';
import { RealtimeDoc } from 'xforge-common/realtime-doc';
import { RealtimeOfflineStore } from 'xforge-common/realtime-offline-store';
import { UICommonModule } from 'xforge-common/ui-common.module';
import { nameof } from 'xforge-common/utils';
import { SFProjectRef } from '../../core/models/sfdomain-model.generated';
import { SFProject } from '../../core/models/sfproject';
import { Text } from '../../core/models/text';
import { TextData } from '../../core/models/text-data';
import { TextService, TextType } from '../../core/text.service';
import { TextComponent } from '../../shared/text/text.component';
import { CheckingQuestionsComponent } from './checking-questions/checking-questions.component';
import { CheckingTextComponent } from './checking-text/checking-text.component';
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
      question = env.selectQuestion(14);
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

  describe('Text', () => {
    it('can increase and decrease font size', done => {
      env.component.scripturePanel.textComponent.loaded.subscribe(() => {
        const editor = env.quillEditor;
        expect(editor.style.fontSize).toBe('1rem');
        env.clickButton(env.increaseFontSizeButton);
        expect(editor.style.fontSize).toBe('1.1rem');
        env.clickButton(env.decreaseFontSizeButton);
        expect(editor.style.fontSize).toBe('1rem');
        done();
      });
    });
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
        TextComponent
      ],
      imports: [UICommonModule, HttpClientTestingModule, QuillModule],
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
    return this.fixture.debugElement.query(By.css('app-font-size button[icon="add"]'));
  }

  get decreaseFontSizeButton(): DebugElement {
    return this.fixture.debugElement.query(By.css('app-font-size button[icon="remove"]'));
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
    when(
      this.mockedTextService.connect(
        'text01',
        'source'
      )
    ).thenResolve(this.createTextData('source'));
    when(
      this.mockedTextService.connect(
        'text01',
        'target'
      )
    ).thenResolve(this.createTextData('target'));
  }

  private createTextData(textType: TextType): TextData {
    const mockedRealtimeOfflineStore = mock(RealtimeOfflineStore);
    const delta = new Delta();
    delta.insert({ chapter: 1 }, { chapter: { style: 'c' } });
    delta.insert({ verse: 1 }, { verse: { style: 'v' } });
    delta.insert(`${textType}: chapter 1, verse 1.`, { segment: 'verse_1_1' });
    delta.insert({ verse: 2 }, { verse: { style: 'v' } });
    switch (textType) {
      case 'source':
        delta.insert(`${textType}: chapter 1, verse 2.`, { segment: 'verse_1_2' });
        break;
      case 'target':
        delta.insert('\u2003\u2003', { segment: 'verse_1_2' });
        break;
    }
    delta.insert('\n', { para: { style: 'p' } });
    delta.insert({ chapter: 2 }, { chapter: { style: 'c' } });
    delta.insert({ verse: 1 }, { verse: { style: 'v' } });
    delta.insert(`${textType}: chapter 2, verse 1.`, { segment: 'verse_2_1' });
    delta.insert({ verse: 2 }, { verse: { style: 'v' } });
    delta.insert(`${textType}: chapter 2, verse 2.`, { segment: 'verse_2_2' });
    delta.insert('\n', { para: { style: 'p' } });
    delta.insert('\u00a0', { segment: 'verse_2_2/p_1' });
    delta.insert({ verse: 3 }, { verse: { style: 'v' } });
    switch (textType) {
      case 'source':
        delta.insert(`${textType}: chapter 2, verse 3.`, { segment: 'verse_2_3' });
        break;
      case 'target':
        delta.insert(`${textType}: chapter 2, `, { segment: 'verse_2_3' });
        break;
    }
    delta.insert('\n', { para: { style: 'p' } });
    delta.insert('\n');
    const doc = new MockRealtimeDoc('text01:' + textType, delta);
    return new TextData(doc, instance(mockedRealtimeOfflineStore));
  }
}

const Delta: new () => DeltaStatic = Quill.import('delta');

class MockRealtimeDoc implements RealtimeDoc {
  readonly version: number = 1;
  readonly type: string = 'rich-text';
  readonly pendingOps: any[] = [];

  constructor(public readonly id: string, public readonly data: DeltaStatic) {}

  idle(): Observable<void> {
    return of();
  }

  fetch(): Promise<void> {
    return Promise.resolve();
  }

  ingestSnapshot(_snapshot: Snapshot): Promise<void> {
    return Promise.resolve();
  }

  subscribe(): Promise<void> {
    return Promise.resolve();
  }

  submitOp(_data: any, _source?: any): Promise<void> {
    return Promise.resolve();
  }

  remoteChanges(): Observable<any> {
    return of();
  }

  destroy(): Promise<void> {
    return Promise.resolve();
  }
}
