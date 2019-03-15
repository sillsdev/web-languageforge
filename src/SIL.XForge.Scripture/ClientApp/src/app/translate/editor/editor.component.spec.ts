import { MdcSlider } from '@angular-mdc/web';
import { DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Params } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import {
  createRange,
  InteractiveTranslationSession,
  RemoteTranslationEngine,
  TranslationResult,
  TranslationResultBuilder,
  WordAlignmentMatrix
} from '@sillsdev/machine';
import Quill, { DeltaStatic } from 'quill';
import { BehaviorSubject, of } from 'rxjs';
import { anything, deepEqual, instance, mock, resetCalls, verify, when } from 'ts-mockito';
import { MapQueryResults } from 'xforge-common/json-api.service';
import { UserRef } from 'xforge-common/models/user';
import { NoticeService } from 'xforge-common/notice.service';
import { RealtimeOfflineStore } from 'xforge-common/realtime-offline-store';
import { UICommonModule } from 'xforge-common/ui-common.module';
import { UserService } from 'xforge-common/user.service';
import { nameof } from 'xforge-common/utils';
import { SFProject, SFProjectRef } from '../../core/models/sfproject';
import { SFProjectUser, SFProjectUserRef, TranslateProjectUserConfig } from '../../core/models/sfproject-user';
import { Text } from '../../core/models/text';
import { TextData } from '../../core/models/text-data';
import { SFProjectUserService } from '../../core/sfproject-user.service';
import { SFProjectService } from '../../core/sfproject.service';
import { TextService, TextType } from '../../core/text.service';
import { MockRealtimeDoc } from '../../shared/models/mock-realtime-doc';
import { SharedModule } from '../../shared/shared.module';
import { EditorComponent } from './editor.component';
import { SuggestionComponent } from './suggestion.component';

