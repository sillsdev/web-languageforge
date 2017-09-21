import { InteractiveTranslationSession, Range, SegmentTokenizer, SmtTrainProgress, TranslationEngine } from 'machine';
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

  initialise(projectId: string, isScripture: boolean): void {
    this.engine = new TranslationEngine(location.origin + '/machine', projectId);
    const segmentType = isScripture ? 'line' : 'latin';
    this.sourceSegmentTokenizer = new SegmentTokenizer(segmentType);
    this.targetSegmentTokenizer = new SegmentTokenizer(segmentType);
  }

  translateInteractively(sourceSegment: string, confidenceThreshold: number, callback?: () => void): void {
    if (this.engine == null) {
      return;
    }

    this.prefix = '';
    if (this.sourceSegment === sourceSegment && this.confidenceThreshold === confidenceThreshold) {
      if (callback != null) {
        callback();
      }
      return;
    }

    this.sourceSegment = sourceSegment;
    this.confidenceThreshold = confidenceThreshold;
    this.engine.translateInteractively(sourceSegment, confidenceThreshold, newSession => {
      this.session = newSession;
      if (callback != null) {
        callback();
      }
    });
  }

  train(onStatusUpdate: (progress: SmtTrainProgress) => void, onFinished: (success: boolean) => void): void {
    if (this.engine == null) {
      return;
    }

    this.engine.train(onStatusUpdate, onFinished);
  }

  listenForTrainingStatus(onStatusUpdate: (progress: SmtTrainProgress) => void,
                          onFinished: (success: boolean) => void): void {
    if (this.engine == null) {
      return;
    }

    this.engine.listenForTrainingStatus(onStatusUpdate, onFinished);
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

  trainSegment(callback: (success: boolean) => void): void {
    if (this.engine == null || this.session == null) {
      return;
    }

    this.session.approve(callback);
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
}
