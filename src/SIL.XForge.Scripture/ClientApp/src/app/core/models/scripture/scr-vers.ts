import { ScrVersType } from '../sfdomain-model.generated';
import { BookSet } from './book-set';

/**
 * Accessor for getting information about a versification. This class has a small memory footprint so multiple ScrVers
 * objects can be created that point to the same versification; useful for deserialization of versification information.
 *
 * Partially converted from https://github.com/sillsdev/libpalaso/blob/master/SIL.Scripture/ScrVers.cs
 */
export class ScrVers {
  static readonly Original: ScrVers = new ScrVers(ScrVersType.Original);
  static readonly Septuagint: ScrVers = new ScrVers(ScrVersType.Septuagint);
  static readonly Vulgate: ScrVers = new ScrVers(ScrVersType.Vulgate);
  static readonly English: ScrVers = new ScrVers(ScrVersType.English);
  static readonly RussianProtestant: ScrVers = new ScrVers(ScrVersType.RussianProtestant);
  static readonly RussianOrthodox: ScrVers = new ScrVers(ScrVersType.RussianOrthodox);

  name?: string;
  fullPath?: string;
  isPresent?: boolean;
  hasVerseSegments?: boolean;
  isCustomized?: boolean;
  baseVersification?: ScrVers;
  scriptureBooks?: BookSet;

  private _type: ScrVersType;
  // private versInfo: Versification;

  constructor(name?: string);
  constructor(type?: ScrVersType) {
    if (name != null) {
      this.name = name;
    } else if (type != null) {
      this._type = type;
    } else {
      throw new Error('Argument null');
    }
  }

  get type() {
    return this._type;
  }

  clearExcludedVerses() {}
  clearVerseSegments() {}
}
