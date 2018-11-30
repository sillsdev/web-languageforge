import { HttpClientTestingModule } from '@angular/common/http/testing';
import { inject, TestBed } from '@angular/core/testing';
import { instance, mock } from 'ts-mockito';

import { JsonApiService } from './json-api.service';
import { DomainModel } from './models/domain-model';

describe('JsonApiService', () => {
  const mockedDomainModel = mock(DomainModel);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [JsonApiService, { provide: DomainModel, useFactory: () => instance(mockedDomainModel) }]
    });
  });

  it('should be created', inject([JsonApiService], (service: JsonApiService) => {
    expect(service).toBeTruthy();
  }));
});
