import { HttpClientTestingModule } from '@angular/common/http/testing';
import { inject, TestBed } from '@angular/core/testing';
import { instance, mock } from 'ts-mockito';

import { JsonApiService } from './json-api.service';
import { ProjectUserService } from './project-user.service';

describe('ProjectUserService', () => {
  const mockedJsonApiService = mock(JsonApiService);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProjectUserService, { provide: JsonApiService, useFactory: () => instance(mockedJsonApiService) }]
    });
  });

  it('should be created', inject([ProjectUserService], (service: ProjectUserService) => {
    expect(service).toBeTruthy();
  }));
});
