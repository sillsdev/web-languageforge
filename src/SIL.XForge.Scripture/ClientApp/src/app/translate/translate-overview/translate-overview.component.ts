import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RemoteTranslationEngine } from '@sillsdev/machine';
import { Subscription } from 'rxjs';
import { filter, map, repeat, switchMap, tap } from 'rxjs/operators';
import { NoticeService } from 'xforge-common/notice.service';
import { SubscriptionDisposable } from 'xforge-common/subscription-disposable';
import { Text } from '../../core/models/text';
import { TextDataId } from '../../core/models/text-data';
import { SFProjectService } from '../../core/sfproject.service';
import { TextService } from '../../core/text.service';

const ENGINE_QUALITY_STAR_COUNT = 3;

class Progress {
  translated: number = 0;
  blank: number = 0;

  get total(): number {
    return this.translated + this.blank;
  }

  get percentage(): number {
    return Math.round((this.translated / this.total) * 100);
  }
}

interface TextInfo {
  text: Text;
  progress: Progress;
}

@Component({
  selector: 'app-translate-overview',
  templateUrl: './translate-overview.component.html',
  styleUrls: ['./translate-overview.component.scss']
})
export class TranslateOverviewComponent extends SubscriptionDisposable implements OnInit, OnDestroy {
  texts: TextInfo[];
  overallProgress = new Progress();
  trainingPercentage: number = 0;
  isTraining: boolean = false;
  readonly engineQualityStars: number[];
  engineQuality: number = 0;
  engineConfidence: number = 0;
  trainedSegmentCount: number = 0;

  private _isLoading = true;
  private trainingSubscription: Subscription;
  private translationEngine: RemoteTranslationEngine;

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly noticeService: NoticeService,
    private readonly projectService: SFProjectService,
    private readonly textService: TextService
  ) {
    super();
    this.engineQualityStars = [];
    for (let i = 0; i < ENGINE_QUALITY_STAR_COUNT; i++) {
      this.engineQualityStars.push(i);
    }
  }

  get isLoading(): boolean {
    return this._isLoading;
  }

  ngOnInit(): void {
    this.subscribe(
      this.activatedRoute.params.pipe(
        map(params => params['projectId']),
        tap(projectId => {
          this.noticeService.loadingStarted();
          this._isLoading = true;
          this.createTranslationEngine(projectId);
        }),
        switchMap(projectId => this.projectService.getTexts(projectId))
      ),
      async texts => {
        this.texts = texts.map(t => ({ text: t, progress: new Progress() }));
        await Promise.all([this.calculateProgress(), this.updateEngineStats()]);
        this._isLoading = false;
        this.noticeService.loadingFinished();
      }
    );
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
    if (this.trainingSubscription != null) {
      this.trainingSubscription.unsubscribe();
    }
    this.noticeService.loadingFinished();
  }

  startTraining(): void {
    this.translationEngine.startTraining();
    this.trainingPercentage = 0;
    this.isTraining = true;
  }

  private async calculateProgress(): Promise<void> {
    this.overallProgress = new Progress();
    const updateTextProgressPromises: Promise<void>[] = [];
    for (const textInfo of this.texts) {
      updateTextProgressPromises.push(this.updateTextProgress(textInfo));
    }
    await Promise.all(updateTextProgressPromises);
  }

  private async updateTextProgress(textInfo: TextInfo): Promise<void> {
    for (const chapter of textInfo.text.chapters) {
      const textId = new TextDataId(textInfo.text.id, chapter.number);
      const chapterText = await this.textService.getTextData(textId);
      const { translated, blank } = chapterText.getSegmentCount();
      textInfo.progress.translated += translated;
      textInfo.progress.blank += blank;
      this.overallProgress.translated += translated;
      this.overallProgress.blank += blank;
    }
  }

  private createTranslationEngine(projectId: string): void {
    if (this.trainingSubscription != null) {
      this.trainingSubscription.unsubscribe();
    }
    this.translationEngine = this.projectService.createTranslationEngine(projectId);
    const trainingStatus$ = this.translationEngine.listenForTrainingStatus().pipe(
      tap(undefined, undefined, () => {
        this.isTraining = false;
        this.updateEngineStats();
      }),
      repeat(),
      filter(progress => progress.percentCompleted > 0)
    );
    this.trainingSubscription = trainingStatus$.subscribe(async progress => {
      this.trainingPercentage = progress.percentCompleted;
      this.isTraining = true;
    });
  }

  private async updateEngineStats(): Promise<void> {
    const stats = await this.translationEngine.getStats();

    this.engineConfidence = Math.round(stats.confidence * 100) / 100;

    const rescaledConfidence = Math.min(1.0, stats.confidence / 0.6);
    const quality = rescaledConfidence * ENGINE_QUALITY_STAR_COUNT;
    this.engineQuality = Math.round(quality * 2) / 2;

    this.trainedSegmentCount = stats.trainedSegmentCount;
  }
}
