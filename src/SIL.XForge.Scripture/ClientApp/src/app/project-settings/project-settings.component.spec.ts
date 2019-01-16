import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { UICommonModule } from '@xforge-common/ui-common.module';

import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { NoticeService } from '@xforge-common/notice.service';
import { of } from 'rxjs/internal/observable/of';
import { anything, instance, mock, verify, when } from 'ts-mockito';
import { SFProject } from '../core/models/sfproject';
import { SFProjectService } from '../core/sfproject.service';
import { StubQueryResults } from '../my-account/my-account.component.spec';
import { ProjectSettingsComponent } from './project-settings.component';

function clickElement(element: HTMLElement | DebugElement, fixture: ComponentFixture<ProjectSettingsComponent>): void {
  if (element instanceof DebugElement) {
    element = (element as DebugElement).nativeElement as HTMLElement;
  }

  element.click();
  fixture.detectChanges();
  flush();
}

class TestProject extends SFProject {
  static readonly TYPE = 'project';

  constructor(init?: Partial<SFProject>) {
    super(init);
  }
}

class TestEnvironment {
  component: ProjectSettingsComponent;
  fixture: ComponentFixture<ProjectSettingsComponent>;
  mockedSFProjectService = mock(SFProjectService);
  constructor() {
    const mockedActivatedRoute = mock(ActivatedRoute);
    const mockedNoticeService = mock(NoticeService);

    when(mockedActivatedRoute.params).thenReturn(of({}));
    when(this.mockedSFProjectService.onlineGet(anything())).thenReturn(
      of(
        new StubQueryResults(
          new TestProject({
            checkingConfig: { enabled: false },
            translateConfig: { enabled: true }
          })
        )
      )
    );
    when(this.mockedSFProjectService.onlineUpdateAttributes(anything(), anything())).thenCall(() => Promise.resolve());
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, UICommonModule],
      declarations: [ProjectSettingsComponent],
      providers: [
        { provide: ActivatedRoute, useFactory: () => instance(mockedActivatedRoute) },
        { provide: SFProjectService, useFactory: () => instance(this.mockedSFProjectService) },
        { provide: NoticeService, useFactory: () => instance(mockedNoticeService) }
      ]
    }).compileComponents();
    this.fixture = TestBed.createComponent(ProjectSettingsComponent);
    this.component = this.fixture.componentInstance;
    this.fixture.detectChanges();
  }
}

describe('ProjectSettingsComponent', () => {
  let env: TestEnvironment;
  describe('Tasks', () => {
    beforeEach(async(() => {
      env = new TestEnvironment();
    }));

    it('should select Community Checking and submit update when clicked', fakeAsync(() => {
      const communitycb = env.fixture.debugElement.query(By.css('#checkbox-community-checking'));
      expect(communitycb).toBeDefined();
      expect(communitycb.nativeElement).toBeDefined();
      const inputelem = <HTMLInputElement>communitycb.nativeElement.querySelector('input');
      expect(inputelem.checked).toBeDefined();
      expect(inputelem.checked).toBeFalsy();
      clickElement(inputelem, env.fixture);
      expect(inputelem.checked).toBeTruthy();
      verify(env.mockedSFProjectService.onlineUpdateAttributes(anything(), anything())).times(1);
    }));

    it('unchecking the last task should report error and not send an update', fakeAsync(() => {
      // prove error div is absent
      expect(env.fixture.debugElement.query(By.css('#invalid-feedback'))).toBeNull();
      const translationcb = env.fixture.debugElement.query(By.css('#checkbox-translating'));
      const communitycb = env.fixture.debugElement.query(By.css('#checkbox-community-checking'));
      expect(translationcb).toBeDefined();
      expect(translationcb.nativeElement).toBeDefined();
      let inputelem = <HTMLInputElement>communitycb.nativeElement.querySelector('input');
      expect(inputelem.checked).toBeDefined();
      expect(inputelem.checked).toBeFalsy();
      inputelem = <HTMLInputElement>translationcb.nativeElement.querySelector('input');
      expect(inputelem.checked).toBeDefined();
      expect(inputelem.checked).toBeTruthy();
      clickElement(inputelem, env.fixture);
      expect(inputelem.checked).toBeFalsy();
      // error div should now be present
      expect(env.fixture.debugElement.query(By.css('#invalid-feedback'))).toBeDefined();
      verify(env.mockedSFProjectService.onlineUpdateAttributes(anything(), anything())).never();
    }));

    it('changing state of task option results in status icon', fakeAsync(() => {
      // prove 'changes submitted' elements are absent
      expect(env.fixture.debugElement.query(By.css('#checking-update-done'))).toBeNull();
      expect(env.fixture.debugElement.query(By.css('#translation-update-done'))).toBeNull();
      const translationcb = env.fixture.debugElement.query(By.css('#checkbox-translating'));
      const communitycb = env.fixture.debugElement.query(By.css('#checkbox-community-checking'));
      expect(translationcb).toBeDefined();
      expect(translationcb.nativeElement).toBeDefined();
      let inputelem = <HTMLInputElement>communitycb.nativeElement.querySelector('input');
      expect(inputelem.checked).toBeDefined();
      expect(inputelem.checked).toBeFalsy();
      clickElement(inputelem, env.fixture);
      inputelem = <HTMLInputElement>translationcb.nativeElement.querySelector('input');
      expect(inputelem.checked).toBeDefined();
      expect(inputelem.checked).toBeTruthy();
      clickElement(inputelem, env.fixture);
      // 'changes submitted' elements should now be present
      expect(env.fixture.debugElement.query(By.css('#checking-update-done'))).toBeDefined();
      expect(env.fixture.debugElement.query(By.css('#translation-update-done'))).toBeDefined();
    }));

    it('error on data submit shows error icon', fakeAsync(() => {
      // prove 'error status' elements are absent
      expect(env.fixture.debugElement.query(By.css('#checking-error-icon'))).toBeNull();
      const communitycb = env.fixture.debugElement.query(By.css('#checkbox-community-checking'));
      expect(communitycb).toBeDefined();
      expect(communitycb.nativeElement).toBeDefined();
      const inputelem = <HTMLInputElement>communitycb.nativeElement.querySelector('input');
      expect(inputelem.checked).toBeDefined();
      expect(inputelem.checked).toBeFalsy();
      when(env.mockedSFProjectService.onlineUpdateAttributes(anything(), anything())).thenReject();
      clickElement(inputelem, env.fixture);
      // 'error status' elements should now be present
      expect(env.fixture.debugElement.query(By.css('#checking-error-icon'))).toBeDefined();
    }));
  });
});
