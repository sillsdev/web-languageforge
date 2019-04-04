import { MdcSelect } from '@angular-mdc/web';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { AbstractControl } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { cold, getTestScheduler } from 'jasmine-marbles';
import { defer, of } from 'rxjs';
import { anything, deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { ParatextProject } from 'xforge-common/models/paratext-project';
import { NoticeService } from 'xforge-common/notice.service';
import { ParatextService } from 'xforge-common/paratext.service';
import { UICommonModule } from 'xforge-common/ui-common.module';
import { UserService } from 'xforge-common/user.service';
import { SFProject } from '../core/models/sfproject';
import { SFProjectUser } from '../core/models/sfproject-user';
import { SyncJob, SyncJobRef, SyncJobState } from '../core/models/sync-job';
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
    verify(env.mockedNoticeService.loadingStarted()).once();

    tick();
    env.fixture.detectChanges();

    expect(env.component.state).toEqual('input');
    expect(env.connectProjectForm).not.toBeNull();
    verify(env.mockedNoticeService.loadingFinished()).once();
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

    env.changeSelectValue(env.projectSelect, 'pt01');

    expect(env.tasksCard).toBeNull();

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

    env.changeSelectValue(env.projectSelect, 'pt01');
    expect(env.sourceParatextIdControl.hasError('required')).toBe(true);
    expect(env.sourceParatextIdControl.disabled).toBe(false);

    env.clickElement(env.inputElement(env.checkingCheckbox));

    env.changeSelectValue(env.sourceProjectSelect, 'pt02');
    expect(env.component.connectProjectForm.valid).toBe(true);
    env.clickElement(env.submitButton);
    getTestScheduler().flush();
    tick();

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
    env.changeSelectValue(env.projectSelect, 'pt01');
    env.clickElement(env.inputElement(env.translateCheckbox));
    expect(env.inputElement(env.translateCheckbox).checked).toBe(false);
    expect(env.inputElement(env.checkingCheckbox).checked).toBe(false);

    env.clickElement(env.submitButton);

    verify(env.mockedSFProjectService.onlineCreate(anything())).never();
    verify(env.mockedSFProjectUserService.onlineCreate(anything(), anything())).never();
    verify(env.mockedRouter.navigate(anything())).never();
  }));
});

class TestEnvironment {
  readonly component: ConnectProjectComponent;
  readonly fixture: ComponentFixture<ConnectProjectComponent>;

  readonly mockedParatextService = mock(ParatextService);
  readonly mockedRouter = mock(Router);
  readonly mockedSyncJobService = mock(SyncJobService);
  readonly mockedSFProjectUserService = mock(SFProjectUserService);
  readonly mockedSFProjectService = mock(SFProjectService);
  readonly mockedUserService = mock(UserService);
  readonly mockedNoticeService = mock(NoticeService);

  constructor() {
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
    when(this.mockedSFProjectService.onlineCreate(anything())).thenCall((project: SFProject) => {
      const newProject = new SFProject(project);
      newProject.id = 'project01';
      newProject.activeSyncJob = new SyncJobRef('job01');
      return Promise.resolve(newProject);
    });
    when(this.mockedUserService.currentUserId).thenReturn('user01');

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, NoopAnimationsModule, UICommonModule],
      declarations: [ConnectProjectComponent],
      providers: [
        { provide: ParatextService, useFactory: () => instance(this.mockedParatextService) },
        { provide: Router, useFactory: () => instance(this.mockedRouter) },
        { provide: SyncJobService, useFactory: () => instance(this.mockedSyncJobService) },
        { provide: SFProjectUserService, useFactory: () => instance(this.mockedSFProjectUserService) },
        { provide: SFProjectService, useFactory: () => instance(this.mockedSFProjectService) },
        { provide: UserService, useFactory: () => instance(this.mockedUserService) },
        { provide: NoticeService, useFactory: () => instance(this.mockedNoticeService) }
      ]
    });
    this.fixture = TestBed.createComponent(ConnectProjectComponent);
    this.component = this.fixture.componentInstance;
  }

  get loginButton(): DebugElement {
    return this.fixture.debugElement.query(By.css('#paratext-login-button'));
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

  get tasksCard(): DebugElement {
    return this.fixture.debugElement.query(By.css('#tasks-card'));
  }

  get checkingCheckbox(): DebugElement {
    return this.fixture.debugElement.query(By.css('#checking-checkbox'));
  }

  get translateCheckbox(): DebugElement {
    return this.fixture.debugElement.query(By.css('#translate-checkbox'));
  }

  get sourceProjectSelect(): DebugElement {
    return this.fixture.debugElement.query(By.css('#based-on-select'));
  }

  get sourceParatextIdControl(): AbstractControl {
    return this.component.connectProjectForm.get('tasks.sourceParatextId');
  }

  changeSelectValue(select: DebugElement, value: string): void {
    const mdcSelect: MdcSelect = select.componentInstance;
    mdcSelect.value = value;
    this.fixture.detectChanges();
    tick();
  }

  clickElement(element: HTMLElement | DebugElement): void {
    if (element instanceof DebugElement) {
      element = (element as DebugElement).nativeElement as HTMLElement;
    }
    element.click();
    this.fixture.detectChanges();
    tick();
  }

  inputElement(element: DebugElement): HTMLInputElement {
    return element.nativeElement.querySelector('input') as HTMLInputElement;
  }
}
