import { Injectable } from '@angular/core';

import { JSONAPIService } from '@xforge-common/jsonapi.service';
import { LiveQueryObservable } from '@xforge-common/live-query-observable';
import { RealtimeService } from '@xforge-common/realtime.service';
import { ResourceService } from '@xforge-common/resource.service';
import { nameof } from '@xforge-common/utils';
import { SFProject } from '../shared/models/sfproject';
import { Text } from '../shared/models/text';
import { TextData } from '../shared/models/text-data';

export type TextType = 'source' | 'target';

@Injectable({
  providedIn: 'root'
})
export class TextService extends ResourceService {
  constructor(jsonApiService: JSONAPIService, private readonly realtimeService: RealtimeService) {
    super(Text.TYPE, jsonApiService);
  }

  connect(id: string, textType: TextType): Promise<TextData> {
    return this.realtimeService.connect({ type: TextData.TYPE, id : this.getTextDataId(id, textType) });
  }

  disconnect(textData: TextData): Promise<void> {
    return this.realtimeService.disconnect(textData);
  }

  private getTextDataId(id: string, textType: TextType): string {
    return id + ':' + textType;
  }
}
