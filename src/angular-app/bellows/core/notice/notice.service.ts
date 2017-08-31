import * as angular from 'angular';

import { UtilityService } from '../utility.service';

export class Notice {
  cannotClose: boolean;

  constructor(
    public type: string,
    public message: string,
    public id: string,
    public details: string,
    public showDetails: boolean
  ) {}

  toggleDetails () {
    this.showDetails = !this.showDetails;
  }
}

export class NoticeService {
  private notices: Notice[];
  private timers: { [id: string]: angular.IPromise<any>; };
  private percentComplete: number;
  private isProgressBarShown: boolean;
  private isLoadingNotice: boolean;
  private loadingMessage: string;

  static $inject: string[] = ['$interval', 'utilService'];
  constructor(private $interval: angular.IIntervalService, private util: UtilityService) {
    this.notices = [];
    this.timers = {};
    this.percentComplete = 0;
    this.isProgressBarShown = false;
    this.isLoadingNotice = false;
  }

  private getIndexById(id: string): number {
    for (let i = 0; i < this.notices.length; i++) {
      if (this.notices[i].id === id) {
        return i;
      }
    }
  }

  push(type: () => string, message: string, details?: string, cannotClose?: boolean, time?: number): string {
    let id = this.util.uuid();

    if (!time && type() === this.SUCCESS()) time = 4 * 1000;
    if (time) {
      this.timers[id] = this.$interval(() => { this.removeById(id); }, time, 1);
    }

    let notice = new Notice(type(), message, id, details, false);

    if (details) {
      details = details.replace(/<p>/gm, '\n');
      details = details.replace(/<pre>/gm, '\n');
      details = details.replace(/<\/p>/gm, '\n');
      details = details.replace(/<\/pre>/gm, '\n');
      details = details.replace(/<[^>]+>/gm, ''); // remove HTML
      details = details.replace(/\\\//g, '/');
      notice.details = details;
    }

    if (cannotClose) {
      notice.cannotClose = true;
    }

    this.notices.push(notice);
    return id;
  };

  removeById(id: string): void {
    this.remove(this.getIndexById(id));
    if (id in this.timers) {
      this.$interval.cancel(this.timers[id]);
    }
  };

  remove(index: number): void {
    if (!angular.isUndefined(index)) {
      this.notices.splice(index, 1);
    }
  };

  get(): Notice[] {
    return this.notices;
  };

  getLoadingMessage(): string {
    return this.loadingMessage;
  };

  setLoading(message: string): void {
    this.loadingMessage = message;
    this.isLoadingNotice = true;
  };

  getPercentComplete(): number {
    return this.percentComplete;
  };

  setPercentComplete(percent: number): void {
    this.percentComplete = percent;
    this.isProgressBarShown = true;
  };

  cancelProgressBar(): void {
    this.isProgressBarShown = false;
  };

  showProgressBar(): boolean {
    return this.isProgressBarShown && this.percentComplete > 4;
  };

  cancelLoading(): void {
    this.loadingMessage = '';
    this.isLoadingNotice = false;
  };

  isLoading(): boolean {
    return this.isLoadingNotice;
  };

  ERROR(): string {
    return 'danger';
  };

  WARN(): string {
    return 'warning';
  };

  INFO(): string {
    return 'info';
  };

  SUCCESS(): string {
    return 'success';
  };
}