describe('EditorComponent', () => {
  it('start with no previous selection', fakeAsync(() => {
    const env = new TestEnvironment();
    env.setTranslateConfig({});
    env.waitForSuggestion();
    expect(env.component.sourceLabel).toEqual('Book 1 (Source)');
    expect(env.component.targetLabel).toEqual('Book 1 (Target)');
    expect(env.component.target.segmentRef).toEqual('');
    const selection = env.component.target.editor.getSelection();
    expect(selection).toBeNull();
  }));

  it('start with previously selected segment', fakeAsync(() => {
    const env = new TestEnvironment();
    env.setTranslateConfig({ selectedTextRef: 'text01', selectedSegment: 'verse_1_1' });
    env.waitForSuggestion();
    expect(env.component.target.segmentRef).toEqual('verse_1_1');
    const selection = env.component.target.editor.getSelection();
    expect(selection.index).toEqual(29);
    expect(selection.length).toEqual(0);
    verify(env.mockedRemoteTranslationEngine.translateInteractively(1, anything())).once();
    expect(env.component.showSuggestion).toBeFalsy();
  }));

  it('select non-blank segment', fakeAsync(() => {
    const env = new TestEnvironment();
    env.setTranslateConfig({ selectedTextRef: 'text01', selectedSegment: 'verse_1_1' });
    env.waitForSuggestion();
    expect(env.component.target.segmentRef).toEqual('verse_1_1');
    verify(env.mockedRemoteTranslationEngine.translateInteractively(1, anything())).once();
    expect(env.component.showSuggestion).toBeFalsy();

    resetCalls(env.mockedRemoteTranslationEngine);
    const range = env.component.target.getSegmentRange('verse_2_1');
    env.component.target.editor.setSelection(range.index, 0, 'user');
    env.waitForSuggestion();
    expect(env.component.target.segmentRef).toEqual('verse_2_1');
    const selection = env.component.target.editor.getSelection();
    expect(selection.index).toEqual(34);
    expect(selection.length).toEqual(0);
    expect(env.component.translateUserConfig.selectedSegment).toEqual('verse_2_1');
    verify(env.mockedSFProjectUserService.update(anything())).once();
    verify(env.mockedRemoteTranslationEngine.translateInteractively(1, anything())).once();
    expect(env.component.showSuggestion).toBeFalsy();
  }));

  it('select blank segment', fakeAsync(() => {
    const env = new TestEnvironment();
    env.setTranslateConfig({ selectedTextRef: 'text01', selectedSegment: 'verse_1_1' });
    env.waitForSuggestion();
    expect(env.component.target.segmentRef).toEqual('verse_1_1');

    resetCalls(env.mockedRemoteTranslationEngine);
    const range = env.component.target.getSegmentRange('verse_1_2');
    env.component.target.editor.setSelection(range.index, 0, 'user');
    env.waitForSuggestion();
    expect(env.component.target.segmentRef).toEqual('verse_1_2');
    const selection = env.component.target.editor.getSelection();
    expect(selection.index).toEqual(30);
    expect(selection.length).toEqual(1);
    expect(env.component.translateUserConfig.selectedSegment).toEqual('verse_1_2');
    verify(env.mockedSFProjectUserService.update(anything())).once();
    verify(env.mockedRemoteTranslationEngine.translateInteractively(1, anything())).once();
    expect(env.component.showSuggestion).toBeTruthy();
    expect(env.component.suggestionWords).toEqual(['target']);
  }));

  it('select not at end of incomplete segment', fakeAsync(() => {
    const env = new TestEnvironment();
    env.setTranslateConfig({});
    env.waitForSuggestion();
    expect(env.component.target.segmentRef).toEqual('');

    const range = env.component.target.getSegmentRange('verse_2_3');
    env.component.target.editor.setSelection(range.index, 0, 'user');
    env.waitForSuggestion();
    expect(env.component.target.segmentRef).toEqual('verse_2_3');
    verify(env.mockedRemoteTranslationEngine.translateInteractively(1, anything())).once();
    expect(env.component.showSuggestion).toBeFalsy();
  }));

  it('select at end of incomplete segment', fakeAsync(() => {
    const env = new TestEnvironment();
    env.setTranslateConfig({});
    env.waitForSuggestion();
    expect(env.component.target.segmentRef).toEqual('');

    const range = env.component.target.getSegmentRange('verse_2_3');
    env.component.target.editor.setSelection(range.index + range.length, 0, 'user');
    env.waitForSuggestion();
    expect(env.component.target.segmentRef).toEqual('verse_2_3');
    verify(env.mockedRemoteTranslationEngine.translateInteractively(1, anything())).once();
    expect(env.component.showSuggestion).toBeTruthy();
    expect(env.component.suggestionWords).toEqual(['verse', '3']);
  }));

  it('insert suggestion in non-blank segment', fakeAsync(() => {
    const env = new TestEnvironment();
    env.setTranslateConfig({ selectedTextRef: 'text01', selectedSegment: 'verse_2_3' });
    env.waitForSuggestion();
    expect(env.component.target.segmentRef).toEqual('verse_2_3');
    expect(env.component.showSuggestion).toBeTruthy();

    env.insertSuggestion();
    expect(env.component.target.segmentText).toEqual('target: chapter 2, verse 3');
    expect(env.component.showSuggestion).toBeFalsy();
  }));

  it('insert space when typing character after inserting a suggestion', fakeAsync(() => {
    const env = new TestEnvironment();
    env.setTranslateConfig({ selectedTextRef: 'text01', selectedSegment: 'verse_2_3' });
    env.waitForSuggestion();
    expect(env.component.target.segmentRef).toEqual('verse_2_3');
    expect(env.component.showSuggestion).toBeTruthy();

    env.insertSuggestion(1);
    expect(env.component.target.segmentText).toEqual('target: chapter 2, verse');
    expect(env.component.showSuggestion).toBeTruthy();

    let selection = env.component.target.editor.getSelection();
    const selectionIndex = selection.index;
    env.component.target.editor.insertText(selectionIndex, '3', 'user');
    env.component.target.editor.setSelection(selectionIndex + 1, 0, 'user');
    env.waitForSuggestion();
    expect(env.component.target.segmentText).toEqual('target: chapter 2, verse 3');
    expect(env.component.showSuggestion).toBeFalsy();
    selection = env.component.target.editor.getSelection();
    expect(selection.index).toEqual(selectionIndex + 2);
    expect(selection.length).toEqual(0);
  }));

  it('insert space when inserting a suggestion after inserting a previous suggestion', fakeAsync(() => {
    const env = new TestEnvironment();
    env.setTranslateConfig({ selectedTextRef: 'text01', selectedSegment: 'verse_2_3' });
    env.waitForSuggestion();
    expect(env.component.target.segmentRef).toEqual('verse_2_3');
    expect(env.component.showSuggestion).toBeTruthy();

    env.insertSuggestion(1);
    expect(env.component.target.segmentText).toEqual('target: chapter 2, verse');
    expect(env.component.showSuggestion).toBeTruthy();

    let selection = env.component.target.editor.getSelection();
    const selectionIndex = selection.index;
    env.insertSuggestion(1);
    expect(env.component.target.segmentText).toEqual('target: chapter 2, verse 3');
    expect(env.component.showSuggestion).toBeFalsy();
    selection = env.component.target.editor.getSelection();
    expect(selection.index).toEqual(selectionIndex + 2);
    expect(selection.length).toEqual(0);
  }));

  it('do not insert space when typing punctuation after inserting a suggestion', fakeAsync(() => {
    const env = new TestEnvironment();
    env.setTranslateConfig({ selectedTextRef: 'text01', selectedSegment: 'verse_2_3' });
    env.waitForSuggestion();
    expect(env.component.target.segmentRef).toEqual('verse_2_3');
    expect(env.component.showSuggestion).toBeTruthy();

    env.insertSuggestion(1);
    expect(env.component.target.segmentText).toEqual('target: chapter 2, verse');
    expect(env.component.showSuggestion).toBeTruthy();

    let selection = env.component.target.editor.getSelection();
    const selectionIndex = selection.index;
    env.component.target.editor.insertText(selectionIndex, '.', 'user');
    env.component.target.editor.setSelection(selectionIndex + 1, 0, 'user');
    env.waitForSuggestion();
    expect(env.component.target.segmentText).toEqual('target: chapter 2, verse.');
    expect(env.component.showSuggestion).toBeFalsy();
    selection = env.component.target.editor.getSelection();
    expect(selection.index).toEqual(selectionIndex + 1);
    expect(selection.length).toEqual(0);
  }));

  it('train a modified segment after selecting a different segment', fakeAsync(() => {
    const env = new TestEnvironment();
    env.setTranslateConfig({ selectedTextRef: 'text01', selectedSegment: 'verse_2_3' });
    env.waitForSuggestion();
    expect(env.component.target.segmentRef).toEqual('verse_2_3');
    expect(env.component.showSuggestion).toBeTruthy();

    env.insertSuggestion();
    expect(env.component.target.segmentText).toEqual('target: chapter 2, verse 3');

    const range = env.component.target.getSegmentRange('verse_1_1');
    env.component.target.editor.setSelection(range.index, 0, 'user');
    env.waitForSuggestion();
    expect(env.component.target.segmentRef).toEqual('verse_1_1');
    expect(env.lastApprovedPrefix).toEqual(['target', ':', 'chapter', '2', ',', 'verse', '3']);
  }));

  it('do not train an unmodified segment after selecting a different segment', fakeAsync(() => {
    const env = new TestEnvironment();
    env.setTranslateConfig({ selectedTextRef: 'text01', selectedSegment: 'verse_2_3' });
    env.waitForSuggestion();
    expect(env.component.target.segmentRef).toEqual('verse_2_3');
    expect(env.component.showSuggestion).toBeTruthy();

    env.insertSuggestion();
    expect(env.component.target.segmentText).toEqual('target: chapter 2, verse 3');

    const selection = env.component.target.editor.getSelection();
    env.component.target.editor.deleteText(selection.index - 7, 7, 'user');
    env.waitForSuggestion();
    expect(env.component.target.segmentText).toEqual('target: chapter 2, ');

    const range = env.component.target.getSegmentRange('verse_1_1');
    env.component.target.editor.setSelection(range.index, 0, 'user');
    env.waitForSuggestion();
    expect(env.component.target.segmentRef).toEqual('verse_1_1');
    expect(env.lastApprovedPrefix).toEqual([]);
  }));

  it('change texts', fakeAsync(() => {
    const env = new TestEnvironment();
    env.setTranslateConfig({ selectedTextRef: 'text01', selectedSegment: 'verse_1_1' });
    env.waitForSuggestion();
    expect(env.component.target.segmentRef).toEqual('verse_1_1');
    verify(env.mockedRemoteTranslationEngine.translateInteractively(1, anything())).once();

    resetCalls(env.mockedRemoteTranslationEngine);
    env.paramsSubject.next({ projectId: 'project01', textId: 'text02' });
    env.waitForSuggestion();
    expect(env.component.sourceLabel).toEqual('Book 2 (Source)');
    expect(env.component.targetLabel).toEqual('Book 2 (Target)');
    expect(env.component.target.segmentRef).toEqual('');

    resetCalls(env.mockedRemoteTranslationEngine);
    env.paramsSubject.next({ projectId: 'project01', textId: 'text01' });
    env.waitForSuggestion();
    expect(env.component.sourceLabel).toEqual('Book 1 (Source)');
    expect(env.component.targetLabel).toEqual('Book 1 (Target)');
    expect(env.component.target.segmentRef).toEqual('verse_1_1');
    verify(env.mockedRemoteTranslationEngine.translateInteractively(1, anything())).once();
  }));

  it('update confidence threshold', fakeAsync(() => {
    const env = new TestEnvironment();
    env.setTranslateConfig({ selectedTextRef: 'text01', selectedSegment: 'verse_1_2', confidenceThreshold: 0.5 });
    env.waitForSuggestion();
    expect(env.component.confidenceThreshold).toBe(50);
    expect(env.component.showSuggestion).toBeTruthy();

    resetCalls(env.mockedSFProjectUserService);
    env.clickSuggestionsMenuButton();
    env.updateConfidenceThresholdSlider(60);
    expect(env.component.confidenceThreshold).toBe(60);
    verify(env.mockedSFProjectUserService.update(anything())).once();
    expect(env.component.showSuggestion).toBeFalsy();

    resetCalls(env.mockedSFProjectUserService);
    env.updateConfidenceThresholdSlider(40);
    expect(env.component.confidenceThreshold).toBe(40);
    verify(env.mockedSFProjectUserService.update(anything())).once();
    expect(env.component.showSuggestion).toBeTruthy();
  }));
});

