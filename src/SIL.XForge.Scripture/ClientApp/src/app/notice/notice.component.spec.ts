import { Component } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { Notice, NoticeService } from '@xforge-common/notice.service';
import { NoticeComponent } from './notice.component';

@Component({
    template:  `
    <app-notice></app-notice>
    <button (click)="addOneOfEach()"><button>`
})
class TestHostComponent {

    constructor(private noticeService: NoticeService) { }

    get allNotices() { return this.noticeService.get(); }

    pushNotice(type: string, message: string): void {
        this.noticeService.push(type, message);
    }

    addOneOfEach(): void {
        this.pushNotice(NoticeService.SUCCESS, 'This is a success notice');
        this.pushNotice(NoticeService.WARN, 'This is a warning notice');
        this.pushNotice(NoticeService.ERROR, 'This is a error notice');
        this.pushNotice(NoticeService.INFO, 'This is an info notice');
    }

    addLoadingNotice(): void {
        this.noticeService.setLoading('This is a loading notice');
    }
}

describe('NoticeComponent', () => {
    let fixture: ComponentFixture<TestHostComponent>;
    let testHost: TestHostComponent;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ NoticeComponent, TestHostComponent ],
            imports: [
                NgbModule
            ],
            providers: [ NoticeService ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TestHostComponent);
        testHost = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should display one notice', async(() =>  {
        testHost.pushNotice(NoticeService.INFO, 'This is an info notice');
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('.alert-text').textContent).toContain('This is an info notice');
    }));

    it('details should display as instructed', async(() => {
        testHost.pushNotice(NoticeService.INFO, 'This is an info notice');
        fixture.detectChanges();
        expect(testHost.allNotices[0].details).toBeFalsy();
        testHost.allNotices[0].details = 'Some information about this notice';
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('a').textContent).toContain('Click for details');
        expect(testHost.allNotices[0].showDetails).toBeFalsy();
        fixture.nativeElement.querySelector('a').click();
        expect(testHost.allNotices[0].showDetails).toBeTruthy();
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('pre').textContent).toContain('Some information about this notice');
    }));

    it('should display loading message', async(() => {
        expect(fixture.nativeElement.querySelector('.loading-alert')).toBeNull();
        testHost.addLoadingNotice();
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('.loading-alert').querySelector('b').textContent).toContain('This is a loading notice');
    }));

    it('should display four notices', async(() => {
        fixture.nativeElement.querySelector('button').click();
        fixture.detectChanges();
        expect(testHost.allNotices.length).toEqual(4);
        const notices = fixture.nativeElement.querySelector('.notices').children;
        expect(notices[0].querySelector('.alert-text').textContent).toContain('success');
        expect(notices[1].querySelector('.alert-text').textContent).toContain('warning');
        expect(notices[2].querySelector('.alert-text').textContent).toContain('error');
        expect(notices[3].querySelector('.alert-text').textContent).toContain('info');
    }));
});
