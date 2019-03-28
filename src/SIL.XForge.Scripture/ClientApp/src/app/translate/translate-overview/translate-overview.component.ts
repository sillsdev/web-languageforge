import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { switchMap, tap } from 'rxjs/operators';

import { NoticeService } from 'xforge-common/notice.service';
import { SubscriptionDisposable } from 'xforge-common/subscription-disposable';
import { Text } from '../../core/models/text';
import { TextDataId } from '../../core/models/text-data';
import { SFProjectService } from '../../core/sfproject.service';
import { TextService } from '../../core/text.service';

interface Progress {
  translated: number;
  empty: number;
}

@Component({
  selector: 'app-translate-overview',
  templateUrl: './translate-overview.component.html',
  styleUrls: ['./translate-overview.component.scss']
})
export class TranslateOverviewComponent extends SubscriptionDisposable implements OnInit {
  texts: Text[];

  private _isLoading = true;
  private _overallProgress: Progress;
  private projectId: string;
  private progressByBook: { [bookId: string]: Progress };

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly noticeService: NoticeService,
    private readonly projectService: SFProjectService,
    private readonly textService: TextService
  ) {
    super();
  }

  get isLoading(): boolean {
    return this._isLoading;
  }

  get overallProgress(): Progress {
    return this._overallProgress;
  }

  ngOnInit() {
    this.subscribe(
      this.activatedRoute.params.pipe(
        tap(params => {
          this.projectId = params['projectId'];
          this.noticeService.loadingStarted();
          this._isLoading = true;
        }),
        switchMap(() => this.projectService.getTexts(this.projectId))
      ),
      textsInProject => {
        this.texts = textsInProject;
        this.progressByBook = {};
        for (const text of textsInProject) {
          this.progressByBook[text.bookId] = null;
        }
        this.calculateProgress().then(() => {
          this._isLoading = false;
          this.noticeService.loadingFinished();
        });
      }
    );
  }

  getTranslationProgress(text: Text): Progress {
    if (this.progressByBook) {
      return this.progressByBook[text.bookId];
    }
  }

  async getTextProgress(text: Text): Promise<Progress> {
    let totalVerse = 0;
    let translatedVerses = 0;
    let emptyVerses = 0;
    for (const chapter of text.chapters) {
      const textId = new TextDataId(text.id, chapter.number);
      const chapterText = await this.textService.connect(textId);
      totalVerse += chapter.lastVerse;
      translatedVerses += chapter.lastVerse - chapterText.emptyVerseCount;
      await this.textService.disconnect(chapterText);
    }
    emptyVerses = totalVerse - translatedVerses;
    return { translated: translatedVerses, empty: emptyVerses };
  }

  private async calculateProgress(): Promise<void> {
    this._overallProgress = { translated: 0, empty: 0 };
    for (const text of this.texts) {
      const progress = await this.getTextProgress(text);
      this._overallProgress.translated += progress.translated;
      this._overallProgress.empty += progress.empty;
      this.progressByBook[text.bookId] = progress;
    }
  }
}
