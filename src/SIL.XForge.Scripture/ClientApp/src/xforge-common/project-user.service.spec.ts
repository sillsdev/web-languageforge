import { HttpClientTestingModule } from '@angular/common/http/testing';
import { inject, TestBed } from '@angular/core/testing';
import { instance, mock } from 'ts-mockito';

import { JSONAPIService } from './jsonapi.service';
import { ProjectUserService } from './project-user.service';

describe('ProjectUserService', () => {
  const mockedJSONAPIService = mock(JSONAPIService);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        ProjectUserService,
        { provide: JSONAPIService, useFactory: () => instance(mockedJSONAPIService) }
      ]
    });
  });

  it('should be created', inject([ProjectUserService], (service: ProjectUserService) => {
    expect(service).toBeTruthy();
  }));
});
