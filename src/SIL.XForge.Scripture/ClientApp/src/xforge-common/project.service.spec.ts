import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { inject, TestBed } from '@angular/core/testing';
import { instance, mock } from 'ts-mockito';

import { JsonApiService } from './json-api.service';
import { Project } from './models/project';
import { ProjectService } from './project.service';

class TestProject extends Project {
  static readonly TYPE: string = 'project';

  constructor(init?: Partial<TestProject>) {
    super(TestProject.TYPE, init);
  }

  get taskNames(): string[] {
    return [];
  }
}

@Injectable()
class TestProjectService extends ProjectService<TestProject> {
  constructor(jsonApiService: JsonApiService) {
    super(TestProject.TYPE, jsonApiService, []);
  }
}

describe('ProjectService', () => {
  const mockedJsonApiService = mock(JsonApiService);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: ProjectService, useClass: TestProjectService },
        { provide: JsonApiService, useFactory: () => instance(mockedJsonApiService) }
      ]
    });
  });

  it('should be created', inject([ProjectService], (service: ProjectService) => {
    expect(service).toBeTruthy();
  }));
});
