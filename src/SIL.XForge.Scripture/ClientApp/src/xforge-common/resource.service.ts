import { RecordIdentity } from '@orbit/data';

import { JSONAPIService } from './jsonapi.service';

export abstract class ResourceService {
  constructor(protected readonly type: string, protected readonly jsonApiService: JSONAPIService) {}

  protected identity(id: string): RecordIdentity {
    return { type: this.type, id };
  }
}
