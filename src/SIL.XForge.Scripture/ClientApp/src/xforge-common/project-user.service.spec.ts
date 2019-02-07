import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { inject, TestBed } from '@angular/core/testing';
import { instance, mock } from 'ts-mockito';

import { JsonApiService } from './json-api.service';
import { ProjectUser } from './models/project-user';
import { ProjectUserService } from './project-user.service';

class TestProjectUser extends ProjectUser {
  static readonly TYPE: string = 'projectUser';

  constructor(init?: Partial<TestProjectUser>) {
    super(TestProjectUser.TYPE, init);
  }
}

@Injectable()
class TestProjectUserService extends ProjectUserService<TestProjectUser> {
  constructor(jsonApiService: JsonApiService) {
    super(TestProjectUser.TYPE, jsonApiService, 'project', 'user');
  }

  protected newProjectUser(_projectId: string, _userId: string, _role?: string): TestProjectUser {
    throw new Error('Not implemented');
  }
}

describe('ProjectUserService', () => {
  const mockedJsonApiService = mock(JsonApiService);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: ProjectUserService, useClass: TestProjectUserService },
        { provide: JsonApiService, useFactory: () => instance(mockedJsonApiService) }
      ]
    });
  });

  it('should be created', inject([ProjectUserService], (service: ProjectUserService) => {
    expect(service).toBeTruthy();
  }));
});
