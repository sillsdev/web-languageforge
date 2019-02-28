import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { anything, deepEqual, instance, mock, verify, when } from 'ts-mockito';

import { MapQueryResults } from 'xforge-common/json-api.service';
import { UserRef } from 'xforge-common/models/user';
import { UICommonModule } from 'xforge-common/ui-common.module';
import { UserService } from 'xforge-common/user.service';
import { nameof } from 'xforge-common/utils';
import { SFProject, SFProjectRef } from '../core/models/sfproject';
import { SFProjectUser, SFProjectUserRef } from '../core/models/sfproject-user';
import { TextRef } from '../core/models/text';
import { SFProjectService } from '../core/sfproject.service';
import { ProjectComponent } from './project.component';

describe('ProjectComponent', () => {
  it('navigate to last text', fakeAsync(() => {
    const env = new TestEnvironment();
    env.setProjectData({ selectedTask: 'translate' });
    env.fixture.detectChanges();
    flush();

    verify(env.mockedRouter.navigate(deepEqual(['./', 'translate', 'text02']), anything())).once();
    expect().nothing();
  }));

  it('navigate to first text when no last selected text', fakeAsync(() => {
    const env = new TestEnvironment();
    env.setProjectData({ isTranslateEnabled: false });
    env.fixture.detectChanges();
    flush();

    verify(env.mockedRouter.navigate(deepEqual(['./', 'checking', 'text01']), anything())).once();
    expect().nothing();
  }));

  it('do not navigate when no texts', fakeAsync(() => {
    const env = new TestEnvironment();
    env.setProjectData({ isTranslateEnabled: false, hasTexts: false });
    env.fixture.detectChanges();
    flush();

    verify(env.mockedRouter.navigate(anything(), anything())).never();
    expect().nothing();
  }));
});

class TestEnvironment {
  readonly component: ProjectComponent;
  readonly fixture: ComponentFixture<ProjectComponent>;

  readonly mockedUserService = mock(UserService);
  readonly mockedActivatedRoute = mock(ActivatedRoute);
  readonly mockedRouter = mock(Router);
  readonly mockedSFProjectService = mock(SFProjectService);

  constructor() {
    when(this.mockedActivatedRoute.params).thenReturn(of({ projectId: 'project01' }));
    when(this.mockedUserService.currentUserId).thenReturn('user01');

    TestBed.configureTestingModule({
      declarations: [ProjectComponent],
      imports: [UICommonModule],
      providers: [
        { provide: UserService, useFactory: () => instance(this.mockedUserService) },
        { provide: ActivatedRoute, useFactory: () => instance(this.mockedActivatedRoute) },
        { provide: Router, useFactory: () => instance(this.mockedRouter) },
        { provide: SFProjectService, useFactory: () => instance(this.mockedSFProjectService) }
      ]
    });
    this.fixture = TestBed.createComponent(ProjectComponent);
    this.component = this.fixture.componentInstance;
  }

  setProjectData(args: { isTranslateEnabled?: boolean; hasTexts?: boolean; selectedTask?: string }): void {
    when(
      this.mockedSFProjectService.get(
        'project01',
        deepEqual([[nameof<SFProject>('users')], [nameof<SFProject>('texts')]])
      )
    ).thenReturn(
      of(
        new MapQueryResults(
          new SFProject({
            id: 'project01',
            translateConfig: { enabled: args.isTranslateEnabled == null || args.isTranslateEnabled },
            checkingConfig: { enabled: true },
            users: [new SFProjectUserRef('projectuser01')],
            texts: args.hasTexts == null || args.hasTexts ? [new TextRef('text01'), new TextRef('text02')] : undefined
          }),
          undefined,
          [
            new SFProjectUser({
              id: 'projectuser01',
              user: new UserRef('user01'),
              project: new SFProjectRef('project01'),
              selectedTask: args.selectedTask,
              translateConfig: { selectedTextRef: args.selectedTask == null ? undefined : 'text02' }
            })
          ]
        )
      )
    );
  }
}
