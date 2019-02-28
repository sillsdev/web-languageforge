import { DebugElement } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
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
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Snapshot } from 'sharedb/lib/client';
import { anything, deepEqual, instance, mock, resetCalls, verify, when } from 'ts-mockito';

import { MapQueryResults } from 'xforge-common/json-api.service';
import { UserRef } from 'xforge-common/models/user';
import { NoticeService } from 'xforge-common/notice.service';
import { RealtimeDoc } from 'xforge-common/realtime-doc';
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
import { SharedModule } from '../../shared/shared.module';
import { EditorComponent } from './editor.component';
import { SuggestionComponent } from './suggestion.component';

describe('EditorComponent', () => {
  it('start with no previous selection', async(async () => {
    const env = new TestEnvironment();
    env.setTranslateConfig({});
    await env.wait();
    expect(env.component.sourceLabel).toEqual('Book 1 (Source)');
    expect(env.component.targetLabel).toEqual('Book 1 (Target)');
    expect(env.component.target.segmentRef).toEqual('');
    const selection = env.component.target.editor.getSelection();
    expect(selection).toBeNull();
  }));

  it('start with previously selected segment', async(async () => {
    const env = new TestEnvironment();
    env.setTranslateConfig({ selectedTextRef: 'text01', selectedSegment: 'verse_1_1' });
    await env.wait();
    expect(env.component.target.segmentRef).toEqual('verse_1_1');
    const selection = env.component.target.editor.getSelection();
    expect(selection.index).toEqual(29);
    expect(selection.length).toEqual(0);
    verify(env.mockedRemoteTranslationEngine.translateInteractively(1, anything())).once();
    expect(env.component.showSuggestion).toBeFalsy();
  }));

  it('select non-blank segment', async(async () => {
    const env = new TestEnvironment();
    env.setTranslateConfig({ selectedTextRef: 'text01', selectedSegment: 'verse_1_1' });
    await env.wait();
    expect(env.component.target.segmentRef).toEqual('verse_1_1');
    verify(env.mockedRemoteTranslationEngine.translateInteractively(1, anything())).once();
    expect(env.component.showSuggestion).toBeFalsy();

    resetCalls(env.mockedRemoteTranslationEngine);
    const range = env.component.target.getSegmentRange('verse_2_1');
    env.component.target.editor.setSelection(range.index, 0, 'user');
    await env.wait();
    expect(env.component.target.segmentRef).toEqual('verse_2_1');
    const selection = env.component.target.editor.getSelection();
    expect(selection.index).toEqual(35);
    expect(selection.length).toEqual(0);
    expect(env.component.translateUserConfig.selectedSegment).toEqual('verse_2_1');
    verify(env.mockedSFProjectUserService.update(anything())).once();
    verify(env.mockedRemoteTranslationEngine.translateInteractively(1, anything())).once();
    expect(env.component.showSuggestion).toBeFalsy();
  }));

  it('select blank segment', async(async () => {
    const env = new TestEnvironment();
    env.setTranslateConfig({ selectedTextRef: 'text01', selectedSegment: 'verse_1_1' });
    await env.wait();
    expect(env.component.target.segmentRef).toEqual('verse_1_1');

    resetCalls(env.mockedRemoteTranslationEngine);
    const range = env.component.target.getSegmentRange('verse_1_2');
    env.component.target.editor.setSelection(range.index, 0, 'user');
    await env.wait();
    expect(env.component.target.segmentRef).toEqual('verse_1_2');
    const selection = env.component.target.editor.getSelection();
    expect(selection.index).toEqual(30);
    expect(selection.length).toEqual(2);
    expect(env.component.translateUserConfig.selectedSegment).toEqual('verse_1_2');
    verify(env.mockedSFProjectUserService.update(anything())).once();
    verify(env.mockedRemoteTranslationEngine.translateInteractively(1, anything())).once();
    expect(env.component.showSuggestion).toBeTruthy();
    expect(env.component.suggestionWords).toEqual(['target']);
  }));

  it('select not at end of incomplete segment', async(async () => {
    const env = new TestEnvironment();
    env.setTranslateConfig({});
    await env.wait();
    expect(env.component.target.segmentRef).toEqual('');

    const range = env.component.target.getSegmentRange('verse_2_3');
    env.component.target.editor.setSelection(range.index, 0, 'user');
    await env.wait();
    expect(env.component.target.segmentRef).toEqual('verse_2_3');
    verify(env.mockedRemoteTranslationEngine.translateInteractively(1, anything())).once();
    expect(env.component.showSuggestion).toBeFalsy();
  }));

  it('select at end of incomplete segment', async(async () => {
    const env = new TestEnvironment();
    env.setTranslateConfig({});
    await env.wait();
    expect(env.component.target.segmentRef).toEqual('');

    const range = env.component.target.getSegmentRange('verse_2_3');
    env.component.target.editor.setSelection(range.index + range.length, 0, 'user');
    await env.wait();
    expect(env.component.target.segmentRef).toEqual('verse_2_3');
    verify(env.mockedRemoteTranslationEngine.translateInteractively(1, anything())).once();
    expect(env.component.showSuggestion).toBeTruthy();
    expect(env.component.suggestionWords).toEqual(['verse', '3']);
  }));

  it('insert suggestion in non-blank segment', async(async () => {
    const env = new TestEnvironment();
    env.setTranslateConfig({ selectedTextRef: 'text01', selectedSegment: 'verse_2_3' });
    await env.wait();
    expect(env.component.target.segmentRef).toEqual('verse_2_3');
    expect(env.component.showSuggestion).toBeTruthy();

    env.insertSuggestion();
    await env.wait();
    expect(env.component.target.segmentText).toEqual('target: chapter 2, verse 3');
    expect(env.component.showSuggestion).toBeFalsy();
  }));

  it('insert space when typing character after inserting a suggestion', async(async () => {
    const env = new TestEnvironment();
    env.setTranslateConfig({ selectedTextRef: 'text01', selectedSegment: 'verse_2_3' });
    await env.wait();
    expect(env.component.target.segmentRef).toEqual('verse_2_3');
    expect(env.component.showSuggestion).toBeTruthy();

    env.insertSuggestion(1);
    await env.wait();
    expect(env.component.target.segmentText).toEqual('target: chapter 2, verse');
    expect(env.component.showSuggestion).toBeTruthy();

    let selection = env.component.target.editor.getSelection();
    const selectionIndex = selection.index;
    env.component.target.editor.insertText(selectionIndex, '3', 'user');
    env.component.target.editor.setSelection(selectionIndex + 1, 0, 'user');
    await env.wait();
    expect(env.component.target.segmentText).toEqual('target: chapter 2, verse 3');
    expect(env.component.showSuggestion).toBeFalsy();
    selection = env.component.target.editor.getSelection();
    expect(selection.index).toEqual(selectionIndex + 2);
    expect(selection.length).toEqual(0);
  }));

  it('insert space when inserting a suggestion after inserting a previous suggestion', async(async () => {
    const env = new TestEnvironment();
    env.setTranslateConfig({ selectedTextRef: 'text01', selectedSegment: 'verse_2_3' });
    await env.wait();
    expect(env.component.target.segmentRef).toEqual('verse_2_3');
    expect(env.component.showSuggestion).toBeTruthy();

    env.insertSuggestion(1);
    await env.wait();
    expect(env.component.target.segmentText).toEqual('target: chapter 2, verse');
    expect(env.component.showSuggestion).toBeTruthy();

    let selection = env.component.target.editor.getSelection();
    const selectionIndex = selection.index;
    env.insertSuggestion(1);
    await env.wait();
    expect(env.component.target.segmentText).toEqual('target: chapter 2, verse 3');
    expect(env.component.showSuggestion).toBeFalsy();
    selection = env.component.target.editor.getSelection();
    expect(selection.index).toEqual(selectionIndex + 2);
    expect(selection.length).toEqual(0);
  }));

  it('do not insert space when typing punctuation after inserting a suggestion', async(async () => {
    const env = new TestEnvironment();
    env.setTranslateConfig({ selectedTextRef: 'text01', selectedSegment: 'verse_2_3' });
    await env.wait();
    expect(env.component.target.segmentRef).toEqual('verse_2_3');
    expect(env.component.showSuggestion).toBeTruthy();

    env.insertSuggestion(1);
    await env.wait();
    expect(env.component.target.segmentText).toEqual('target: chapter 2, verse');
    expect(env.component.showSuggestion).toBeTruthy();

    let selection = env.component.target.editor.getSelection();
    const selectionIndex = selection.index;
    env.component.target.editor.insertText(selectionIndex, '.', 'user');
    env.component.target.editor.setSelection(selectionIndex + 1, 0, 'user');
    await env.wait();
    expect(env.component.target.segmentText).toEqual('target: chapter 2, verse.');
    expect(env.component.showSuggestion).toBeFalsy();
    selection = env.component.target.editor.getSelection();
    expect(selection.index).toEqual(selectionIndex + 1);
    expect(selection.length).toEqual(0);
  }));

  it('train a modified segment after selecting a different segment', async(async () => {
    const env = new TestEnvironment();
    env.setTranslateConfig({ selectedTextRef: 'text01', selectedSegment: 'verse_2_3' });
    await env.wait();
    expect(env.component.target.segmentRef).toEqual('verse_2_3');
    expect(env.component.showSuggestion).toBeTruthy();

    env.insertSuggestion();
    await env.wait();
    expect(env.component.target.segmentText).toEqual('target: chapter 2, verse 3');

    const range = env.component.target.getSegmentRange('verse_1_1');
    env.component.target.editor.setSelection(range.index, 0, 'user');
    await env.wait();
    expect(env.component.target.segmentRef).toEqual('verse_1_1');
    expect(env.lastApprovedPrefix).toEqual(['target', ':', 'chapter', '2', ',', 'verse', '3']);
  }));

  it('do not train an unmodified segment after selecting a different segment', async(async () => {
    const env = new TestEnvironment();
    env.setTranslateConfig({ selectedTextRef: 'text01', selectedSegment: 'verse_2_3' });
    await env.wait();
    expect(env.component.target.segmentRef).toEqual('verse_2_3');
    expect(env.component.showSuggestion).toBeTruthy();

    env.insertSuggestion();
    await env.wait();
    expect(env.component.target.segmentText).toEqual('target: chapter 2, verse 3');

    const selection = env.component.target.editor.getSelection();
    env.component.target.editor.deleteText(selection.index - 7, 7, 'user');
    await env.wait();
    expect(env.component.target.segmentText).toEqual('target: chapter 2, ');

    const range = env.component.target.getSegmentRange('verse_1_1');
    env.component.target.editor.setSelection(range.index, 0, 'user');
    await env.wait();
    expect(env.component.target.segmentRef).toEqual('verse_1_1');
    expect(env.lastApprovedPrefix).toEqual([]);
  }));

  it('change texts', async(async () => {
    const env = new TestEnvironment();
    env.setTranslateConfig({ selectedTextRef: 'text01', selectedSegment: 'verse_1_1' });
    await env.wait();
    expect(env.component.target.segmentRef).toEqual('verse_1_1');
    verify(env.mockedRemoteTranslationEngine.translateInteractively(1, anything())).once();

    resetCalls(env.mockedRemoteTranslationEngine);
    env.paramsSubject.next({ projectId: 'project01', textId: 'text02' });
    await env.wait();
    expect(env.component.sourceLabel).toEqual('Book 2 (Source)');
    expect(env.component.targetLabel).toEqual('Book 2 (Target)');
    expect(env.component.target.segmentRef).toEqual('');

    resetCalls(env.mockedRemoteTranslationEngine);
    env.paramsSubject.next({ projectId: 'project01', textId: 'text01' });
    await env.wait();
    expect(env.component.sourceLabel).toEqual('Book 1 (Source)');
    expect(env.component.targetLabel).toEqual('Book 1 (Target)');
    expect(env.component.target.segmentRef).toEqual('verse_1_1');
    verify(env.mockedRemoteTranslationEngine.translateInteractively(1, anything())).once();
  }));
});

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
      builder.appendWord(targetWord, 1);
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
      imports: [RouterTestingModule, SharedModule, UICommonModule],
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

  async wait(): Promise<void> {
    this.fixture.detectChanges();
    await this.fixture.whenStable();
    this.fixture.detectChanges();
    await this.fixture.whenStable();
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
    return new TextData(doc, instance(this.mockedRealtimeOfflineStore));
  }
}
