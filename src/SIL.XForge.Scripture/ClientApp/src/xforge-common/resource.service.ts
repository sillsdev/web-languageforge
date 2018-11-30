import { RecordIdentity } from '@orbit/data';

import { JsonApiService } from './json-api.service';

export abstract class ResourceService {
  constructor(protected readonly type: string, protected readonly jsonApiService: JsonApiService) {}

  protected identity(id: string): RecordIdentity {
    return { type: this.type, id };
  }
}
