import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { inject, TestBed } from '@angular/core/testing';
import { instance, mock } from 'ts-mockito';

import { JSONAPIService } from './jsonapi.service';
import { ProjectService } from './project.service';

@Injectable()
class TestProjectService extends ProjectService {
  constructor(jsonApiService: JSONAPIService) {
    super(jsonApiService, []);
  }
}

describe('ProjectService', () => {
  const mockedJSONAPIService = mock(JSONAPIService);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: ProjectService, useClass: TestProjectService },
        { provide: JSONAPIService, useFactory: () => instance(mockedJSONAPIService) }
      ]
    });
  });

  it('should be created', inject([ProjectService], (service: ProjectService) => {
    expect(service).toBeTruthy();
  }));
});
