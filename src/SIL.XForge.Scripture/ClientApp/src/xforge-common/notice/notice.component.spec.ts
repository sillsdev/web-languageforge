import { OverlayContainer } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { Component, NgModule } from '@angular/core';
import { async, ComponentFixture, fakeAsync, flush, inject, TestBed, tick } from '@angular/core/testing';
import { MatProgressBarModule, MatSnackBarModule } from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { NoticeService } from '@xforge-common/notice.service';
import { DetailSnackBarComponent } from './detail-snack-bar.component';
import { NoticeComponent } from './notice.component';

@Component({
  template: '<app-notice></app-notice>'
})
class TestHostComponent {
  constructor(private noticeService: NoticeService) {}

  get allNotices() {
    return this.noticeService.get();
  }

  pushNotice(type: string, message: string, details?: string): void {
    this.noticeService.push(type, message, details, 500);
  }

  addLoadingNotice(): void {
    this.noticeService.setLoading('This is a loading notice');
    this.noticeService.setPercentComplete(50);
  }

  hasLoadingBar(): boolean {
    return this.noticeService.showProgressBar();
  }
}

// A test module that provides snack bar notifications
@NgModule({
  imports: [CommonModule, MatProgressBarModule, MatSnackBarModule],
  exports: [TestHostComponent, NoticeComponent, DetailSnackBarComponent],
  declarations: [TestHostComponent, NoticeComponent, DetailSnackBarComponent],
  entryComponents: [TestHostComponent, DetailSnackBarComponent]
})
class SnackBarTestModule {}

describe('NoticeComponent', () => {
  let overlayContainer: OverlayContainer;
  let overlayContainerElement: HTMLElement;
  let fixture: ComponentFixture<TestHostComponent>;
  let testHost: TestHostComponent;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [],
      imports: [NoopAnimationsModule, SnackBarTestModule],
      providers: [NoticeService]
    }).compileComponents();
  }));

  beforeEach(inject([OverlayContainer], (oc: OverlayContainer) => {
    overlayContainer = oc;
    overlayContainerElement = oc.getContainerElement();
  }));

  afterEach(() => {
    overlayContainer.ngOnDestroy();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    testHost = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should display one notice', async(() => {
    testHost.pushNotice(NoticeService.SUCCESS, 'This is a notice');
    fixture.detectChanges();
    expect(testHost.allNotices.length).toEqual(1);
    const messageElement = overlayContainerElement.querySelector('snack-bar-container');
    expect(messageElement.getAttribute('role')).toBe('alert');
    expect(messageElement.textContent).toContain('This is a notice');
  }));

  it('should provide option to view details', fakeAsync(() => {
    testHost.pushNotice(NoticeService.SUCCESS, 'This is a notice', 'Details in a Custom Snack Bar');
    expect(testHost.allNotices[0].details).toBeTruthy();
    fixture.detectChanges();
    const detailsButton: HTMLElement = overlayContainerElement.querySelector('button.mat-button');
    expect(detailsButton.textContent).toContain('Click for details');
    detailsButton.click();
    tick();
    fixture.detectChanges();
    expect(overlayContainerElement.querySelector('detail-snack-bar')).toBeDefined();
    expect(overlayContainerElement.querySelector('snack-bar-container').textContent).toContain(
      'Details in a Custom Snack Bar'
    );
    flush();
  }));

  it('should dimiss automatically after specifed duration', fakeAsync(() => {
    testHost.pushNotice(NoticeService.SUCCESS, 'Message is dismissed after 500ms');
    fixture.detectChanges();
    expect(overlayContainerElement.hasChildNodes()).toBeTruthy();
    tick(600);
    expect(overlayContainerElement.hasChildNodes()).toBeFalsy();
  }));

  it('should display the second notice after the first is dismissed', fakeAsync(() => {
    testHost.pushNotice(NoticeService.SUCCESS, 'Message 1'); // will automatically close in 0.5s
    testHost.pushNotice(NoticeService.SUCCESS, 'Message 2');
    fixture.detectChanges();
    expect(overlayContainerElement.querySelector('snack-bar-container').textContent).toContain('Message 1');
    tick(600);
    expect(overlayContainerElement.querySelector('snack-bar-container').textContent).toContain('Message 2');
    flush();
  }));

  it('should display loading message', async(() => {
    testHost.addLoadingNotice();
    fixture.detectChanges();
    expect(testHost.hasLoadingBar()).toBeTruthy();
    const progressBarNode = fixture.nativeElement.querySelector('mat-progress-bar');
    expect(progressBarNode).toBeTruthy();
    const loadElement = overlayContainerElement.querySelector('snack-bar-container');
    expect(loadElement.textContent).toContain('This is a loading notice');
  }));
});
