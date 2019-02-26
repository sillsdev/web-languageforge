import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { anything, deepEqual, instance, mock, verify, when } from 'ts-mockito';

import { MapQueryResults } from 'xforge-common/json-api.service';
import { User } from 'xforge-common/models/user';
import { UICommonModule } from 'xforge-common/ui-common.module';
import { UserService } from 'xforge-common/user.service';
import { SFProjectRef } from '../core/models/sfproject';
import { SFProjectUser } from '../core/models/sfproject-user';
import { StartComponent } from './start.component';

describe('StartComponent', () => {
  it('navigate to last project', fakeAsync(() => {
    const env = new TestEnvironment();
    env.setCurrentProjectId('project02');
    env.setProjectData();
    env.fixture.detectChanges();
    flush();

    verify(env.mockedRouter.navigate(deepEqual(['./', 'project02']), anything())).once();
    expect().nothing();
  }));

  it('navigate to first project when no last project set', fakeAsync(() => {
    const env = new TestEnvironment();
    env.setCurrentProjectId();
    env.setProjectData();
    env.fixture.detectChanges();
    flush();

    verify(env.mockedRouter.navigate(deepEqual(['./', 'project01']), anything())).once();
    expect().nothing();
  }));

  it('do not navigate when there are no projects', fakeAsync(() => {
    const env = new TestEnvironment();
    env.setCurrentProjectId();
    env.setNoProjectData();
    env.fixture.detectChanges();
    flush();

    verify(env.mockedRouter.navigate(anything(), anything())).never();
    expect().nothing();
  }));
});

class TestEnvironment {
  readonly component: StartComponent;
  readonly fixture: ComponentFixture<StartComponent>;

  readonly mockedUserService = mock(UserService);
  readonly mockedActivatedRoute = mock(ActivatedRoute);
  readonly mockedRouter = mock(Router);

  constructor() {
    TestBed.configureTestingModule({
      declarations: [StartComponent],
      imports: [UICommonModule, RouterTestingModule],
      providers: [
        { provide: UserService, useFactory: () => instance(this.mockedUserService) },
        { provide: ActivatedRoute, useFactory: () => instance(this.mockedActivatedRoute) },
        { provide: Router, useFactory: () => instance(this.mockedRouter) }
      ]
    });
    this.fixture = TestBed.createComponent(StartComponent);
    this.component = this.fixture.componentInstance;
  }

  setCurrentProjectId(projectId?: string): void {
    when(this.mockedUserService.getCurrentUser()).thenReturn(
      of(
        new User({
          id: 'user01',
          site: { currentProjectId: projectId }
        })
      )
    );
  }

  setProjectData(): void {
    when(this.mockedUserService.getProjects('user01')).thenReturn(
      of(
        new MapQueryResults([
          new SFProjectUser({
            id: 'projectuser01',
            project: new SFProjectRef('project01')
          }),
          new SFProjectUser({
            id: 'projectuser02',
            project: new SFProjectRef('project02')
          })
        ])
      )
    );
  }

  setNoProjectData(): void {
    when(this.mockedUserService.getProjects('user01')).thenReturn(of(new MapQueryResults<SFProjectUser[]>([])));
  }
}
