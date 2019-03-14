import { MdcSelect, OverlayContainer } from '@angular-mdc/web';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DebugElement, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { anything, instance, mock, verify, when } from 'ts-mockito';
import { AuthService } from 'xforge-common/auth.service';
import { NoticeService } from 'xforge-common/notice.service';
import { ParatextService } from 'xforge-common/paratext.service';
import { UICommonModule } from 'xforge-common/ui-common.module';
import { UserService } from 'xforge-common/user.service';
import { XForgeCommonModule } from 'xforge-common/xforge-common.module';
import { SFProject } from '../core/models/sfproject';
import { SFProjectService } from '../core/sfproject.service';
import { DeleteProjectDialogComponent } from './delete-project-dialog/delete-project-dialog.component';
import { ProjectSettingsComponent } from './project-settings.component';

describe('ProjectSettingsComponent', () => {
  describe('Tasks', () => {
    it('should select Community Checking and submit update when clicked', fakeAsync(() => {
      const env = new TestEnvironment();
      expect(env.checkingInputElem.checked).toBe(false);
      env.clickElement(env.checkingInputElem);
      expect(env.checkingInputElem.checked).toBe(true);
      verify(env.mockedSFProjectService.onlineUpdateAttributes(anything(), anything())).once();
    }));

    it('unchecking the last task should report error, retick last task, and not send an update', fakeAsync(() => {
      const env = new TestEnvironment();
      // prove error div is absent
      expect(env.atLeastOneError).toBeNull();
      expect(env.checkingInputElem.checked).toBe(false);
      expect(env.translateInputElem.checked).toBe(true);
      env.clickElement(env.translateInputElem);
      expect(env.translateInputElem.checked).toBe(false);
      // error div should now be present
      expect(env.atLeastOneError).toBeDefined();
      tick(1000);
      env.fixture.detectChanges();
      expect(env.translateInputElem.checked).toBe(true);
      verify(env.mockedSFProjectService.onlineUpdateAttributes(anything(), anything())).never();
    }));

    it('changing state of task option results in status icon', fakeAsync(() => {
      const env = new TestEnvironment();
      // prove 'changes submitted' elements are absent
      expect(env.checkingStatusDone).toBeNull();
      expect(env.translateStatusDone).toBeNull();
      expect(env.checkingInputElem.checked).toBe(false);
      env.clickElement(env.checkingInputElem);
      expect(env.translateInputElem.checked).toBe(true);
      env.clickElement(env.translateInputElem);
      // 'changes submitted' elements should now be present
      expect(env.checkingStatusDone).toBeDefined();
      expect(env.translateStatusDone).toBeDefined();
    }));

    it('error on data submit shows error icon', fakeAsync(() => {
      const env = new TestEnvironment();
      // prove 'error status' elements are absent
      expect(env.checkingStatusError).toBeNull();
      expect(env.checkingInputElem.checked).toBe(false);
      when(env.mockedSFProjectService.onlineUpdateAttributes(anything(), anything())).thenReject();
      env.clickElement(env.checkingInputElem);
      // 'error status' elements should now be present
      expect(env.checkingStatusError).toBeDefined();
    }));

    it('should hide Based On when translate task is disabled', fakeAsync(() => {
      const env = new TestEnvironment();
      env.wait();
      env.clickElement(env.checkingInputElem);
      expect(env.checkingInputElem.checked).toBe(true);
      expect(env.translateInputElem.checked).toBe(true);
      expect(env.basedOn).toBeDefined();
      expect(env.basedOn.nativeElement.textContent).toContain('ParatextP1');
      env.clickElement(env.translateInputElem);
      expect(env.translateInputElem.checked).toBe(false);
      expect(env.basedOn).toBeNull();
    }));

    it('should change Based On select value', fakeAsync(() => {
      const env = new TestEnvironment();
      env.wait();
      expect(env.translateInputElem.checked).toBe(true);
      expect(env.basedOn).toBeDefined();
      expect(env.basedOn.nativeElement.textContent).toContain('ParatextP1');
      verify(env.mockedSFProjectService.onlineUpdateAttributes(anything(), anything())).never();
      env.setSelectValue(env.basedOnSelect, 'paratextId02');
      expect(env.basedOn.nativeElement.textContent).toContain('ParatextP2');
      verify(env.mockedSFProjectService.onlineUpdateAttributes(anything(), anything())).once();
    }));
  });

  describe('Danger Zone', () => {
    it('should display Danger Zone', fakeAsync(() => {
      const env = new TestEnvironment();
      expect(env.dangerZoneTitle.textContent).toContain('Danger Zone');
      expect(env.deleteProjectButton.textContent).toContain('Delete this project');
      flush();
    }));

    it('should delete project if user confirms on the dialog', fakeAsync(() => {
      const env = new TestEnvironment();
      env.clickElement(env.deleteProjectButton);
      expect(env.deleteDialog).toBeDefined();
      env.confirmDialog(true);
      verify(env.mockedUserService.updateCurrentProjectId()).once();
      verify(env.mockedSFProjectService.onlineDelete(anything())).once();
    }));

    it('should not delete project if user cancels', fakeAsync(() => {
      const env = new TestEnvironment();
      env.clickElement(env.deleteProjectButton);
      expect(env.deleteDialog).toBeDefined();
      env.confirmDialog(false);
      verify(env.mockedUserService.updateCurrentProjectId()).never();
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

  mockedActivatedRoute: ActivatedRoute = mock(ActivatedRoute);
  mockedAuthService: AuthService = mock(AuthService);
  mockedParatextService: ParatextService = mock(ParatextService);
  mockedSFProjectService: SFProjectService = mock(SFProjectService);
  mockedNoticeService: NoticeService = mock(NoticeService);
  mockedUserService: UserService = mock(UserService);

  constructor() {
    when(this.mockedActivatedRoute.params).thenReturn(of({ projectId: 'project01' }));
    when(this.mockedParatextService.getProjects()).thenReturn(
      of([
        {
          paratextId: 'paratextId01',
          name: 'ParatextP1',
          languageTag: 'qaa',
          languageName: 'unspecified',
          isConnectable: true
        },
        {
          paratextId: 'paratextId02',
          name: 'ParatextP2',
          languageTag: 'qaa',
          languageName: 'unspecified',
          isConnectable: true
        }
      ])
    );
    when(this.mockedSFProjectService.onlineGet(anything())).thenReturn(
      of(
        new TestProject({
          checkingConfig: { enabled: false },
          translateConfig: { enabled: true, sourceParatextId: 'paratextId01' }
        })
      )
    );
    when(this.mockedSFProjectService.onlineUpdateAttributes(anything(), anything())).thenCall(() => Promise.resolve());
    when(this.mockedSFProjectService.onlineDelete(anything())).thenResolve();
    when(this.mockedUserService.updateCurrentProjectId(anything())).thenResolve();
    TestBed.configureTestingModule({
      imports: [DialogTestModule, HttpClientTestingModule, UICommonModule, XForgeCommonModule],
      declarations: [ProjectSettingsComponent],
      providers: [
        { provide: ActivatedRoute, useFactory: () => instance(this.mockedActivatedRoute) },
        { provide: AuthService, useFactory: () => instance(this.mockedAuthService) },
        { provide: ParatextService, useFactory: () => instance(this.mockedParatextService) },
        { provide: SFProjectService, useFactory: () => instance(this.mockedSFProjectService) },
        { provide: UserService, useFactory: () => instance(this.mockedUserService) }
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

  get atLeastOneError(): DebugElement {
    return this.fixture.debugElement.query(By.css('#invalid-feedback'));
  }

  get checkingCb(): DebugElement {
    return this.fixture.debugElement.query(By.css('#checkbox-community-checking'));
  }

  get checkingInputElem(): HTMLInputElement {
    return this.checkingCb.nativeElement.querySelector('input') as HTMLInputElement;
  }

  get checkingStatus(): DebugElement {
    return this.fixture.debugElement.query(By.css('#checking-status'));
  }

  get checkingStatusDone(): HTMLInputElement {
    return this.checkingStatus.nativeElement.querySelector('.check-icon') as HTMLInputElement;
  }

  get checkingStatusError(): HTMLInputElement {
    return this.checkingStatus.nativeElement.querySelector('.error-icon') as HTMLInputElement;
  }

  get translateCb(): DebugElement {
    return this.fixture.debugElement.query(By.css('#checkbox-translate'));
  }

  get translateInputElem(): HTMLInputElement {
    return this.translateCb.nativeElement.querySelector('input') as HTMLInputElement;
  }

  get translateStatus(): DebugElement {
    return this.fixture.debugElement.query(By.css('#translate-status'));
  }

  get translateStatusDone(): HTMLInputElement {
    return this.translateStatus.nativeElement.querySelector('.check-icon') as HTMLInputElement;
  }

  get basedOn(): DebugElement {
    return this.fixture.debugElement.query(By.css('#based-on-select'));
  }

  get basedOnSelect(): MdcSelect {
    return this.basedOn.componentInstance;
  }

  get dangerZoneTitle(): HTMLElement {
    return this.fixture.nativeElement.querySelector('#danger-zone h3');
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
    tick();
  }

  clickElement(element: HTMLElement | DebugElement): void {
    if (element instanceof DebugElement) {
      element = (element as DebugElement).nativeElement as HTMLElement;
    }
    element.click();
    this.fixture.detectChanges();
    tick(1000);
  }

  setSelectValue(select: MdcSelect, value: string): void {
    select.setSelectionByValue(value);
    this.wait();
  }

  wait(): void {
    this.fixture.detectChanges();
    flush();
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
