import { Component } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { Notice, NoticeService } from '@xforge-common/notice.service';

@Component({
    selector: 'app-notice',
    templateUrl: './notice.component.html',
    styleUrls: ['./notice.component.scss'],
})
export class NoticeComponent {
    issueEmail: string;

    constructor(private noticeService: NoticeService) {
        // TODO: find a real place to store this email
        this.issueEmail = 'issues@scriptureforge.org';
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
