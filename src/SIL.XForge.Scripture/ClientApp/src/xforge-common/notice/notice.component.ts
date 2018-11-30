import { Component, OnInit } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig, MatSnackBarRef } from '@angular/material';

import { Notice, NoticeService } from '@xforge-common/notice.service';
import { SubscriptionDisposable } from '@xforge-common/subscription-disposable';
import { environment } from '../../environments/environment';
import { DetailSnackBarComponent } from './detail-snack-bar.component';

@Component({
  selector: 'app-notice',
  templateUrl: './notice.component.html',
  styleUrls: ['./notice.component.scss']
})
export class NoticeComponent extends SubscriptionDisposable implements OnInit {
  loadingSnackBarRef: MatSnackBarRef<any>;
  activeSnackBarRef: MatSnackBarRef<any>;
  issueEmail: string = environment.issueEmail;

  constructor(private noticeService: NoticeService, public snackBar: MatSnackBar) {
    super();
  }

  ngOnInit() {
    this.subscribe(this.noticeService.onNewNoticeActive(), notice => this.openSnackBar(notice));
    this.subscribe(this.noticeService.onLoadActivity(), state => {
      if (state) {
        if (this.notices.length <= 0) {
          this.loadingSnackBarRef = this.snackBar.open(this.getLoadMessage());
        }
      } else if (this.loadingSnackBarRef) {
        this.loadingSnackBarRef.dismiss();
        this.loadingSnackBarRef = null;
      }
    });
  }

  openSnackBar(notice: Notice): void {
    if (notice.details) {
      this.activeSnackBarRef = this.snackBar.open(notice.message, 'Click for details', {
        duration: notice.time
      });
      const subscription = this.activeSnackBarRef.afterDismissed().subscribe(() => this.closeNotice(notice.id));
      this.activeSnackBarRef.onAction().subscribe(() => {
        // this subscription is no longer relevant if the details button was clicked
        subscription.unsubscribe();
        this.openDetailsInSnackBar(notice);
      });
    } else {
      this.activeSnackBarRef = this.snackBar.open(notice.message, undefined, {
        duration: notice.time
      });
      this.activeSnackBarRef.afterDismissed().subscribe(() => this.closeNotice(notice.id));
    }
  }

  // Opens a custom notice that supports the view of the notice details
  openDetailsInSnackBar(activeNotice: Notice): void {
    const isErrorNotice = activeNotice.type === NoticeService.ERROR;
    const config: MatSnackBarConfig = {
      data: { message: activeNotice.message, details: activeNotice.details, isError: isErrorNotice }
    };
    this.activeSnackBarRef = this.snackBar.openFromComponent(DetailSnackBarComponent, config);
    this.activeSnackBarRef.afterDismissed().subscribe(() => this.closeNotice(activeNotice.id));
  }

  closeNotice(id: string): void {
    this.noticeService.removeById(id);
  }

  notices(): Notice[] {
    return this.noticeService.get();
  }

  getLoadMessage(): string {
    return this.noticeService.getLoadMessage();
  }

  isLoading(): boolean {
    return this.noticeService.isLoading();
  }

  showProgressBar(): boolean {
    return this.noticeService.showProgressBar();
  }

  getPercentComplete(): number {
    return this.noticeService.getPercentComplete();
  }
}
