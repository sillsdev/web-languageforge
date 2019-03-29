import { MdcIconButton } from '@angular-mdc/web';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { eq } from '@orbit/utils';
import {
  InteractiveTranslationSession,
  LatinWordTokenizer,
  MAX_SEGMENT_LENGTH,
  PhraseTranslationSuggester,
  RemoteTranslationEngine,
  Tokenizer,
  TranslationSuggester
} from '@sillsdev/machine';
import Quill, { DeltaStatic, RangeStatic } from 'quill';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { debounceTime, filter, map, repeat, skip, switchMap, tap } from 'rxjs/operators';
import { NoticeService } from 'xforge-common/notice.service';
import { SubscriptionDisposable } from 'xforge-common/subscription-disposable';
import { UserService } from 'xforge-common/user.service';
import { nameof } from 'xforge-common/utils';
import XRegExp from 'xregexp';
import { SFProject } from '../../core/models/sfproject';
import { SFProjectUser, TranslateProjectUserConfig } from '../../core/models/sfproject-user';
import { Text } from '../../core/models/text';
import { TextDataId, TextType } from '../../core/models/text-data';
import { SFProjectUserService } from '../../core/sfproject-user.service';
import { SFProjectService } from '../../core/sfproject.service';
import { TextService } from '../../core/text.service';
import { Segment } from '../../shared/text/segment';
import { TextComponent } from '../../shared/text/text.component';
import { TranslateMetricsSession } from './translate-metrics-session';

export const UPDATE_SUGGESTIONS_TIMEOUT = 100;
export const CONFIDENCE_THRESHOLD_TIMEOUT = 500;

