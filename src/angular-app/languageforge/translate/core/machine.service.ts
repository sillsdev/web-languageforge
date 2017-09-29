import * as angular from 'angular';
import { InteractiveTranslationSession, SegmentTokenizer, SmtTrainProgress, TranslationEngine } from 'machine';
import { RangeStatic } from 'quill';

import { DocType } from './constants';

export class MachineService {
  private engine: TranslationEngine;
  private session: InteractiveTranslationSession;
  private sourceSegment: string = '';
  private prefix: string = '';
  private confidenceThreshold: number = -1;
  private sourceSegmentTokenizer: SegmentTokenizer;
  private targetSegmentTokenizer: SegmentTokenizer;

  static $inject: string[] = ['$window', '$q', '$rootScope'];
  constructor(private $window: angular.IWindowService, private readonly $q: angular.IQService,
              private readonly $rootScope: angular.IRootScopeService) { }

  initialise(projectId: string, isScripture: boolean): void {
    this.engine = new TranslationEngine(this.$window.location.origin + '/machine', projectId);
    const segmentType = isScripture ? 'line' : 'latin';
    this.sourceSegmentTokenizer = new SegmentTokenizer(segmentType);
    this.targetSegmentTokenizer = new SegmentTokenizer(segmentType);
  }

  translate(sourceSegment: string, confidenceThreshold: number): angular.IPromise<void> {
    if (this.engine == null) {
      return this.$q.resolve();
    }

    this.prefix = '';
    if (this.sourceSegment === sourceSegment && this.confidenceThreshold === confidenceThreshold) {
      return this.$q.resolve();
    }

    const deferred = this.$q.defer<void>();
    this.sourceSegment = sourceSegment;
    this.confidenceThreshold = confidenceThreshold;
    this.engine.translateInteractively(sourceSegment, confidenceThreshold, newSession => {
      if (newSession != null) {
        this.session = newSession;
        deferred.resolve();
      } else {
        deferred.reject('Error occurred while retrieving translation result.');
      }
    });

    return deferred.promise;
  }

  resetTranslation(): void {
    this.sourceSegment = '';
    this.prefix = '';
  }

  updatePrefix(prefix: string): string[] {
    if (this.engine == null || this.session == null) {
      return [];
    }

    if (this.prefix === prefix) {
      return this.session.currentSuggestion;
    }

    this.prefix = prefix;
    return this.session.updatePrefix(prefix);
  }

  getCurrentSuggestion(): string[] {
    if (this.engine == null || this.session == null) {
      return [];
    }

    return this.session.currentSuggestion;
  }

  trainSegment(): angular.IPromise<void> {
    if (this.engine == null || this.session == null) {
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

  getSuggestionTextInsertion(suggestionIndex?: number): {deleteLength: number, insertText: string} {
    if (this.engine == null || this.session == null) {
      return { deleteLength: 0, insertText: '' };
    }

    return this.session.getSuggestionTextInsertion(suggestionIndex);
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
    if (this.engine == null) {
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
    if (this.engine == null) {
      return this.$q.resolve();
    }

    const deferred = this.$q.defer<void>();
    this.engine.listenForTrainingStatus(progress => {
      this.$rootScope.$apply(scope => onStatusUpdate(progress));
    }, success => {
      if (success) {
        deferred.resolve();
      } else {
        deferred.reject('Error occurred while listening for training status.');
      }
    });

    return deferred.promise;
  }
}
