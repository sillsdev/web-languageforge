import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { UtilityService } from '../app/core/utility.service';

export class Notice {
    cannotClose: boolean;

    constructor(public type: string, public message: string, public id: string, public details: string, public showDetails: boolean) {}

    toggleDetails() {
        this.showDetails = !this.showDetails;
    }
}

@Injectable({
    providedIn: 'root',
})
export class NoticeService {
    static readonly ERROR: string = 'danger';
    static readonly WARN: string = 'warning';
    static readonly INFO: string = 'info';
    static readonly SUCCESS: string = 'success';

    private notices: Notice[] = [];
    private timers: {[id: string]: Subject<string>} = {};
    private percentComplete = 0;
    private isProgressBarShown = false;
    private isLoadingNotice = false;
    private loadingMessage: string;

    push(type: string, message: string, details?: string, cannotClose?: boolean, time?: number): string {
        const id = UtilityService.uuid();
        const obj = new Subject<string>();

        // Give a default auto-close time to success notifications of 4 seconds
        if (!time && type === NoticeService.SUCCESS) {
            time = 4 * 1000;
        }
        if (time) {
            obj.pipe(debounceTime(time)).subscribe((noteId) => {
                this.removeById(noteId);
                this.timers[noteId] = null;
            });
            obj.next(id);
            this.timers[id] = obj;
        }
        const notice = new Notice(type, message, id, details, false);

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
      }

    removeById(id: string): void {
        this.remove(this.notices.findIndex(note => note.id === id));
    }

    remove(index: number): void {
        if (index !== undefined) {
            this.notices.splice(index, 1);
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
        this.isLoadingNotice = false;
    }

    isLoading(): boolean {
        return this.isLoadingNotice;
    }
}