const Delta: new () => DeltaStatic = Quill.import('delta');
const PUNCT_SPACE_REGEX = XRegExp('^(\\p{P}|\\p{S}|\\p{Cc}|\\p{Z})+$');

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent extends SubscriptionDisposable implements OnInit, OnDestroy {
  suggestionWords: string[] = [];
  suggestionConfidence: number = 0;
  showSuggestion: boolean = false;
  displaySlider: boolean = false;
  chapters: number[] = [];
  readonly metricsSession: TranslateMetricsSession;
  trainingPercentage: number;
  trainingMessage: string;
  showTrainingProgress: boolean = false;

  @ViewChild('source') source: TextComponent;
  @ViewChild('target') target: TextComponent;
  @ViewChild('suggestionsMenuButton') suggestionsMenuButton: MdcIconButton;

  private translationEngine: RemoteTranslationEngine;
  private isTranslating: boolean = false;
  private readonly sourceWordTokenizer: Tokenizer;
  private readonly targetWordTokenizer: Tokenizer;
  private translationSession?: InteractiveTranslationSession;
  private readonly translationSuggester: TranslationSuggester = new PhraseTranslationSuggester();
  private insertSuggestionEnd: number = -1;
  private projectUser: SFProjectUser;
  private project: SFProject;
  private text: Text;
  private sourceLoaded: boolean = false;
  private targetLoaded: boolean = false;
  private confidenceThreshold$: BehaviorSubject<number>;
  private _chapter: number;
  private lastShownSuggestionWords: string[] = [];
  private readonly segmentUpdated$: Subject<void>;
  private trainingSubscription: Subscription;
  private trainingProgressClosed: boolean = false;
  private trainingCompletedTimeout: any;

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly userService: UserService,
    private readonly projectService: SFProjectService,
    private readonly projectUserService: SFProjectUserService,
    private readonly textService: TextService,
    private readonly noticeService: NoticeService
  ) {
    super();
    const wordTokenizer = new LatinWordTokenizer();
    this.sourceWordTokenizer = wordTokenizer;
    this.targetWordTokenizer = wordTokenizer;
    this.metricsSession = new TranslateMetricsSession(this.projectService);

    this.confidenceThreshold$ = new BehaviorSubject<number>(20);
    this.translationSuggester.confidenceThreshold = 0.2;
    this.subscribe(
      this.confidenceThreshold$.pipe(
        skip(1),
        debounceTime(CONFIDENCE_THRESHOLD_TIMEOUT),
        map(value => value / 100),
        filter(threshold => threshold !== this.translationSuggester.confidenceThreshold)
      ),
      threshold => {
        this.translationSuggester.confidenceThreshold = threshold;
        this.updateSuggestions();
        this.translateUserConfig.confidenceThreshold = threshold;
        this.updateUserConfig();
      }
    );

    this.segmentUpdated$ = new Subject<void>();
    this.subscribe(this.segmentUpdated$.pipe(debounceTime(UPDATE_SUGGESTIONS_TIMEOUT)), () => this.updateSuggestions());
  }

  get sourceLabel(): string {
    return this.project == null || this.project.translateConfig == null
      ? ''
      : this.project.translateConfig.sourceInputSystem.languageName;
  }

  get targetLabel(): string {
    return this.project == null || this.project.inputSystem == null ? '' : this.project.inputSystem.languageName;
  }

  get isTargetTextRight(): boolean {
    return this.translateUserConfig == null || this.translateUserConfig == null
      ? true
      : this.translateUserConfig.isTargetTextRight;
  }

  set isTargetTextRight(value: boolean) {
    if (this.isTargetTextRight !== value) {
      this.translateUserConfig.isTargetTextRight = value;
      this.updateUserConfig();
    }
  }

  get translateUserConfig(): TranslateProjectUserConfig {
    return this.projectUser == null ? null : this.projectUser.translateConfig;
  }

  get confidenceThreshold(): number {
    return this.confidenceThreshold$.value;
  }

  set confidenceThreshold(value: number) {
    this.confidenceThreshold$.next(value);
  }

  get chapter(): number {
    return this._chapter;
  }

  set chapter(value: number) {
    if (this._chapter !== value) {
      this.showSuggestion = false;
      this._chapter = value;
      this.changeText();
    }
  }

  private get isSelectionAtSegmentEnd(): boolean {
    const selection = this.target.editor.getSelection();
    if (selection == null) {
      return false;
    }
    const selectionEndIndex = selection.index + selection.length;
    const segmentEndIndex = this.target.segment.range.index + this.target.segment.range.length;
    return selectionEndIndex === segmentEndIndex;
  }

  get textName(): string {
    return this.text == null ? '' : this.text.name;
  }

  ngOnInit(): void {
    this.subscribe(
      this.activatedRoute.params.pipe(
        tap(() => {
          this.showSuggestion = false;
          this.sourceLoaded = false;
          this.targetLoaded = false;
          this.noticeService.loadingStarted();
        }),
        switchMap(params =>
          this.textService.get(params['textId'], [[nameof<Text>('project'), nameof<SFProject>('users')]])
        ),
        filter(r => r.data != null)
      ),
      r => {
        const prevTextId = this.text == null ? '' : this.text.id;
        const prevProjectId = this.project == null ? '' : this.project.id;
        this.text = r.data;
        this.project = r.getIncluded(this.text.project);
        this.projectUser = r
          .getManyIncluded<SFProjectUser>(this.project.users)
          .find(pu => pu.user.id === this.userService.currentUserId);
        this.chapters = this.text.chapters.map(c => c.number);

        if (this.text.id !== prevTextId) {
          this._chapter = 1;
          if (this.translateUserConfig != null) {
            if (this.translateUserConfig.isTargetTextRight == null) {
              this.translateUserConfig.isTargetTextRight = true;
            }
            if (this.translateUserConfig.confidenceThreshold != null) {
              const pcnt = Math.round(this.translateUserConfig.confidenceThreshold * 100);
              this.translationSuggester.confidenceThreshold = pcnt / 100;
              this.confidenceThreshold$.next(pcnt);
            }
            if (this.translateUserConfig.selectedTextRef === this.text.id) {
              if (this.translateUserConfig.selectedChapter != null && this.translateUserConfig.selectedChapter !== 0) {
                this._chapter = this.translateUserConfig.selectedChapter;
              }
            }
          }
          this.changeText();
        }

        if (this.project.id !== prevProjectId) {
          if (this.trainingSubscription != null) {
            this.trainingSubscription.unsubscribe();
          }
          this.translationEngine = this.projectService.createTranslationEngine(this.project.id);
          this.trainingSubscription = this.subscribe(
            this.translationEngine.listenForTrainingStatus().pipe(
              tap(undefined, undefined, async () => {
                // training completed successfully
                if (this.trainingProgressClosed) {
                  this.noticeService.show('Training completed successfully');
                  this.trainingProgressClosed = false;
                } else {
                  this.trainingMessage = 'Completed successfully';
                  this.trainingCompletedTimeout = setTimeout(() => {
                    this.showTrainingProgress = false;
                    this.trainingCompletedTimeout = undefined;
                  }, 5000);
                }

                // re-translate current segment
                this.onStartTranslating();
                try {
                  await this.translateSegment();
                } finally {
                  this.onFinishTranslating();
                }
              }),
              repeat(),
              filter(progress => progress.percentCompleted > 0)
            ),
            progress => {
              if (!this.trainingProgressClosed) {
                this.showTrainingProgress = true;
              }
              if (this.trainingCompletedTimeout != null) {
                clearTimeout(this.trainingCompletedTimeout);
                this.trainingCompletedTimeout = undefined;
              }
              this.trainingPercentage = Math.round(progress.percentCompleted * 100);
              this.trainingMessage = progress.message;
            }
          );
          this.metricsSession.start(this.project.id, this.target);
        }
      }
    );
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
    this.noticeService.loadingFinished();
    this.metricsSession.dispose();
  }

  suggestionsMenuOpened(): void {
    // if the parent element of a slider resizes, then the slider will not be rendered properly. A menu is resized when
    // it is opened, which triggers this bug. We workaround this bug in MDC Web by waiting to display the slider when
    // the menu is opened.
    // https://github.com/trimox/angular-mdc-web/issues/1832
    // https://github.com/material-components/material-components-web/issues/1017
    this.displaySlider = true;
  }

  suggestionsMenuClosed(): void {
    this.displaySlider = false;
    this.suggestionsMenuButton.elementRef.nativeElement.blur();
  }

  closeTrainingProgress(): void {
    this.showTrainingProgress = false;
    this.trainingProgressClosed = true;
  }

  async onTargetUpdated(segment: Segment, delta?: DeltaStatic, prevSegment?: Segment): Promise<void> {
    if (segment !== prevSegment) {
      this.lastShownSuggestionWords = [];
      this.source.changeSegment(this.target.segmentRef);
      this.syncScroll();

      this.insertSuggestionEnd = -1;
      this.onStartTranslating();
      try {
        if (
          this.translateUserConfig != null &&
          this.target.segmentRef !== '' &&
          (this.translateUserConfig.selectedTextRef !== this.text.id ||
            this.translateUserConfig.selectedChapter !== this._chapter ||
            this.translateUserConfig.selectedSegment !== this.target.segmentRef)
        ) {
          this.projectUser.selectedTask = 'translate';
          this.translateUserConfig.selectedTextRef = this.text.id;
          this.translateUserConfig.selectedChapter = this._chapter;
          this.translateUserConfig.selectedSegment = this.target.segmentRef;
          this.translateUserConfig.selectedSegmentChecksum = this.target.segmentChecksum;
          await this.updateUserConfig();
        }
        await this.trainSegment(prevSegment);
        await this.translateSegment();
      } finally {
        this.onFinishTranslating();
      }
    } else {
      if (delta != null) {
        // insert a space if the user just inserted a suggestion and started typing
        if (
          delta.ops.length === 2 &&
          delta.ops[0].retain === this.insertSuggestionEnd &&
          delta.ops[1].insert != null &&
          delta.ops[1].insert.length > 0 &&
          !PUNCT_SPACE_REGEX.test(delta.ops[1].insert)
        ) {
          this.target.editor.insertText(this.insertSuggestionEnd, ' ', 'user');
          const selectIndex = this.insertSuggestionEnd + delta.ops[1].insert.length + 1;
          this.insertSuggestionEnd = -1;
          this.target.editor.setSelection(selectIndex, 0, 'user');
        }
      }
      if (this.insertSuggestionEnd !== -1) {
        const selection = this.target.editor.getSelection();
        if (selection == null || selection.length > 0 || selection.index !== this.insertSuggestionEnd) {
          this.insertSuggestionEnd = -1;
        }
      }
      this.segmentUpdated$.next();
      this.syncScroll();
    }
  }

  onTextLoaded(textType: TextType): void {
    switch (textType) {
      case 'source':
        this.sourceLoaded = true;
        break;
      case 'target':
        this.targetLoaded = true;
        break;
    }
    if (this.sourceLoaded && this.targetLoaded) {
      this.noticeService.loadingFinished();
    }
  }

  insertSuggestion(suggestionIndex: number, event: Event): void {
    if (suggestionIndex >= this.suggestionWords.length) {
      return;
    }

    this.target.focus();
    const range = this.skipInitialWhitespace(this.target.editor.getSelection());

    const delta = new Delta();
    delta.retain(range.index);
    if (range.length > 0) {
      delta.delete(range.length);
    }

    const words = suggestionIndex === -1 ? this.suggestionWords : this.suggestionWords.slice(0, suggestionIndex + 1);
    // TODO: use detokenizer to build suggestion text
    let insertText = words.join(' ');
    if (!this.translationSession.isLastWordComplete) {
      const lastWord = this.translationSession.prefix[this.translationSession.prefix.length - 1];
      insertText = insertText.substring(lastWord.length);
    }
    if (this.insertSuggestionEnd !== -1) {
      insertText = ' ' + insertText;
    }
    delta.insert(insertText);
    this.showSuggestion = false;

    const selectIndex = range.index + insertText.length;
    this.insertSuggestionEnd = selectIndex;
    this.target.editor.updateContents(delta, 'user');
    this.target.editor.setSelection(selectIndex, 0, 'user');

    this.metricsSession.onSuggestionAccepted(event);
  }

  private changeText(): void {
    this.target.blur();
    let selectedSegment: string;
    let selectedSegmentChecksum: number;
    if (
      this.translateUserConfig != null &&
      this.translateUserConfig.selectedTextRef === this.text.id &&
      this.translateUserConfig.selectedChapter === this._chapter &&
      this.translateUserConfig.selectedSegment !== ''
    ) {
      selectedSegment = this.translateUserConfig.selectedSegment;
      selectedSegmentChecksum = this.translateUserConfig.selectedSegmentChecksum;
    }
    this.source.id = new TextDataId(this.text.id, this._chapter, 'source');
    this.target.id = new TextDataId(this.text.id, this._chapter, 'target');
    if (selectedSegment != null) {
      this.target.changeSegment(selectedSegment, selectedSegmentChecksum, true);
    }
  }

  private onStartTranslating(): void {
    this.isTranslating = true;
    this.suggestionWords = [];
    this.showSuggestion = this.isSelectionAtSegmentEnd;
  }

  private async translateSegment(): Promise<void> {
    this.translationSession = null;
    const sourceSegment = this.source.segmentText;
    const words = this.sourceWordTokenizer.tokenizeToStrings(sourceSegment);
    if (words.length > MAX_SEGMENT_LENGTH) {
      this.translationSession = null;
      this.noticeService.show('This verse is too long to generate suggestions.');
      return;
    }

    const start = performance.now();
    const translationSession = await this.translationEngine.translateInteractively(1, words);
    if (sourceSegment === this.source.segmentText) {
      this.translationSession = translationSession;
      const finish = performance.now();
      console.log('Translated segment, length: %d, time: %dms', words.length, finish - start);
    }
  }

  private onFinishTranslating(): void {
    this.isTranslating = false;
    this.updateSuggestions();
  }

  private updateSuggestions(): void {
    if (this.target.segment == null) {
      return;
    }

    // only bother updating the suggestion if the cursor is at the end of the segment
    if (!this.isTranslating && this.isSelectionAtSegmentEnd) {
      if (this.translationSession == null) {
        this.suggestionWords = [];
      } else {
        const range = this.skipInitialWhitespace(this.target.editor.getSelection());
        const text = this.target.editor.getText(
          this.target.segment.range.index,
          range.index - this.target.segment.range.index
        );

        const tokenRanges = this.targetWordTokenizer.tokenize(text);
        const prefix = tokenRanges.map(r => text.substring(r.start, r.end));
        const isLastWordComplete =
          this.insertSuggestionEnd !== -1 ||
          tokenRanges.length === 0 ||
          tokenRanges[tokenRanges.length - 1].end !== text.length;
        const results = this.translationSession.setPrefix(prefix, isLastWordComplete);
        if (results.length === 0) {
          this.suggestionWords = [];
        } else {
          const result = results[0];
          const suggestion = this.translationSuggester.getSuggestion(prefix.length, isLastWordComplete, result);
          this.suggestionWords = suggestion.targetWordIndices.map(j => result.targetSegment[j]);
          this.suggestionConfidence = suggestion.confidence;
          if (this.suggestionWords.length > 0 && !eq(this.lastShownSuggestionWords, this.suggestionWords)) {
            this.metricsSession.onSuggestionShown();
            this.lastShownSuggestionWords = this.suggestionWords;
          }
        }
      }
    }
    this.showSuggestion = (this.isTranslating || this.suggestionWords.length > 0) && this.isSelectionAtSegmentEnd;
  }

  private skipInitialWhitespace(range: RangeStatic): RangeStatic {
    let i: number;
    for (i = range.index; i < range.index + range.length; i++) {
      const ch = this.target.editor.getText(i, 1);
      if (ch === '' || !/\s/.test(ch)) {
        return { index: i, length: range.length - (i - range.index) };
      }
    }
    return { index: i, length: 0 };
  }

  private async trainSegment(segment: Segment): Promise<void> {
    if (!this.isSegmentUntrained(segment)) {
      return;
    }

    await this.translationSession.approve();
    segment.acceptChanges();
    console.log('Segment ' + segment.ref + ' of document ' + segment.textId + ' was trained successfully.');
  }

  private isSegmentUntrained(segment: Segment): boolean {
    return (
      segment != null &&
      segment.range.length > 0 &&
      segment.text !== '' &&
      this.isSegmentComplete(segment.range) &&
      segment.isChanged
    );
  }

  private isSegmentComplete(range: RangeStatic): boolean {
    return range.index + range.length !== this.target.length;
  }

  private async updateUserConfig(): Promise<void> {
    await this.projectUserService.update(this.projectUser);
  }

  private syncScroll(): void {
    if (this.source == null || this.source.segment == null || !this.target.hasFocus) {
      return;
    }

    const thisRange = this.target.segment.range;
    const thisBounds = this.target.editor.selection.getBounds(thisRange.index);

    const otherRange = this.source.segment.range;
    const otherBounds = this.source.editor.selection.getBounds(otherRange.index);
    this.source.editor.scrollingContainer.scrollTop += otherBounds.top - thisBounds.top;
  }
}
