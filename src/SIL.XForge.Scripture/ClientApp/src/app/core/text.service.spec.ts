import { inject, TestBed } from '@angular/core/testing';
import { instance, mock } from 'ts-mockito';

import { JsonApiService } from '@xforge-common/json-api.service';
import { RealtimeService } from '@xforge-common/realtime.service';
import { TextService } from './text.service';

describe('TextService', () => {
  const mockedJsonApiService = mock(JsonApiService);
  const mockedRealtimeService = mock(RealtimeService);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TextService,
        { provide: JsonApiService, useFactory: () => instance(mockedJsonApiService) },
        { provide: RealtimeService, useFactory: () => instance(mockedRealtimeService) }
      ]
    });
  });

  it('should be created', inject([TextService], (service: TextService) => {
    expect(service).toBeTruthy();
  }));
});