const Delta: new () => DeltaStatic = Quill.import('delta');

class MockInteractiveTranslationSession implements InteractiveTranslationSession {
  prefix: string[] = [];
  isLastWordComplete: boolean = true;
  currentResults: TranslationResult[] = [];

  constructor(public readonly sourceSegment: string[], private readonly approved: (prefix: string[]) => void) {
    this.updateCurrentResults();
  }

  setPrefix(prefix: string[], isLastWordComplete: boolean): TranslationResult[] {
    this.prefix.length = 0;
    this.prefix.push(...prefix);
    this.isLastWordComplete = isLastWordComplete;
    this.updateCurrentResults();
    return this.currentResults;
  }

  appendToPrefix(addition: string, isLastWordComplete: boolean): TranslationResult[] {
    if (this.isLastWordComplete) {
      this.prefix.push(addition);
    } else {
      this.prefix[this.prefix.length - 1] = this.prefix[this.prefix.length - 1] + addition;
    }
    this.isLastWordComplete = isLastWordComplete;
    this.updateCurrentResults();
    return this.currentResults;
  }

  appendWordsToPrefix(words: string[]): TranslationResult[] {
    for (const word of words) {
      if (this.isLastWordComplete) {
        this.prefix.push(word);
      } else {
        this.prefix[this.prefix.length - 1] = word;
      }
      this.isLastWordComplete = true;
    }
    this.updateCurrentResults();
    return this.currentResults;
  }

