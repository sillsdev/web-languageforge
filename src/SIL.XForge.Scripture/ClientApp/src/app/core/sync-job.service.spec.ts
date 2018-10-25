import { HttpClientTestingModule } from '@angular/common/http/testing';
import { inject, TestBed } from '@angular/core/testing';
import { instance, mock } from 'ts-mockito';

import { JSONAPIService } from '@xforge-common/jsonapi.service';
import { SFUserService } from './sfuser.service';
import { SyncJobService } from './sync-job.service';

describe('SyncJobService', () => {
  const mockedJSONAPIService = mock(JSONAPIService);
  const mockedSFUserService = mock(SFUserService);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        SyncJobService,
        { provide: JSONAPIService, useFactory: () => instance(mockedJSONAPIService) },
        { provide: SFUserService, useFactory: () => instance(mockedSFUserService) }
      ]
    });
  });

  it('should be created', inject([SyncJobService], (service: SyncJobService) => {
    expect(service).toBeTruthy();
  }));
});
