import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { UICommonModule } from '@xforge-common/ui-common.module';

import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs/internal/observable/of';
import { anything, instance, mock, verify, when } from 'ts-mockito';
import { SFProject } from '../core/models/sfproject';
import { SFProjectService } from '../core/sfproject.service';
import { StubQueryResults } from '../my-account/my-account.component.spec';
import { ProjectSettingsComponent } from './project-settings.component';

describe('ProjectSettingsComponent', () => {
  let env: TestEnvironment;
  describe('Tasks', () => {
    beforeEach(async(() => {
      env = new TestEnvironment();
    }));

    it('should select Community Checking and submit update when clicked', fakeAsync(() => {
      expect(env.communityCb).toBeDefined();
      expect(env.communityCb.nativeElement).toBeDefined();
      expect(env.communityInputElem.checked).toBeDefined();
      expect(env.communityInputElem.checked).toBe(false);
      env.clickElement(env.communityInputElem);
      expect(env.communityInputElem.checked).toBe(true);
      verify(env.mockedSFProjectService.onlineUpdateAttributes(anything(), anything())).once();
    }));

    it('unchecking the last task should report error and not send an update', fakeAsync(() => {
      // prove error div is absent
      expect(env.fixture.debugElement.query(By.css('#invalid-feedback'))).toBeNull();
      expect(env.translationCb).toBeDefined();
      expect(env.translationCb.nativeElement).toBeDefined();
      expect(env.communityInputElem.checked).toBeDefined();
      expect(env.communityInputElem.checked).toBe(false);
      expect(env.translationInputElem.checked).toBeDefined();
      expect(env.translationInputElem.checked).toBe(true);
      env.clickElement(env.translationInputElem);
      expect(env.translationInputElem.checked).toBe(false);
      // error div should now be present
      expect(env.fixture.debugElement.query(By.css('#invalid-feedback'))).toBeDefined();
      verify(env.mockedSFProjectService.onlineUpdateAttributes(anything(), anything())).never();
    }));

    it('changing state of task option results in status icon', fakeAsync(() => {
      // prove 'changes submitted' elements are absent
      expect(env.fixture.debugElement.query(By.css('#checking-update-done'))).toBeNull();
      expect(env.fixture.debugElement.query(By.css('#translation-update-done'))).toBeNull();
      expect(env.translationCb).toBeDefined();
      expect(env.translationCb.nativeElement).toBeDefined();
      expect(env.communityInputElem.checked).toBeDefined();
      expect(env.communityInputElem.checked).toBe(false);
      env.clickElement(env.communityInputElem);
      expect(env.translationInputElem.checked).toBeDefined();
      expect(env.translationInputElem.checked).toBe(true);
      env.clickElement(env.translationInputElem);
      // 'changes submitted' elements should now be present
      expect(env.fixture.debugElement.query(By.css('#checking-update-done'))).toBeDefined();
      expect(env.fixture.debugElement.query(By.css('#translation-update-done'))).toBeDefined();
    }));

    it('error on data submit shows error icon', fakeAsync(() => {
      // prove 'error status' elements are absent
      expect(env.fixture.debugElement.query(By.css('#checking-error-icon'))).toBeNull();
      expect(env.communityCb).toBeDefined();
      expect(env.communityCb.nativeElement).toBeDefined();
      expect(env.communityInputElem.checked).toBeDefined();
      expect(env.communityInputElem.checked).toBe(false);
      when(env.mockedSFProjectService.onlineUpdateAttributes(anything(), anything())).thenReject();
      env.clickElement(env.communityInputElem);
      // 'error status' elements should now be present
      expect(env.fixture.debugElement.query(By.css('#checking-error-icon'))).toBeDefined();
    }));
  });
});
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
        { provide: SFProjectService, useFactory: () => instance(this.mockedSFProjectService) }
      ]
    }).compileComponents();
    this.fixture = TestBed.createComponent(ProjectSettingsComponent);
    this.component = this.fixture.componentInstance;
    this.fixture.detectChanges();
  }

  get communityCb(): DebugElement {
    return this.fixture.debugElement.query(By.css('#checkbox-community-checking'));
  }

  get communityInputElem(): HTMLInputElement {
    return this.communityCb.nativeElement.querySelector('input') as HTMLInputElement;
  }

  get translationCb(): DebugElement {
    return this.fixture.debugElement.query(By.css('#checkbox-translating'));
  }

  get translationInputElem(): HTMLInputElement {
    return this.translationCb.nativeElement.querySelector('input') as HTMLInputElement;
  }

  clickElement(element: HTMLElement | DebugElement): void {
    if (element instanceof DebugElement) {
      element = (element as DebugElement).nativeElement as HTMLElement;
    }
    element.click();
    this.fixture.detectChanges();
    flush();
  }
}
