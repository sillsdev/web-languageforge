import { CommonModule, DatePipe } from '@angular/common';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ActivatedRoute, Params } from '@angular/router';
import { of, Subject } from 'rxjs';
import { anything, instance, mock, verify, when } from 'ts-mockito';

import { AuthService } from 'xforge-common/auth.service';
import { NoticeService } from 'xforge-common/notice.service';
import { ParatextService } from 'xforge-common/paratext.service';
import { UICommonModule } from 'xforge-common/ui-common.module';
import { SFProjectRef } from '../core/models/sfdomain-model.generated';
import { SFProject } from '../core/models/sfproject';
import { SyncJob, SyncJobState } from '../core/models/sync-job';
import { SFProjectService } from '../core/sfproject.service';
import { SyncJobService } from '../core/sync-job.service';
import { SyncComponent } from './sync.component';

describe('SyncComponent', () => {
  it('should display sign in to paratext', fakeAsync(() => {
    const env = new TestEnvironment();
    expect(env.title.textContent).toContain('Synchronize Sync Test Project with Paratext');
    expect(env.signInButton.textContent).toContain('Sign in to Paratext');
    expect(env.lastSyncDate).toBeNull();
  }));

  it('should redirect the user to sign in to paratext', fakeAsync(() => {
    const env = new TestEnvironment();
    env.clickButton(env.signInButton);
    verify(env.mockedParatextService.logIn(anything())).once();
    expect().nothing();
  }));

  it('should display sync project', fakeAsync(() => {
    const env = new TestEnvironment(true);
    expect(env.title.textContent).toContain('Synchronize Sync Test Project with Paratext');
    expect(env.syncButton.textContent).toContain('Synchronize');
    expect(env.lastSyncDate.textContent).toContain('01 February 2019');
  }));

  it('should sync project when the button is clicked', fakeAsync(() => {
    const env = new TestEnvironment(true);
    verify(env.mockedProjectService.onlineGet(anything())).once();
    env.clickButton(env.syncButton);
    tick();
    verify(env.mockedSyncJobService.start(anything())).once();
    verify(env.mockedSyncJobService.listen(anything())).once();
    // Simulate sync in progress
    env.emitSyncJob(SyncJobState.PENDING);
    env.fixture.detectChanges();
    expect(env.component.syncJobActive).toBe(true);
    expect(env.progressBar).toBeDefined();
    expect(env.syncMessage.textContent).toContain('Your project is being synchronized');
    // Simulate sync completed
    env.emitSyncJob(SyncJobState.IDLE);
    expect(env.component.syncJobActive).toBe(false);
    verify(env.mockedProjectService.onlineGet(anything())).twice();
    verify(env.mockedNoticeService.show('Successfully synchronized Sync Test Project with Paratext.'));
  }));
});

class TestEnvironment {
  fixture: ComponentFixture<SyncComponent>;
  component: SyncComponent;

  mockedActivatedRoute: ActivatedRoute;
  mockedAuthService: AuthService;
  mockedParatextService: ParatextService;
  mockedProjectService: SFProjectService;
  mockedSyncJobService: SyncJobService;
  mockedNoticeService: NoticeService;

  private syncJob: SyncJob;
  private subject: Subject<SyncJob>;

  constructor(connected: boolean = false) {
    this.mockedActivatedRoute = mock(ActivatedRoute);
    this.mockedAuthService = mock(AuthService);
    this.mockedParatextService = mock(ParatextService);
    this.mockedProjectService = mock(SFProjectService);
    this.mockedSyncJobService = mock(SyncJobService);
    this.mockedNoticeService = mock(NoticeService);

    const parameters = { ['projectId']: 'testproject01' } as Params;
    when(this.mockedActivatedRoute.params).thenReturn(of(parameters));
    const project = new SFProject({
      id: 'testproject01',
      projectName: 'Sync Test Project',
      paratextId: 'pt01',
      lastSyncedDate: new Date('2019-02-01T12:00:00.000Z')
    });
    when(this.mockedProjectService.onlineGet(anything())).thenReturn(of(project));
    const ptUsername = connected ? 'Paratext User01' : '';
    when(this.mockedParatextService.getParatextUsername()).thenReturn(of(ptUsername));
    this.subject = new Subject<SyncJob>();
    when(this.mockedSyncJobService.listen(anything())).thenReturn(this.subject);
    this.syncJob = new SyncJob({
      id: 'syncjob01',
      project: new SFProjectRef('testproject01')
    });

    TestBed.configureTestingModule({
      declarations: [SyncComponent],
      imports: [CommonModule, UICommonModule],
      providers: [
        DatePipe,
        { provide: ActivatedRoute, useFactory: () => instance(this.mockedActivatedRoute) },
        { provide: AuthService, useFactory: () => instance(this.mockedAuthService) },
        { provide: ParatextService, useFactory: () => instance(this.mockedParatextService) },
        { provide: SFProjectService, useFactory: () => instance(this.mockedProjectService) },
        { provide: SyncJobService, useFactory: () => instance(this.mockedSyncJobService) }
      ]
    }).compileComponents();

    this.fixture = TestBed.createComponent(SyncComponent);
    this.component = this.fixture.componentInstance;
    this.fixture.detectChanges();
    tick();
  }

  get title(): HTMLElement {
    return this.fixture.nativeElement.querySelector('#title');
  }

  get signInButton(): HTMLElement {
    return this.fixture.nativeElement.querySelector('#btn-sign-in');
  }

  get syncButton(): HTMLElement {
    return this.fixture.nativeElement.querySelector('#btn-sync');
  }

  get progressBar(): HTMLElement {
    return this.fixture.nativeElement.querySelector('mdc-linear-progress');
  }

  get lastSyncDate(): HTMLElement {
    return this.fixture.nativeElement.querySelector('#date-last-sync');
  }

  get syncMessage(): HTMLElement {
    return this.fixture.nativeElement.querySelector('#sync-message');
  }

  clickButton(button: HTMLElement): void {
    button.click();
    this.fixture.detectChanges();
  }

  emitSyncJob(state: SyncJobState): void {
    this.syncJob.state = state;
    this.subject.next(this.syncJob);
  }
}
