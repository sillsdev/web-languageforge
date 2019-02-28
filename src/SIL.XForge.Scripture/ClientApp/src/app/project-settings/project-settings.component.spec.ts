import { OverlayContainer } from '@angular-mdc/web';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DebugElement, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { RecordIdentity } from '@orbit/data';
import { of } from 'rxjs';
import { anything, instance, mock, verify, when } from 'ts-mockito';

import { AuthService } from 'xforge-common/auth.service';
import { QueryResults } from 'xforge-common/json-api.service';
import { Resource } from 'xforge-common/models/resource';
import { UICommonModule } from 'xforge-common/ui-common.module';
import { SFProject } from '../core/models/sfproject';
import { SFProjectService } from '../core/sfproject.service';
import { DeleteProjectDialogComponent } from './delete-project-dialog/delete-project-dialog.component';
import { ProjectSettingsComponent } from './project-settings.component';

export class StubQueryResults<T> implements QueryResults<T> {
  constructor(public readonly data: T, public readonly totalPagedCount?: number) {}

  getIncluded<TInclude extends Resource>(_identity: RecordIdentity): TInclude {
    return null;
  }

  getManyIncluded<TInclude extends Resource>(_identities: RecordIdentity[]): TInclude[] {
    return null;
  }
}

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

  describe('Danger Zone', () => {
    beforeEach(async(() => (env = new TestEnvironment())));

    it('should display Danger Zone', fakeAsync(() => {
      expect(env.dangerZoneTitle.textContent).toContain('Danger Zone');
      expect(env.deleteProjectButton.textContent).toContain('Delete this project');
    }));

    it('should delete project if user confirms on the dialog', fakeAsync(() => {
      env.clickElement(env.deleteProjectButton);
      expect(env.deleteDialog).toBeDefined();
      env.confirmDialog(true);
      verify(env.mockedSFProjectService.onlineDelete(anything())).once();
    }));

    it('should not delete project if user cancels', fakeAsync(() => {
      env.clickElement(env.deleteProjectButton);
      expect(env.deleteDialog).toBeDefined();
      env.confirmDialog(false);
      verify(env.mockedSFProjectService.onlineDelete(anything())).never();
    }));
  });
});

class TestProject extends SFProject {
  static readonly TYPE = 'project';

  constructor(init?: Partial<SFProject>) {
    super(init);
    this.projectName = 'project01';
  }
}

class TestEnvironment {
  component: ProjectSettingsComponent;
  fixture: ComponentFixture<ProjectSettingsComponent>;
  overlayContainer: OverlayContainer;
  mockedSFProjectService: SFProjectService;
  mockedRouter: Router;
  mockedActivatedRoute: ActivatedRoute;
  mockedAuthService: AuthService;
  constructor() {
    this.mockedSFProjectService = mock(SFProjectService);
    this.mockedActivatedRoute = mock(ActivatedRoute);
    this.mockedRouter = mock(Router);
    this.mockedAuthService = mock(AuthService);
    when(this.mockedActivatedRoute.params).thenReturn(of({}));
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
    when(this.mockedSFProjectService.onlineDelete(anything())).thenResolve();
    when(this.mockedRouter.navigateByUrl(anything())).thenResolve(true);
    TestBed.configureTestingModule({
      imports: [DialogTestModule, HttpClientTestingModule, UICommonModule],
      declarations: [ProjectSettingsComponent],
      providers: [
        { provide: ActivatedRoute, useFactory: () => instance(this.mockedActivatedRoute) },
        { provide: Router, useFactory: () => instance(this.mockedRouter) },
        { provide: SFProjectService, useFactory: () => instance(this.mockedSFProjectService) },
        { provide: AuthService, useFactory: () => instance(this.mockedAuthService) }
      ],
      // The RouterTestingModule is needed to test routerLink in the html, but this is causing an
      // error with RouterLinkWithHref, so this allows us to skip using the RouterTestingModule.
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
    this.fixture = TestBed.createComponent(ProjectSettingsComponent);
    this.component = this.fixture.componentInstance;
    this.fixture.detectChanges();
    this.overlayContainer = TestBed.get(OverlayContainer);
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

  get dangerZoneTitle(): HTMLElement {
    return this.fixture.nativeElement.querySelector('#danger-zone h2');
  }

  get deleteProjectButton(): HTMLElement {
    return this.fixture.nativeElement.querySelector('#delete-btn');
  }

  get deleteDialog(): HTMLElement {
    const oce = this.overlayContainer.getContainerElement();
    return oce.querySelector('mdc-dialog');
  }

  get confirmDeleteBtn(): HTMLElement {
    const oce = this.overlayContainer.getContainerElement();
    return oce.querySelector('#project-delete-btn');
  }

  get cancelDeleteBtn(): HTMLElement {
    const oce = this.overlayContainer.getContainerElement();
    return oce.querySelector('#cancel-btn');
  }

  confirmDialog(confirm: boolean): void {
    let button: HTMLElement;
    const oce = this.overlayContainer.getContainerElement();
    if (confirm) {
      const projectInput: HTMLInputElement = oce.querySelector('#project-entry').querySelector('input');
      projectInput.value = this.component.project.projectName;
      projectInput.dispatchEvent(new Event('input'));
      button = this.confirmDeleteBtn;
    } else {
      button = this.cancelDeleteBtn;
    }
    this.fixture.detectChanges();
    tick();
    this.clickElement(button);
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

@NgModule({
  imports: [UICommonModule],
  declarations: [DeleteProjectDialogComponent],
  entryComponents: [DeleteProjectDialogComponent],
  exports: [DeleteProjectDialogComponent]
})
class DialogTestModule {}