  approve(): Promise<void> {
    this.approved(this.prefix);
    return Promise.resolve();
  }

  private updateCurrentResults(): void {
    const builder = new TranslationResultBuilder();
    for (let i = 0; i < this.sourceSegment.length; i++) {
      let targetWord = this.sourceSegment[i];
      if (targetWord === 'source') {
        targetWord = 'target';
      }
      builder.appendWord(targetWord, 0.5);
      const alignment = new WordAlignmentMatrix(1, 1);
      alignment.set(0, 0, true);
      builder.markPhrase(createRange(i, i + 1), alignment);
    }
    this.currentResults = [builder.toResult(this.sourceSegment, this.prefix.length)];
  }
}

class TestEnvironment {
  readonly component: EditorComponent;
  readonly fixture: ComponentFixture<EditorComponent>;

  mockedSFProjectService = mock(SFProjectService);
  mockedUserService = mock(UserService);
  mockedSFProjectUserService = mock(SFProjectUserService);
  mockedTextService = mock(TextService);
  mockedNoticeService = mock(NoticeService);
  mockedActivatedRoute = mock(ActivatedRoute);
  mockedRemoteTranslationEngine = mock(RemoteTranslationEngine);
  mockedRealtimeOfflineStore = mock(RealtimeOfflineStore);

