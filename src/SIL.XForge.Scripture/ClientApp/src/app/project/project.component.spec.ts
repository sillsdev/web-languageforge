import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { RecordIdentity } from '@orbit/data';
import { of } from 'rxjs';
import { instance, mock, when } from 'ts-mockito';

import { QueryResults } from 'xforge-common/json-api.service';
import { Resource } from 'xforge-common/models/resource';
import { ProjectService } from 'xforge-common/project.service';
import { UICommonModule } from 'xforge-common/ui-common.module';
import { SFProject } from '../core/models/sfproject';
import { ProjectComponent } from './project.component';

describe('ProjectComponent', () => {
  let env: TestEnvironment;
  beforeEach(() => {
    env = new TestEnvironment();
    env.fixture.detectChanges();
  });

  it('can load a project', () => {
    expect(env.getProjectHeading()).toEqual('Project 01');
  });
});

class TestQueryResults<T> implements QueryResults<T> {
  constructor(public readonly results: T, public readonly totalPagedCount?: number) {}

  getIncluded<TInclude extends Resource>(identity: RecordIdentity): TInclude {
    return undefined;
  }

  getManyIncluded<TInclude extends Resource>(identities: RecordIdentity[]): TInclude[] {
    return [];
  }
}

class TestEnvironment {
  component: ProjectComponent;
  fixture: ComponentFixture<ProjectComponent>;

  mockedRouter: Router;
  mockedProjectService: ProjectService;
  constructor() {
    this.mockedRouter = mock(Router);
    this.mockedProjectService = mock(ProjectService);

    TestBed.configureTestingModule({
      declarations: [ProjectComponent],
      imports: [UICommonModule],
      providers: [
        { provide: Router, useFactory: () => instance(this.mockedRouter) },
        {
          provide: ActivatedRoute,
          useValue: { params: of({ id: 'project01' }) }
        },
        { provide: ProjectService, useFactory: () => instance(this.mockedProjectService) }
      ]
    });
    this.setupProjectData();
    this.fixture = TestBed.createComponent(ProjectComponent);
    this.component = this.fixture.componentInstance;
  }

  setupProjectData(): void {
    when(this.mockedProjectService.get('project01')).thenReturn(
      of(
        new TestQueryResults<SFProject>(
          new SFProject({
            id: 'project01',
            projectName: 'Project 01'
          })
        )
      )
    );
  }

  getProjectHeading(): string {
    return this.fixture.debugElement.query(By.css('h1')).nativeElement.textContent;
  }
}
