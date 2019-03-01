import { Injectable } from '@angular/core';
import { RecordIdentity } from '@orbit/data';

import { JsonApiService, QueryObservable } from 'xforge-common/json-api.service';
import { RealtimeService } from 'xforge-common/realtime.service';
import { ResourceService } from 'xforge-common/resource.service';
import { Text } from './models/text';
import { TextData } from './models/text-data';

export type TextType = 'source' | 'target';

@Injectable({
  providedIn: 'root'
})
export class TextService extends ResourceService {
  constructor(jsonApiService: JsonApiService, private readonly realtimeService: RealtimeService) {
    super(Text.TYPE, jsonApiService);

    this.jsonApiService.resourceDeleted(this.type).subscribe(textId => {
      this.realtimeService.delete(this.dataIdentity(textId, 'source'));
      this.realtimeService.delete(this.dataIdentity(textId, 'target'));
    });
  }

  connect(id: string, textType: TextType): Promise<TextData> {
    return this.realtimeService.connect(this.dataIdentity(id, textType));
  }

  disconnect(textData: TextData): Promise<void> {
    return this.realtimeService.disconnect(textData);
  }

  get(id: string, include?: string[][]): QueryObservable<Text> {
    return this.jsonApiService.get(this.identity(id), include);
  }

  private dataIdentity(id: string, textType: TextType): RecordIdentity {
    return this.identity(id + ':' + textType);
  }
}
