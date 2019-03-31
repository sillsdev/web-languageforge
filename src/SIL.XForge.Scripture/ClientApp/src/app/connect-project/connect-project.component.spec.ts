import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { AbstractControl } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RemoteTranslationEngine } from '@sillsdev/machine';
import { cold, getTestScheduler } from 'jasmine-marbles';
import { defer, of } from 'rxjs';
import { anyString, anything, deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { ParatextProject } from 'xforge-common/models/paratext-project';
import { ParatextService } from 'xforge-common/paratext.service';
import { UICommonModule } from 'xforge-common/ui-common.module';
import { UserService } from 'xforge-common/user.service';
import { SFProject } from '../core/models/sfproject';
import { SFProjectUser } from '../core/models/sfproject-user';
import { SyncJob, SyncJobState } from '../core/models/sync-job';
import { SFProjectUserService } from '../core/sfproject-user.service';
import { SFProjectService } from '../core/sfproject.service';
import { SyncJobService } from '../core/sync-job.service';
import { ConnectProjectComponent } from './connect-project.component';

describe('ConnectProjectComponent', () => {
  it('should display login button when PT projects is null', () => {
    const env = new TestEnvironment();
    when(env.mockedParatextService.getProjects()).thenReturn(of(null));
    env.fixture.detectChanges();

    expect(env.component.state).toEqual('login');
    expect(env.loginButton).not.toBeNull();
  });

  it('should display form when PT projects is empty', () => {
    const env = new TestEnvironment();
    when(env.mockedParatextService.getProjects()).thenReturn(of([]));
    env.fixture.detectChanges();

    expect(env.component.state).toEqual('input');
    expect(env.connectProjectForm).not.toBeNull();
  });

  it('should do nothing when form is invalid', fakeAsync(() => {
    const env = new TestEnvironment();
    when(env.mockedParatextService.getProjects()).thenReturn(of([]));
    env.fixture.detectChanges();

    env.clickElement(env.submitButton);

    verify(env.mockedSFProjectService.onlineCreate(anything())).never();
    verify(env.mockedSFProjectUserService.onlineCreate(anything(), anything())).never();
    verify(env.mockedRouter.navigate(anything())).never();
    expect().nothing();
  }));

  it('should display loading when getting PT projects', fakeAsync(() => {
    const env = new TestEnvironment();
    when(env.mockedParatextService.getProjects()).thenReturn(defer(() => Promise.resolve([])));
    env.fixture.detectChanges();

    expect(env.component.state).toEqual('loading');
    expect(env.loadingDiv).not.toBeNull();

    flush();
    env.fixture.detectChanges();

    expect(env.component.state).toEqual('input');
    expect(env.connectProjectForm).not.toBeNull();
  }));

  it('should join when existing project is selected', fakeAsync(() => {
    const env = new TestEnvironment();
    when(env.mockedParatextService.getProjects()).thenReturn(
      of<ParatextProject[]>([
        {
          paratextId: 'pt01',
          name: 'Target',
          languageTag: 'en',
          languageName: 'English',
          projectId: 'project01',
          isConnectable: true
        }
      ])
    );
    env.fixture.detectChanges();
    expect(env.component.state).toEqual('input');

    env.changeSelectValue(env.projectSelect, 0);

    expect(env.tasksDiv).toBeNull();

    env.clickElement(env.submitButton);

    verify(env.mockedSFProjectUserService.onlineCreate('project01', 'user01')).once();

    verify(env.mockedRouter.navigate(deepEqual(['/projects', 'project01']))).once();
  }));

  it('should create when non-existent project is selected', fakeAsync(() => {
    const env = new TestEnvironment();
    when(env.mockedParatextService.getProjects()).thenReturn(
      of<ParatextProject[]>([
        {
          paratextId: 'pt01',
          name: 'Target',
          languageTag: 'en',
          languageName: 'English',
          isConnectable: true
        },
        {
          paratextId: 'pt02',
          name: 'Source',
          languageTag: 'es',
          languageName: 'Spanish',
          isConnectable: false
        }
      ])
    );
    env.fixture.detectChanges();
    expect(env.component.state).toEqual('input');

    env.changeSelectValue(env.projectSelect, 0);
    expect(env.sourceParatextIdControl.disabled).toBe(true);
    expect(env.sourceParatextIdControl.hasError('required')).toBe(false);
    // Simulate clicking the checkbox without firing any events to prevent the error in mdc-select when
    // the form control is set with a validator
    env.checkTranslateCheckbox();
    expect(env.sourceParatextIdControl.disabled).toBe(false);

    env.changeSelectValue(env.sourceProjectSelect, 0);
    expect(env.component.connectProjectForm.valid).toBe(true);
    env.clickElement(env.submitButton);
    getTestScheduler().flush();
    flush();

    expect(env.component.state).toEqual('connecting');

    const project = new SFProject({
      projectName: 'Target',
      paratextId: 'pt01',
      inputSystem: {
        tag: 'en',
        languageName: 'English',
        abbreviation: 'en',
        isRightToLeft: false
      },
      checkingConfig: {
        enabled: true
      },
      translateConfig: {
        enabled: true,
        sourceParatextId: 'pt02',
        sourceInputSystem: {
          languageName: 'Spanish',
          tag: 'es',
          isRightToLeft: false,
          abbreviation: 'es'
        }
      }
    });
    verify(env.mockedSFProjectService.onlineCreate(deepEqual(project))).once();

    verify(env.mockedSFProjectUserService.onlineCreate('project01', 'user01')).once();

    verify(env.mockedRouter.navigate(deepEqual(['/projects', 'project01']))).once();
  }));

  it('should do nothing when no task is selected', fakeAsync(() => {
    const env = new TestEnvironment();
    when(env.mockedParatextService.getProjects()).thenReturn(
      of<ParatextProject[]>([
        {
          paratextId: 'pt01',
          name: 'Target',
          languageTag: 'en',
          languageName: 'English',
          isConnectable: true
        }
      ])
    );
    env.fixture.detectChanges();
    expect(env.component.state).toEqual('input');
    env.changeSelectValue(env.projectSelect, 0);
    env.clickElement(env.inputElement(env.checkingCheckbox));
    expect(env.inputElement(env.checkingCheckbox).checked).toBe(false);
    expect(env.inputElement(env.translateCheckbox).checked).toBe(false);

    env.clickElement(env.submitButton);

    verify(env.mockedSFProjectService.onlineCreate(anything())).never();
    verify(env.mockedSFProjectUserService.onlineCreate(anything(), anything())).never();
    verify(env.mockedRouter.navigate(anything())).never();
  }));
});

class TestEnvironment {
  component: ConnectProjectComponent;
  fixture: ComponentFixture<ConnectProjectComponent>;

  mockedParatextService: ParatextService;
  mockedRouter: Router;
  mockedSyncJobService: SyncJobService;
  mockedSFProjectUserService: SFProjectUserService;
  mockedSFProjectService: SFProjectService;
  mockedUserService: UserService;
  mockedRemoteTranslationEngine: RemoteTranslationEngine;

  constructor() {
    this.mockedParatextService = mock(ParatextService);
    this.mockedRouter = mock(Router);
    this.mockedSyncJobService = mock(SyncJobService);
    this.mockedSFProjectUserService = mock(SFProjectUserService);
    this.mockedSFProjectService = mock(SFProjectService);
    this.mockedUserService = mock(UserService);
    this.mockedRemoteTranslationEngine = mock(RemoteTranslationEngine);

    when(this.mockedSyncJobService.start(anyString())).thenResolve('job01');
    const a = new SyncJob({
      id: 'job01',
      percentCompleted: 0,
      state: SyncJobState.PENDING
    });
    const b = new SyncJob(a);
    b.state = SyncJobState.SYNCING;
    const c = new SyncJob(b);
    c.percentCompleted = 0.5;
    const d = new SyncJob(c);
    d.percentCompleted = 1.0;
    d.state = SyncJobState.IDLE;
    when(this.mockedSyncJobService.listen('job01')).thenReturn(cold('-a-b-c-d|', { a, b, c, d }));
    when(this.mockedSFProjectUserService.onlineCreate(anything(), anything())).thenResolve(
      new SFProjectUser({ id: 'projectuser01' })
    );
    when(this.mockedSFProjectService.onlineCreate(anything())).thenResolve(new SFProject({ id: 'project01' }));
    when(this.mockedUserService.currentUserId).thenReturn('user01');
    when(this.mockedRemoteTranslationEngine.startTraining()).thenResolve();
    when(this.mockedSFProjectService.createTranslationEngine(anything())).thenReturn(
      instance(this.mockedRemoteTranslationEngine)
    );

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, NoopAnimationsModule, UICommonModule],
      declarations: [ConnectProjectComponent],
      providers: [
        { provide: ParatextService, useFactory: () => instance(this.mockedParatextService) },
        { provide: Router, useFactory: () => instance(this.mockedRouter) },
        { provide: SyncJobService, useFactory: () => instance(this.mockedSyncJobService) },
        { provide: SFProjectUserService, useFactory: () => instance(this.mockedSFProjectUserService) },
        { provide: SFProjectService, useFactory: () => instance(this.mockedSFProjectService) },
        { provide: UserService, useFactory: () => instance(this.mockedUserService) }
      ]
    });
    this.fixture = TestBed.createComponent(ConnectProjectComponent);
    this.component = this.fixture.componentInstance;
  }

  get loadingDiv(): DebugElement {
    return this.fixture.debugElement.query(By.css('#loading'));
  }

  get loginButton(): DebugElement {
    return this.fixture.debugElement.query(By.css('#btn-login'));
  }

  get projectSelect(): DebugElement {
    return this.fixture.debugElement.query(By.css('#project-select'));
  }

  get submitButton(): DebugElement {
    return this.fixture.debugElement.query(By.css('#connect-submit-button'));
  }

  get connectProjectForm(): DebugElement {
    return this.fixture.debugElement.query(By.css('form'));
  }

  get tasksDiv(): DebugElement {
    return this.fixture.debugElement.query(By.css('#connect-tasks'));
  }

  get checkingCheckbox(): DebugElement {
    return this.fixture.debugElement.query(By.css('#connect-checking-checkbox'));
  }

  get translateCheckbox(): DebugElement {
    return this.fixture.debugElement.query(By.css('#connect-translate-checkbox'));
  }

  get sourceProjectSelect(): DebugElement {
    return this.fixture.debugElement.query(By.css('#connect-source-select'));
  }

  get sourceParatextIdControl(): AbstractControl {
    return this.component.connectProjectForm.get('tasks.sourceParatextId');
  }

  changeSelectValue(select: DebugElement, option: number): void {
    select.nativeElement.click();
    this.fixture.detectChanges();
    flush();
    const item = select.queryAll(By.css('mdc-list-item'));
    item[option].nativeElement.click();
    this.fixture.detectChanges();
    flush();
  }

  checkTranslateCheckbox(): void {
    this.component.connectProjectForm.get('tasks.translate').reset(true);
    this.sourceParatextIdControl.enable();
    this.fixture.detectChanges();
    flush();
  }

  clickElement(element: HTMLElement | DebugElement): void {
    if (element instanceof DebugElement) {
      element = (element as DebugElement).nativeElement as HTMLElement;
    }
    element.click();
    this.fixture.detectChanges();
    flush();
  }

  inputElement(element: DebugElement): HTMLInputElement {
    return element.nativeElement.querySelector('input') as HTMLInputElement;
  }
}
