import * as angular from 'angular';
import { InteractiveTranslationSession, SegmentTokenizer, SmtTrainProgress, TranslationEngine } from 'machine';
import { RangeStatic } from 'quill';

import { NoticeService } from '../../../core/notice/notice.service';
import { DocType } from './constants';

export class MachineService {
  private engine: TranslationEngine;
  private session: InteractiveTranslationSession;
  private sourceSegment: string = '';
  private prefix: string = '';
  private _confidenceThreshold: number = 0.2;
  private sourceSegmentTokenizer: SegmentTokenizer;
  private targetSegmentTokenizer: SegmentTokenizer;
  private _engineConfidence: number = 0;
  private projectId: string = '';

  static $inject: string[] = ['$window', '$q',
    '$rootScope', 'silNoticeService'];
  constructor(private readonly $window: angular.IWindowService, private readonly $q: angular.IQService,
              private readonly $rootScope: angular.IRootScopeService, private readonly notice: NoticeService) { }

  get confidenceThreshold(): number {
    return this._confidenceThreshold;
  }

  set confidenceThreshold(value: number) {
    this._confidenceThreshold = value;
    if (this.engine != null && this.session != null) {
      this.session.confidenceThreshold = value;
    }
  }

  get isInitialised(): boolean {
    return this.engine != null;
  }

  get isTranslating(): boolean {
    return this.session != null;
  }

  initialise(projectId: string): void {
    if (this.projectId === projectId) {
      return;
    }

    this.projectId = projectId;
    this.engine = new TranslationEngine(this.$window.location.origin + '/machine', this.projectId);
    this.updateConfidence();
    this.sourceSegmentTokenizer = new SegmentTokenizer('latin');
    this.targetSegmentTokenizer = new SegmentTokenizer('latin');
  }

  translate(sourceSegment: string): angular.IPromise<void> {
    if (!this.isInitialised) {
      return this.$q.resolve();
    }

    this.prefix = '';
    if (this.sourceSegment === sourceSegment) {
      return this.$q.resolve();
    }

    this.sourceSegment = sourceSegment;
    if (sourceSegment === '') {
      this.session = null;
      return this.$q.resolve();
    }

    const start = performance.now();
    const deferred = this.$q.defer<void>();
    this.engine.translateInteractively(sourceSegment, this.confidenceThreshold, newSession => {
      if (newSession != null) {
        if (this.sourceSegment === sourceSegment) {
          newSession.initialize();
          const finish = performance.now();
          this.session = newSession;
          if (this.session.isSourceSegmentValid) {
            console.log('Translated segment, length: %d, time: %dms', this.session.sourceSegment.length,
              finish - start);
          } else {
            this.notice.push(this.notice.WARN,
              'This section of text is too long to generate suggestions.', '', false, 5000);
            console.log('Segment too long to translate, length: %d', this.session.sourceSegment.length);
          }
          deferred.resolve();
        } else {
          this.session = null;
          deferred.reject('Translation result is no longer valid.');
        }
      } else {
        this.session = null;
        deferred.reject('Error occurred while retrieving translation result.');
      }
    });

    return deferred.promise;
  }

  resetTranslation(): void {
    this.sourceSegment = '';
    this.prefix = '';
    this.session = null;
  }

  updatePrefix(prefix: string): string[] {
    if (!this.isInitialised || !this.isTranslating) {
      return [];
    }

    if (this.prefix === prefix) {
      return this.session.suggestion;
    }

    this.prefix = prefix;
    return this.session.updatePrefix(prefix);
  }

  getCurrentSuggestion(): string[] {
    if (!this.isInitialised || !this.isTranslating) {
      return [];
    }

    return this.session.suggestion;
  }

  get suggestionConfidence(): number {
    if (!this.isInitialised || !this.isTranslating) {
      return 0;
    }

    return this.session.suggestionConfidence;
  }

  get engineConfidence(): number {
    return this._engineConfidence;
  }

  trainSegment(): angular.IPromise<void> {
    if (!this.isInitialised || !this.isTranslating) {
      return this.$q.resolve();
    }

    const deferred = this.$q.defer<void>();
    this.session.approve(success => {
      if (success) {
        deferred.resolve();
      } else {
        deferred.reject('Error occurred while training the segment.');
      }
    });
    return deferred.promise;
  }

  getSuggestionText(suggestionIndex?: number): string {
    if (!this.isInitialised || !this.isTranslating) {
      return '';
    }

    return this.session.getSuggestionText(suggestionIndex);
  }

  tokenizeDocumentText(docType: string, text: string): RangeStatic[] {
    let tokenizer: SegmentTokenizer;
    switch (docType) {
      case DocType.SOURCE:
        tokenizer = this.sourceSegmentTokenizer;
        break;
      case DocType.TARGET:
        tokenizer = this.targetSegmentTokenizer;
        break;
    }

    if (tokenizer == null) {
      return [];
    }

    return tokenizer.tokenize(text).map(r => ({ index: r.start, length: r.length }));
  }

  startTraining(): angular.IPromise<void> {
    if (!this.isInitialised) {
      return this.$q.resolve();
    }

    const deferred = this.$q.defer<void>();
    this.engine.startTraining(success => {
      if (success) {
        deferred.resolve();
      } else {
        deferred.reject('Error occurred while starting the training process.');
      }
    });

    return deferred.promise;
  }

  listenForTrainingStatus(onStatusUpdate: (progress: SmtTrainProgress) => void): angular.IPromise<void> {
    if (!this.isInitialised) {
      return this.$q.resolve();
    }

    const deferred = this.$q.defer<void>();
    this.engine.listenForTrainingStatus(progress => {
      this.$rootScope.$apply(scope => onStatusUpdate(progress));
    }, success => {
      if (success) {
        this.updateConfidence();
        deferred.resolve();
      } else {
        deferred.reject('Error occurred while listening for training status.');
      }
    });

    return deferred.promise;
  }

  close(): void {
    this.resetTranslation();
    this.engine.close();
    this.engine = null;
    this.projectId = '';
  }

  private updateConfidence(): void {
    this.engine.getConfidence((success, confidence) => {
      if (success) {
        this.$rootScope.$apply(scope => this._engineConfidence = confidence);
      }
    });
  }
}
