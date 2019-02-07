import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';

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
  }

  connect(id: string, textType: TextType): Promise<TextData> {
    return this.realtimeService.connect(this.identity(this.getTextDataId(id, textType)));
  }

  disconnect(textData: TextData): Promise<void> {
    return this.realtimeService.disconnect(textData);
  }

  get(id: string, include?: string[]): QueryObservable<Text> {
    return this.jsonApiService.get(this.identity(id), include);
  }

  private getTextDataId(id: string, textType: TextType): string {
    return id + ':' + textType;
  }
}
