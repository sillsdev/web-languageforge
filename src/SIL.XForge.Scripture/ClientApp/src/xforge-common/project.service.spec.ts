import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { inject, TestBed } from '@angular/core/testing';
import { instance, mock } from 'ts-mockito';

import { JsonApiService } from './json-api.service';
import { ProjectService } from './project.service';

@Injectable()
class TestProjectService extends ProjectService {
  constructor(jsonApiService: JsonApiService) {
    super(jsonApiService, []);
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
