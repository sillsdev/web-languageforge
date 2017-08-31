import { InteractiveTranslationSession, Range, SentenceTokenizer, SmtTrainProgress, TranslationEngine } from 'machine';
import { RangeStatic } from 'quill';

export class MachineService {
  private readonly segmentTokenizer: SentenceTokenizer = new SentenceTokenizer();
  private engine: TranslationEngine;
  private session: InteractiveTranslationSession;
  private sourceSegment: string = '';
  private prefix: string = '';
  private confidenceThreshold: number = -1;

  // SIL.Machine.Translation.TranslationEngine.ctor(baseUrl, projectId)
  initialise(projectId: string): void {
    this.engine = new TranslationEngine(location.origin + '/machine', projectId);
  }

  // SIL.Machine.Translation.TranslationEngine.translateInteractively(sourceSegment,
  //    confidenceThreshold, onFinished)
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

  // SIL.Machine.Translation.TranslationEngine.train(onStatusUpdate, onFinished)
  train(onStatusUpdate: (progress: SmtTrainProgress) => void, onFinished: (success: boolean) => void): void {
    if (this.engine == null) {
      return;
    }

    this.engine.train(onStatusUpdate, onFinished);
  }

  // SIL.Machine.Translation.TranslationEngine.listenForTrainingStatus(onStatusUpdate, onFinished)
  listenForTrainingStatus(onStatusUpdate: (progress: SmtTrainProgress) => void,
                          onFinished: (success: boolean) => void): void {
    if (this.engine == null) {
      return;
    }

    this.engine.listenForTrainingStatus(onStatusUpdate, onFinished);
  }

  // SIL.Machine.Translation.InteractiveTranslationSession.updatePrefix(prefix)
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

  // SIL.Machine.Translation.InteractiveTranslationSession.approve(onFinished)
  trainSegment(callback: (success: boolean) => void): void {
    if (this.engine == null || this.session == null) {
      return;
    }

    this.session.approve(callback);
  }

  getSuggestionText(suggestionIndex?: number): string {
    if (this.engine == null || this.session == null) {
      return '';
    }

    return this.session.getSuggestionText(suggestionIndex);
  }

  tokenizeDocumentText(text: string): RangeStatic[] {
    return this.segmentTokenizer.tokenize(text) as RangeStatic[];
  }
}
