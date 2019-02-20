import { HttpClientTestingModule } from '@angular/common/http/testing';
import { inject, TestBed } from '@angular/core/testing';
import { instance, mock } from 'ts-mockito';

import { JsonApiService } from 'xforge-common/json-api.service';
import { UserService } from 'xforge-common/user.service';
import { SyncJobService } from './sync-job.service';

describe('SyncJobService', () => {
  const mockedJsonApiService = mock(JsonApiService);
  const mockedUserService = mock(UserService);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        SyncJobService,
        { provide: JsonApiService, useFactory: () => instance(mockedJsonApiService) },
        { provide: UserService, useFactory: () => instance(mockedUserService) }
      ]
    });
  });

  it('should be created', inject([SyncJobService], (service: SyncJobService) => {
    expect(service).toBeTruthy();
  }));
});
