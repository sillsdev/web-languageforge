declare module SIL.Machine.Translation {
    export class SmtTrainProgress {
        readonly currentStep: number;
        readonly currentStepMessage: string;
        readonly stepCount: number;
        readonly percentCompleted: number;
    }

    export class InteractiveTranslationSession {
        readonly sourceSegment: string[];
        confidenceThreshold: number;
        readonly prefix: string[];
        readonly isLastWordComplete: boolean;
        readonly currentSuggestion: string[];
        updatePrefix(prefix: string): string[];
        updateSuggestion(): void;
        approve(onFinished: { (arg: boolean): void }): void;
    }

    export class TranslationEngine {
        constructor(baseUrl: string, projectId: string);
        translateInteractively(sourceSegment: string, confidenceThreshold: number,
            onFinished: { (arg: SIL.Machine.Translation.InteractiveTranslationSession): void }): void;
        train(onStatusUpdate: { (arg: SIL.Machine.Translation.SmtTrainProgress): void },
            onFinished: { (arg: boolean): void }): void;
        listenForTrainingStatus(onStatusUpdate: { (arg: SIL.Machine.Translation.SmtTrainProgress): void },
            onFinished: { (arg: boolean): void }): void;
        tokenizeSourceSegment(sourceSegment: string): number[];
        tokenizeTargetSegment(targetSegment: string): number[];
        tokenizeSourceDocument(sourceDocument: string): number[];
        tokenizeTargetDocument(targetDocument: string): number[];
    }
}