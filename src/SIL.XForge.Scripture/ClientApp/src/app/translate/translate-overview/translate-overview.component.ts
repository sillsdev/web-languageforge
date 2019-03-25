import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { switchMap, tap } from 'rxjs/operators';

import { NoticeService } from 'xforge-common/notice.service';
import { SubscriptionDisposable } from 'xforge-common/subscription-disposable';
import { Text } from '../../core/models/text';
import { TextData, TextDataId } from '../../core/models/text-data';
import { SFProjectService } from '../../core/sfproject.service';
import { TextService } from '../../core/text.service';

@Component({
  selector: 'app-translate-overview',
  templateUrl: './translate-overview.component.html',
  styleUrls: ['./translate-overview.component.scss']
})
export class TranslateOverviewComponent extends SubscriptionDisposable implements OnInit {
  texts: Text[];

  private _isLoading = true;
  private projectId: string;
  private progressByBook: { [bookId: string]: number };

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

  ngOnInit() {
    this.noticeService.loadingStarted();
    this.subscribe(
      this.activatedRoute.params.pipe(
        tap(params => {
          this.projectId = params['projectId'];
        }),
        switchMap(() => this.projectService.getTexts(this.projectId))
      ),
      data => {
        this.texts = [];
        this.progressByBook = {};
        for (const text of data) {
          this.texts.push(text);
          this.progressByBook[text.bookId] = -1;
        }
        this.calculateProgress();
      }
    );
  }

  async calculateProgress(): Promise<void> {
    for (const book of this.texts) {
      this.progressByBook[book.bookId] = await this.getBookProgress(book);
    }
    this._isLoading = false;
    this.noticeService.loadingFinished();
  }

  getTranslationProgress(text: Text): number {
    if (this.progressByBook) {
      return this.progressByBook[text.bookId];
    }
  }

  async getBookProgress(text: Text): Promise<number> {
    let totalVerse = 0;
    let translatedVerses = 0;
    for (const chapter of text.chapters) {
      const textId = new TextDataId(text.id, chapter.number);
      const chapterText = await this.textService.connect(textId);
      totalVerse += chapter.lastVerse;
      translatedVerses += chapter.lastVerse - chapterText.getEmptyVerses();
      // Using disconnect fails, and I'm not sure why.
      // await this.textService.disconnect(chapterText);
    }
    return translatedVerses / totalVerse;
  }
}
