import { Injectable } from '@angular/core';
import { Dictionary } from '../models/dictionary';

import { WORDS } from '../mock-data/mock-dictionary';

@Injectable()
export class DictionaryService {
  getWords(): Promise<Dictionary[]> {
    return Promise.resolve(WORDS);
  }
}