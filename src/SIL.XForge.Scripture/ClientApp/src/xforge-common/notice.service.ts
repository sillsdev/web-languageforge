import { Injectable } from '@angular/core';
import Orbit from '@orbit/core';
import { Observable, Subject } from 'rxjs';

export class Notice {
  cannotClose: boolean;

  constructor(
    public type: string,
    public message: string,
    public id: string,
    public details: string,
    public time: number // milliseconds until notice is automatically dismissed
  ) { }
}

@Injectable({
  providedIn: 'root',
})
export class NoticeService {
  static readonly ERROR: string = 'danger';
  static readonly WARN: string = 'warning';
  static readonly SUCCESS: string = 'success';

  private notices: Notice[] = [];
  private percentComplete = 0;
  private isProgressBarShown = false;
  private isLoadingNotice = false;
  private loadingMessage: string;
  private newActveNoticeEmitter: Subject<Notice> = new Subject<Notice>();
  private loadingStatusEmitter: Subject<boolean> = new Subject<boolean>();

  push(type: string, message: string, details?: string, time?: number): string {
    const id = Orbit.uuid();

    // Give a default auto-close time to success notifications of 4 seconds
    if (!time && type === NoticeService.SUCCESS) {
      time = 4 * 1000;
    } else if (!time && type === NoticeService.WARN && !details) {
      time = 6 * 1000;
    }

    const notice = new Notice(type, message, id, details, time);

    if (details) {
      details = details.replace(/<p>/gm, '\n');
      details = details.replace(/<pre>/gm, '\n');
      details = details.replace(/<\/p>/gm, '\n');
      details = details.replace(/<\/pre>/gm, '\n');
      details = details.replace(/<[^>]+>/gm, ''); // remove HTML
      details = details.replace(/\\\//g, '/');
      notice.details = details;
    }

    this.notices.push(notice);
    if (this.notices.length === 1) {
      this.newActveNoticeEmitter.next(notice);
    }
    return id;
  }

  onNewNoticeActive(): Observable<Notice> {
    return this.newActveNoticeEmitter.asObservable();
  }

  onLoadActivity(): Observable<boolean> {
    return this.loadingStatusEmitter.asObservable();
  }

  removeById(id: string): void {
    this.remove(this.notices.findIndex(note => note.id === id));
  }

  remove(index: number): void {
    if (index !== -1) {
      this.notices.splice(index, 1);
      if (this.notices.length > 0 && index === 0) {
        this.newActveNoticeEmitter.next(this.notices[0]);
      }
    }
  }

  get(): Notice[] {
    return this.notices;
  }

  getLoadMessage(): string {
    return this.loadingMessage;
  }

  setLoading(message: string): void {
    this.loadingMessage = message;
    if (!this.isLoadingNotice) {
      this.loadingStatusEmitter.next(true);
    }
    this.isLoadingNotice = true;
  }

  getPercentComplete(): number {
    return this.percentComplete;
  }

  setPercentComplete(percent: number): void {
    this.percentComplete = percent;
    this.isProgressBarShown = true;
  }

  cancelProgressBar(): void {
    this.isProgressBarShown = false;
  }

  showProgressBar(): boolean {
    return this.isProgressBarShown && this.percentComplete > 4;
  }

  cancelLoading(): void {
    this.loadingMessage = '';
    if (this.isLoadingNotice) {
      this.loadingStatusEmitter.next(false);
    }
    this.isLoadingNotice = false;
  }

  isLoading(): boolean {
    return this.isLoadingNotice;
  }
}
