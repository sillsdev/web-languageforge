import { inject, TestBed } from '@angular/core/testing';
import { instance, mock } from 'ts-mockito';

import { JSONAPIService } from '@xforge-common/jsonapi.service';
import { RealtimeService } from '@xforge-common/realtime.service';
import { TextService } from './text.service';

describe('TextService', () => {
  const mockedJSONAPIService = mock(JSONAPIService);
  const mockedRealtimeService = mock(RealtimeService);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TextService,
        { provide: JSONAPIService, useFactory: () => instance(mockedJSONAPIService) },
        { provide: RealtimeService, useFactory: () => instance(mockedRealtimeService) }
      ]
    });
  });

  it('should be created', inject([TextService], (service: TextService) => {
    expect(service).toBeTruthy();
  }));
});
