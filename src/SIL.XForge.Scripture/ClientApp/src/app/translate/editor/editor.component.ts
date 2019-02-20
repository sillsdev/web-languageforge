import { Component, HostBinding, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
import { switchMap, tap } from 'rxjs/operators';
import XRegExp from 'xregexp';

import { NoticeService } from 'xforge-common/notice.service';
import { SubscriptionDisposable } from 'xforge-common/subscription-disposable';
import { UserService } from 'xforge-common/user.service';
import { nameof } from 'xforge-common/utils';
import { SFProject } from '../../core/models/sfproject';
import { SFProjectUser, TranslateProjectUserConfig } from '../../core/models/sfproject-user';
import { Text } from '../../core/models/text';
import { SFProjectUserService } from '../../core/sfproject-user.service';
import { SFProjectService } from '../../core/sfproject.service';
import { TextService, TextType } from '../../core/text.service';
import { Segment } from '../../shared/text/segment';
import { INITIAL_BLANK_TEXT, isBlankText, NORMAL_BLANK_TEXT, TextComponent } from '../../shared/text/text.component';

const Delta: new () => DeltaStatic = Quill.import('delta');
const PUNCT_SPACE_REGEX = XRegExp('^(\\p{P}|\\p{S}|\\p{Cc}|\\p{Z})+$');

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent extends SubscriptionDisposable implements OnInit {
  @HostBinding('class') classes = 'flex-column flex-grow';

  textId?: string;
  suggestionWords: string[] = [];
  suggestionConfidence: number = 0;
  showSuggestion: boolean = false;

  @ViewChild('source') source: TextComponent;
  @ViewChild('target') target: TextComponent;

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

    this.translationSuggester.confidenceThreshold = 0.2;
  }

  get sourceLabel(): string {
    const sourceLangName = this.project == null ? '' : this.project.translateConfig.sourceInputSystem.languageName;
    return `${this.textName} (${sourceLangName})`;
  }

  get targetLabel(): string {
    const targetLangName = this.project == null ? '' : this.project.inputSystem.languageName;
    return `${this.textName} (${targetLangName})`;
  }

  get isTargetTextRight(): boolean {
    return this.userTranslateConfig == null ? true : this.userTranslateConfig.isTargetTextRight;
  }

  set isTargetTextRight(value: boolean) {
    if (this.isTargetTextRight !== value) {
      this.userTranslateConfig.isTargetTextRight = value;
      this.target.focus();
      this.updateUserTranslateConfig();
    }
  }

  get userTranslateConfig(): TranslateProjectUserConfig {
    return this.projectUser == null ? null : this.projectUser.translateConfig;
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

  private get textName(): string {
    return this.text == null ? '' : this.text.name;
  }

  ngOnInit(): void {
    this.subscribe(
      this.activatedRoute.params.pipe(
        tap(params => {
          this.sourceLoaded = false;
          this.targetLoaded = false;
          this.noticeService.loadingStarted();
          this.textId = params['textId'];
        }),
        switchMap(params =>
          this.textService.get(params['textId'], [nameof<Text>('project'), nameof<SFProject>('users')])
        )
      ),
      r => {
        this.text = r.results;
        this.project = r.getIncluded(this.text.project);
        this.projectUser = r
          .getManyIncluded<SFProjectUser>(this.project.users)
          .find(pu => pu.user.id === this.userService.currentUserId);
        if (this.userTranslateConfig != null) {
          if (this.userTranslateConfig.isTargetTextRight == null) {
            this.userTranslateConfig.isTargetTextRight = true;
          }
          if (
            this.userTranslateConfig.selectedTextRef === this.textId &&
            this.userTranslateConfig.selectedSegment !== ''
          ) {
            this.target.switchSegment(
              this.userTranslateConfig.selectedSegment,
              this.userTranslateConfig.selectedSegmentChecksum,
              true
            );
          }
        }
        this.translationEngine = this.projectService.createTranslationEngine(this.project.id);
      }
    );
  }

  async onTargetUpdated(segment: Segment, delta?: DeltaStatic, prevSegment?: Segment): Promise<void> {
    if (segment !== prevSegment) {
      this.source.switchSegment(this.target.segmentRef);
      this.syncScroll();

      this.insertSuggestionEnd = -1;
      this.onStartTranslating();
      try {
        if (
          this.userTranslateConfig != null &&
          this.target.segmentRef !== '' &&
          (this.userTranslateConfig.selectedTextRef !== this.textId ||
            this.userTranslateConfig.selectedSegment !== this.target.segmentRef)
        ) {
          this.userTranslateConfig.selectedTextRef = this.textId;
          this.userTranslateConfig.selectedSegment = this.target.segmentRef;
          this.userTranslateConfig.selectedSegmentChecksum = this.target.segmentChecksum;
          await this.updateUserTranslateConfig();
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
      } else if (this.insertSuggestionEnd !== -1) {
        const selection = this.target.editor.getSelection();
        if (selection == null || selection.length > 0 || selection.index !== this.insertSuggestionEnd) {
          this.insertSuggestionEnd = -1;
        }
      }
      this.updateSuggestions();
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

  insertSuggestion(suggestionIndex: number = -1): void {
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

    const selectIndex = range.index + insertText.length;
    this.insertSuggestionEnd = selectIndex;
    this.target.editor.updateContents(delta, 'user');
    this.target.editor.setSelection(selectIndex, 0, 'user');
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
        }
      }
    }
    this.showSuggestion = (this.isTranslating || this.suggestionWords.length > 0) && this.isSelectionAtSegmentEnd;
  }

  private skipInitialWhitespace(range: RangeStatic): RangeStatic {
    let i: number;
    for (i = range.index; i < range.index + range.length; i++) {
      const ch = this.target.editor.getText(i, 1);
      if (ch === INITIAL_BLANK_TEXT[0] || ch === NORMAL_BLANK_TEXT[0] || !/\s/.test(ch)) {
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
      !isBlankText(segment.text) &&
      this.isSegmentComplete(segment.range) &&
      segment.isChanged
    );
  }

  private isSegmentComplete(range: RangeStatic): boolean {
    return range.index + range.length !== this.target.length;
  }

  private async updateUserTranslateConfig(): Promise<void> {
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
