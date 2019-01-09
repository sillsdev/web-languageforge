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

fdescribe('ProjectSettingsComponent', () => {
  const mockedActivatedRoute = mock(ActivatedRoute);
  const mockedSFProjectService = mock(SFProjectService);
  const mockedNoticeService = mock(NoticeService);
  when(mockedActivatedRoute.params).thenReturn(of({}));
  when(mockedSFProjectService.onlineGet(anything())).thenReturn(
    of(
      new StubQueryResults(
        new TestProject({
          checkingConfig: { enabled: false },
          translateConfig: { enabled: true }
        })
      )
    )
  );
  when(mockedSFProjectService.onlineUpdateAttributes(anything(), anything())).thenCall(() => Promise.resolve());
  let component: ProjectSettingsComponent;
  let fixture: ComponentFixture<ProjectSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, UICommonModule],
      declarations: [ProjectSettingsComponent],
      providers: [
        { provide: ActivatedRoute, useFactory: () => instance(mockedActivatedRoute) },
        { provide: SFProjectService, useFactory: () => instance(mockedSFProjectService) },
        { provide: NoticeService, useFactory: () => instance(mockedNoticeService) }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(ProjectSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  describe('Tasks', () => {
    it('should select Community Checking and submit update when clicked', fakeAsync(() => {
      const communitycb = fixture.debugElement.query(By.css('#checkbox-community-checking'));
      expect(communitycb).toBeDefined();
      expect(communitycb.nativeElement).toBeDefined();
      const inputelem = <HTMLInputElement>communitycb.nativeElement.querySelector('input');
      expect(inputelem.checked).toBeDefined();
      expect(inputelem.checked).toBeFalsy();
      clickElement(inputelem, fixture);
      expect(inputelem.checked).toBeTruthy();
      verify(mockedSFProjectService.onlineUpdateAttributes(anything(), anything())).times(1);
    }));

    it('unchecking the last task should report error and not send an update', fakeAsync(() => {
      // prove error div is absent
      expect(fixture.debugElement.query(By.css('#invalid-feedback'))).toBeNull();
      const translationcb = fixture.debugElement.query(By.css('#checkbox-translating'));
      const communitycb = fixture.debugElement.query(By.css('#checkbox-community-checking'));
      expect(translationcb).toBeDefined();
      expect(translationcb.nativeElement).toBeDefined();
      let inputelem = <HTMLInputElement>communitycb.nativeElement.querySelector('input');
      expect(inputelem.checked).toBeDefined();
      expect(inputelem.checked).toBeFalsy();
      inputelem = <HTMLInputElement>translationcb.nativeElement.querySelector('input');
      expect(inputelem.checked).toBeDefined();
      expect(inputelem.checked).toBeTruthy();
      clickElement(inputelem, fixture);
      expect(inputelem.checked).toBeFalsy();
      // error div should now be present
      expect(fixture.debugElement.query(By.css('#invalid-feedback'))).toBeDefined();
      verify(mockedSFProjectService.onlineUpdateAttributes(anything(), anything())).never();
    }));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