  lastApprovedPrefix: string[] = [];

  paramsSubject: BehaviorSubject<Params>;

  constructor() {
    this.paramsSubject = new BehaviorSubject<Params>({ projectId: 'project01', textId: 'text01' });
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
    when(
      this.mockedTextService.connect(
        'text02',
        'source'
      )
    ).thenResolve(this.createTextData('source'));
    when(
      this.mockedTextService.connect(
        'text02',
        'target'
      )
    ).thenResolve(this.createTextData('target'));
    when(this.mockedActivatedRoute.params).thenReturn(this.paramsSubject);
    when(this.mockedUserService.currentUserId).thenReturn('user01');
    when(this.mockedSFProjectService.get('project01')).thenReturn(of());
    when(this.mockedSFProjectService.createTranslationEngine('project01')).thenReturn(
      instance(this.mockedRemoteTranslationEngine)
    );
    when(this.mockedRemoteTranslationEngine.translateInteractively(1, anything())).thenCall(
      (_n: number, segment: string[]) =>
        Promise.resolve(new MockInteractiveTranslationSession(segment, prefix => (this.lastApprovedPrefix = prefix)))
    );

    TestBed.configureTestingModule({
      declarations: [EditorComponent, SuggestionComponent],
      imports: [NoopAnimationsModule, RouterTestingModule, SharedModule, UICommonModule],
      providers: [
        { provide: SFProjectService, useFactory: () => instance(this.mockedSFProjectService) },
        { provide: SFProjectUserService, useFactory: () => instance(this.mockedSFProjectUserService) },
        { provide: UserService, useFactory: () => instance(this.mockedUserService) },
        { provide: TextService, useFactory: () => instance(this.mockedTextService) },
        { provide: NoticeService, useFactory: () => instance(this.mockedNoticeService) },
        { provide: ActivatedRoute, useFactory: () => instance(this.mockedActivatedRoute) }
      ]
    });
    this.fixture = TestBed.createComponent(EditorComponent);
    this.component = this.fixture.componentInstance;
  }

