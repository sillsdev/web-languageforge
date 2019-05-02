import { OverlayContainer } from '@angular-mdc/web';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DebugElement, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { anything, instance, mock, verify, when } from 'ts-mockito';
import { AuthService } from 'xforge-common/auth.service';
import { MapQueryResults } from 'xforge-common/json-api.service';
import { ParatextProject } from 'xforge-common/models/paratext-project';
import { NoticeService } from 'xforge-common/notice.service';
import { ParatextService } from 'xforge-common/paratext.service';
import { UICommonModule } from 'xforge-common/ui-common.module';
import { UserService } from 'xforge-common/user.service';
import { XForgeCommonModule } from 'xforge-common/xforge-common.module';
import { SFProject } from '../core/models/sfproject';
import { SFProjectService } from '../core/sfproject.service';
import { DeleteProjectDialogComponent } from './delete-project-dialog/delete-project-dialog.component';
import { SettingsComponent } from './settings.component';

describe('SettingsComponent', () => {
  describe('Tasks', () => {
    it('should select Checking and then submit update when clicked', fakeAsync(() => {
      const env = new TestEnvironment();
      expect(env.inputElement(env.checkingCheckbox).checked).toBe(false);
      env.clickElement(env.inputElement(env.checkingCheckbox));
      expect(env.inputElement(env.checkingCheckbox).checked).toBe(true);
      verify(env.mockedSFProjectService.onlineUpdateAttributes(anything(), anything())).once();
    }));

    it('unchecking the last task should report error, retick last task, and not send an update', fakeAsync(() => {
      const env = new TestEnvironment();
      // prove error div is absent
      expect(env.atLeastOneError).toBeNull();
      expect(env.inputElement(env.checkingCheckbox).checked).toBe(false);
      expect(env.inputElement(env.translateCheckbox).checked).toBe(true);
      env.clickElement(env.inputElement(env.translateCheckbox));
      expect(env.inputElement(env.translateCheckbox).checked).toBe(false);
      // error div should now be present
      expect(env.atLeastOneError).toBeDefined();
      tick(1000);
      env.fixture.detectChanges();
      expect(env.inputElement(env.translateCheckbox).checked).toBe(true);
      verify(env.mockedSFProjectService.onlineUpdateAttributes(anything(), anything())).never();
    }));

    it('changing state of task option results in status icon', fakeAsync(() => {
      const env = new TestEnvironment();
      expect(env.statusDone(env.checkingStatus)).toBeNull();
      expect(env.inputElement(env.checkingCheckbox).checked).toBe(false);
      env.clickElement(env.inputElement(env.checkingCheckbox));
      expect(env.statusDone(env.checkingStatus)).toBeDefined();

      expect(env.statusDone(env.translateStatus)).toBeNull();
      expect(env.inputElement(env.translateCheckbox).checked).toBe(true);
      env.clickElement(env.inputElement(env.translateCheckbox));
      expect(env.statusDone(env.translateStatus)).toBeDefined();
    }));

    it('error on data submit shows error icon', fakeAsync(() => {
      const env = new TestEnvironment();
      // prove 'error status' elements are absent
      expect(env.statusError(env.checkingStatus)).toBeNull();
      expect(env.inputElement(env.checkingCheckbox).checked).toBe(false);
      when(env.mockedSFProjectService.onlineUpdateAttributes(anything(), anything())).thenReject();
      env.clickElement(env.inputElement(env.checkingCheckbox));
      // 'error status' elements should now be present
      expect(env.statusError(env.checkingStatus)).toBeDefined();
    }));

    describe('Translate options', () => {
      it('should see login button when Paratext account not connected', fakeAsync(() => {
        const env = new TestEnvironment();
        env.setupParatextProjects(null);
        env.wait();
        expect(env.loginButton).toBeDefined();
        expect(env.inputElement(env.translateCheckbox).disabled).toBe(true);
        expect(env.basedOnSelect).toBeNull();
      }));

      it('should hide Based On when Translate is disabled', fakeAsync(() => {
        const env = new TestEnvironment();
        env.wait();
        env.clickElement(env.inputElement(env.checkingCheckbox));
        expect(env.inputElement(env.checkingCheckbox).checked).toBe(true);
        expect(env.inputElement(env.translateCheckbox).checked).toBe(true);
        expect(env.loginButton).toBeNull();
        expect(env.basedOnSelect).toBeDefined();
        expect(env.basedOnSelect.nativeElement.textContent).toContain('ParatextP1');

        env.clickElement(env.inputElement(env.translateCheckbox));

        expect(env.inputElement(env.translateCheckbox).checked).toBe(false);
        expect(env.basedOnSelect).toBeNull();
        expect(env.loginButton).toBeNull();
      }));

      it('should retain Based On value when Translate is disabled', fakeAsync(() => {
        const env = new TestEnvironment();
        env.wait();
        env.clickElement(env.inputElement(env.checkingCheckbox));
        expect(env.inputElement(env.checkingCheckbox).checked).toBe(true);
        expect(env.inputElement(env.translateCheckbox).checked).toBe(true);
        expect(env.basedOnSelect).toBeDefined();
        expect(env.basedOnSelect.nativeElement.textContent).toContain('ParatextP1');

        env.clickElement(env.inputElement(env.translateCheckbox));

        env.wait();
        expect(env.inputElement(env.translateCheckbox).checked).toBe(false);
        expect(env.statusDone(env.translateStatus)).toBeDefined();

        env.clickElement(env.inputElement(env.translateCheckbox));

        env.wait();
        expect(env.statusDone(env.translateStatus)).toBeDefined();
        expect(env.basedOnSelect).toBeDefined();
        expect(env.basedOnSelect.nativeElement.textContent).toContain('ParatextP1');
      }));

      it('should change Based On select value', fakeAsync(() => {
        const env = new TestEnvironment();
        env.wait();
        expect(env.inputElement(env.translateCheckbox).checked).toBe(true);
        expect(env.basedOnSelect).toBeDefined();
        expect(env.basedOnSelect.nativeElement.textContent).toContain('ParatextP1');
        verify(env.mockedSFProjectService.onlineUpdateAttributes(anything(), anything())).never();

        env.setSelectValue(env.basedOnSelect, 'paratextId02');

        expect(env.basedOnSelect.nativeElement.textContent).toContain('ParatextP2');
        verify(env.mockedSFProjectService.onlineUpdateAttributes(anything(), anything())).once();
      }));

      it('should not save Translate enable if Based On not set', fakeAsync(() => {
        const env = new TestEnvironment();
        env.setupProject(
          new TestProject({
            checkingConfig: { enabled: true, usersSeeEachOthersResponses: false, share: { viaEmail: false } },
            translateConfig: { enabled: false, sourceParatextId: undefined }
          })
        );
        env.wait();
        expect(env.inputElement(env.translateCheckbox).checked).toBe(false);
        expect(env.statusNone(env.translateStatus)).toBe(true);
        expect(env.loginButton).toBeNull();
        expect(env.basedOnSelect).toBeNull();

        env.clickElement(env.inputElement(env.translateCheckbox));

        expect(env.inputElement(env.translateCheckbox).checked).toBe(true);
        expect(env.statusNone(env.translateStatus)).toBe(true);
        expect(env.loginButton).toBeNull();
        expect(env.basedOnSelect).toBeDefined();
        expect(env.basedOnSelect.nativeElement.textContent).toEqual('Based on');
        verify(env.mockedSFProjectService.onlineUpdateAttributes(anything(), anything())).never();
      }));

      it('should save Translate disable if Based On not set', fakeAsync(() => {
        const env = new TestEnvironment();
        env.setupProject(
          new TestProject({
            checkingConfig: { enabled: true, usersSeeEachOthersResponses: false, share: { viaEmail: false } },
            translateConfig: { enabled: false, sourceParatextId: undefined }
          })
        );
        env.wait();
        env.clickElement(env.inputElement(env.translateCheckbox));
        expect(env.statusNone(env.translateStatus)).toBe(true);
        verify(env.mockedSFProjectService.onlineUpdateAttributes(anything(), anything())).never();

        env.clickElement(env.inputElement(env.translateCheckbox));

        expect(env.statusDone(env.translateStatus)).toBeDefined();
        verify(env.mockedSFProjectService.onlineUpdateAttributes(anything(), anything())).once();
      }));

      it('should save Translate and Based On when Based On set', fakeAsync(() => {
        const env = new TestEnvironment();
        env.setupProject(
          new TestProject({
            checkingConfig: { enabled: true, usersSeeEachOthersResponses: false, share: { viaEmail: false } },
            translateConfig: { enabled: false, sourceParatextId: undefined }
          })
        );
        env.wait();
        env.clickElement(env.inputElement(env.translateCheckbox));
        expect(env.inputElement(env.translateCheckbox).checked).toBe(true);
        expect(env.basedOnSelect).toBeDefined();
        expect(env.statusNone(env.translateStatus)).toBe(true);
        expect(env.statusNone(env.basedOnStatus)).toBe(true);
        expect(env.basedOnSelect.nativeElement.textContent).toEqual('Based on');
        verify(env.mockedSFProjectService.onlineUpdateAttributes(anything(), anything())).never();

        env.setSelectValue(env.basedOnSelect, 'paratextId02');

        expect(env.basedOnSelect.nativeElement.textContent).toContain('ParatextP2');
        expect(env.statusDone(env.translateStatus)).toBeDefined();
        expect(env.statusDone(env.basedOnStatus)).toBeDefined();
        verify(env.mockedSFProjectService.onlineUpdateAttributes(anything(), anything())).once();
      }));
    });

    describe('Checking options', () => {
      it('should hide options when Checking is disabled', fakeAsync(() => {
        const env = new TestEnvironment();
        env.wait();
        expect(env.inputElement(env.translateCheckbox).checked).toBe(true);
        expect(env.inputElement(env.checkingCheckbox).checked).toBe(false);
        expect(env.seeOthersResponsesCheckbox).toBeNull();
        expect(env.shareViaEmailCheckbox).toBeNull();
        env.clickElement(env.inputElement(env.checkingCheckbox));
        expect(env.inputElement(env.checkingCheckbox).checked).toBe(true);
        expect(env.seeOthersResponsesCheckbox).toBeDefined();
        expect(env.shareViaEmailCheckbox).toBeDefined();
      }));

      it('changing state of checking option results in status icon', fakeAsync(() => {
        const env = new TestEnvironment();
        env.clickElement(env.inputElement(env.checkingCheckbox));
        expect(env.inputElement(env.checkingCheckbox).checked).toBe(true);

        expect(env.statusDone(env.seeOthersResponsesStatus)).toBeNull();
        env.clickElement(env.seeOthersResponsesCheckbox);
        expect(env.statusDone(env.seeOthersResponsesStatus)).toBeDefined();

        expect(env.statusDone(env.shareViaEmailStatus)).toBeNull();
        env.clickElement(env.shareViaEmailCheckbox);
        expect(env.statusDone(env.shareViaEmailStatus)).toBeDefined();
      }));
    });
  });

  describe('Danger Zone', () => {
    it('should display Danger Zone', fakeAsync(() => {
      const env = new TestEnvironment();
      expect(env.dangerZoneTitle.textContent).toContain('Danger Zone');
      expect(env.deleteProjectButton.textContent).toContain('Delete this project');
      flush();
    }));

    it('should disable Delete button while loading', fakeAsync(() => {
      const env = new TestEnvironment();
      env.wait();
      env.isLoading = true;
      env.wait();
      expect(env.deleteProjectButton).toBeDefined();
      expect(env.deleteProjectButton.disabled).toBe(true);

      env.isLoading = false;
      env.wait();
      expect(env.deleteProjectButton.disabled).toBe(false);
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
  component: SettingsComponent;
  fixture: ComponentFixture<SettingsComponent>;
  overlayContainer: OverlayContainer;

  isLoading: boolean = false;
  mockedActivatedRoute: ActivatedRoute = mock(ActivatedRoute);
  mockedAuthService: AuthService = mock(AuthService);
  mockedNoticeService: NoticeService = mock(NoticeService);
  mockedParatextService: ParatextService = mock(ParatextService);
  mockedSFProjectService: SFProjectService = mock(SFProjectService);
  mockedUserService: UserService = mock(UserService);

  private readonly project$: BehaviorSubject<MapQueryResults<SFProject>>;
  private readonly paratectProjects$: BehaviorSubject<ParatextProject[]>;

  constructor() {
    when(this.mockedActivatedRoute.params).thenReturn(of({ projectId: 'project01' }));
    when(this.mockedNoticeService.isLoading).thenCall(() => this.isLoading);
    this.paratectProjects$ = new BehaviorSubject<ParatextProject[]>([
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
    ]);
    when(this.mockedParatextService.getProjects()).thenReturn(this.paratectProjects$);
    this.project$ = new BehaviorSubject<MapQueryResults<SFProject>>(
      new MapQueryResults(
        new TestProject({
          id: 'project01',
          checkingConfig: { enabled: false, usersSeeEachOthersResponses: false, share: { viaEmail: false } },
          translateConfig: { enabled: true, sourceParatextId: 'paratextId01' }
        })
      )
    );
    when(this.mockedSFProjectService.onlineGet(anything())).thenReturn(this.project$);
    when(this.mockedSFProjectService.onlineUpdateAttributes(anything(), anything())).thenCall(() => Promise.resolve());
    when(this.mockedSFProjectService.onlineDelete(anything())).thenResolve();
    when(this.mockedUserService.updateCurrentProjectId(anything())).thenResolve();
    TestBed.configureTestingModule({
      imports: [DialogTestModule, HttpClientTestingModule, UICommonModule, XForgeCommonModule],
      declarations: [SettingsComponent],
      providers: [
        { provide: ActivatedRoute, useFactory: () => instance(this.mockedActivatedRoute) },
        { provide: AuthService, useFactory: () => instance(this.mockedAuthService) },
        { provide: NoticeService, useFactory: () => instance(this.mockedNoticeService) },
        { provide: ParatextService, useFactory: () => instance(this.mockedParatextService) },
        { provide: SFProjectService, useFactory: () => instance(this.mockedSFProjectService) },
        { provide: UserService, useFactory: () => instance(this.mockedUserService) }
      ],
      // The RouterTestingModule is needed to test routerLink in the html, but this is causing an
      // error with RouterLinkWithHref, so this allows us to skip using the RouterTestingModule.
      schemas: [NO_ERRORS_SCHEMA]
    });
    this.fixture = TestBed.createComponent(SettingsComponent);
    this.component = this.fixture.componentInstance;
    this.fixture.detectChanges();
    this.overlayContainer = TestBed.get(OverlayContainer);
  }

  get atLeastOneError(): DebugElement {
    return this.fixture.debugElement.query(By.css('#invalid-feedback'));
  }

  get translateCheckbox(): DebugElement {
    return this.fixture.debugElement.query(By.css('#checkbox-translate'));
  }

  get translateStatus(): DebugElement {
    return this.fixture.debugElement.query(By.css('#translate-status'));
  }

  get basedOnSelect(): DebugElement {
    return this.fixture.debugElement.query(By.css('#based-on-select'));
  }

  get basedOnStatus(): DebugElement {
    return this.fixture.debugElement.query(By.css('#based-on-status'));
  }

  get loginButton(): DebugElement {
    return this.fixture.debugElement.query(By.css('#btn-log-in-settings'));
  }

  get checkingCheckbox(): DebugElement {
    return this.fixture.debugElement.query(By.css('#checkbox-community-checking'));
  }

  get checkingStatus(): DebugElement {
    return this.fixture.debugElement.query(By.css('#checking-status'));
  }

  get seeOthersResponsesCheckbox(): DebugElement {
    return this.fixture.debugElement.query(By.css('#checkbox-see-others-responses'));
  }

  get seeOthersResponsesStatus(): DebugElement {
    return this.fixture.debugElement.query(By.css('#see-others-responses-status'));
  }

  get shareViaEmailCheckbox(): DebugElement {
    return this.fixture.debugElement.query(By.css('#checkbox-share-via-email'));
  }

  get shareViaEmailStatus(): DebugElement {
    return this.fixture.debugElement.query(By.css('#share-via-email-status'));
  }

  get dangerZoneTitle(): HTMLElement {
    return this.fixture.nativeElement.querySelector('#danger-zone div');
  }

  get deleteProjectButton(): HTMLButtonElement {
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

  inputElement(element: DebugElement): HTMLInputElement {
    return element.nativeElement.querySelector('input') as HTMLInputElement;
  }

  statusNone(element: DebugElement): boolean {
    return element.children.length === 0;
  }

  statusDone(element: DebugElement): HTMLElement {
    return element.nativeElement.querySelector('.check-icon') as HTMLElement;
  }

  statusError(element: DebugElement): HTMLElement {
    return element.nativeElement.querySelector('.error-icon') as HTMLElement;
  }

  setSelectValue(element: DebugElement, value: string): void {
    element.componentInstance.setSelectionByValue(value);
    this.wait();
  }

  wait(): void {
    this.fixture.detectChanges();
    flush();
    this.fixture.detectChanges();
    flush();
  }

  setupProject(project: SFProject) {
    this.project$.next(new MapQueryResults(project));
  }

  setupParatextProjects(paratextProjects: ParatextProject[]) {
    this.paratectProjects$.next(paratextProjects);
  }
}

@NgModule({
  imports: [UICommonModule],
  declarations: [DeleteProjectDialogComponent],
  entryComponents: [DeleteProjectDialogComponent],
  exports: [DeleteProjectDialogComponent]
})
class DialogTestModule {}
