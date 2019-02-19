import { ScrVersType } from '../sfdomain-model.generated';
import { BookSet } from './book-set';

export class ScrVers {
  static readonly English: ScrVers = new ScrVers(ScrVersType.English);

  private _type: ScrVersType | string;

  name?: string;
  fullPath?: string;
  isPresent?: boolean;
  hasVerseSegments?: boolean;
  isCustomized?: boolean;
  baseVersification?: ScrVers;
  scriptureBooks?: BookSet;

  constructor(type?: ScrVersType | string) {
    this._type = type;
  }

  get type() {
    return this._type;
  }
}