  get suggestion(): DebugElement {
    return this.fixture.debugElement.query(By.css('app-suggestion'));
  }

  get confidenceThresholdSlider(): DebugElement {
    return this.fixture.debugElement.query(By.css('#confidence-threshold-slider'));
  }

  setTranslateConfig(userTranslateConfig: TranslateProjectUserConfig): void {
    const included = [
      new SFProject({
        id: 'project01',
        users: [new SFProjectUserRef('projectuser01')],
        inputSystem: { languageName: 'Target' },
        translateConfig: { enabled: true, sourceInputSystem: { languageName: 'Source' } }
      }),
      new SFProjectUser({
        id: 'projectuser01',
        user: new UserRef('user01'),
        project: new SFProjectRef('project01'),
        translateConfig: userTranslateConfig
      })
    ];
    when(
      this.mockedTextService.get('text01', deepEqual([[nameof<Text>('project'), nameof<SFProject>('users')]]))
    ).thenReturn(
      of(
        new MapQueryResults(
          new Text({ id: 'text01', name: 'Book 1', project: new SFProjectRef('project01') }),
          undefined,
          included
        )
      )
    );
    when(
      this.mockedTextService.get('text02', deepEqual([[nameof<Text>('project'), nameof<SFProject>('users')]]))
    ).thenReturn(
      of(
        new MapQueryResults(
          new Text({ id: 'text02', name: 'Book 2', project: new SFProjectRef('project01') }),
          undefined,
          included
        )
      )
    );
  }

  waitForSuggestion(): void {
    this.fixture.detectChanges();
    tick();
    this.fixture.detectChanges();
    tick();
    this.fixture.detectChanges();
  }

  insertSuggestion(i: number = 0): void {
    if (i === 0) {
      const wordsLink = this.suggestion.query(By.css('#words-link'));
      wordsLink.nativeElement.click();
    } else {
      const keydownEvent: any = document.createEvent('CustomEvent');
      keydownEvent.which = 48 + i;
      keydownEvent.ctrlKey = true;
      keydownEvent.altKey = false;
      keydownEvent.metaKey = false;
      keydownEvent.shiftKey = false;
      keydownEvent.initEvent('keydown', true, true);
      this.component.target.editor.root.dispatchEvent(keydownEvent);
    }
    this.waitForSuggestion();
  }

  clickSuggestionsMenuButton(): void {
    this.component.suggestionsMenuButton.elementRef.nativeElement.click();
    this.fixture.detectChanges();
    tick(16);
    this.fixture.detectChanges();
  }

  updateConfidenceThresholdSlider(value: number): void {
    const slider = this.confidenceThresholdSlider.componentInstance as MdcSlider;
    slider.setValue(value, true);
    tick(500);
    this.waitForSuggestion();
  }

  private createTextData(textType: TextType): TextData {
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
        delta.insert({ blank: 'normal' }, { segment: 'verse_1_2' });
        break;
    }
    delta.insert('\n', { para: { style: 'p' } });
    delta.insert({ chapter: 2 }, { chapter: { style: 'c' } });
    delta.insert({ verse: 1 }, { verse: { style: 'v' } });
    delta.insert(`${textType}: chapter 2, verse 1.`, { segment: 'verse_2_1' });
    delta.insert({ verse: 2 }, { verse: { style: 'v' } });
    delta.insert(`${textType}: chapter 2, verse 2.`, { segment: 'verse_2_2' });
    delta.insert('\n', { para: { style: 'p' } });
    delta.insert({ blank: 'initial' }, { segment: 'verse_2_2/p_1' });
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
    const doc = new MockRealtimeDoc<DeltaStatic>('rich-text', 'text01:' + textType, delta);
    return new TextData(doc, instance(this.mockedRealtimeOfflineStore));
  }
}
