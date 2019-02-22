import { Canon } from './canon';
import { ScrVers } from './scr-vers';

/**
 * Stores a reference to a specific verse in Scripture.
 *
 * Partially converted from https://github.com/sillsdev/libpalaso/blob/master/SIL.Scripture/VerseRef.cs
 */
export class VerseRef {
  static readonly verseRangeSeparator = '-';
  static readonly verseSequenceIndicator = ',';
  static readonly defaultVersification: ScrVers = ScrVers.English;
  static readonly verseRangeSeparators: string[] = [VerseRef.verseRangeSeparator];
  static readonly verseSequenceIndicators: string[] = [VerseRef.verseSequenceIndicator];

  private static readonly chapterDigitShifter: number = 1000;
  private static readonly bookDigitShifter: number = VerseRef.chapterDigitShifter * VerseRef.chapterDigitShifter;
  private static readonly bcvMaxValue: number = VerseRef.chapterDigitShifter - 1;

  static fromStr(verseStr: string, versification: ScrVers = VerseRef.defaultVersification): VerseRef {
    let vref = new VerseRef(undefined, undefined, undefined, versification);
    try {
      vref.parse(verseStr);
    } catch (error) {
      vref = new VerseRef(undefined, undefined, undefined, versification);
    } finally {
      return vref;
    }
  }

  /**
   * Tries to parse the specified string into a verse reference
   * @param string str The string to attempt to parse
   * @returns success: True if the specified string was successfully parsed, false otherwise
   * @returns vref: The result of the parse if successful, or empty VerseRef if it failed
   */
  static tryParse(str: string): { success: boolean; vref: VerseRef } {
    let vref: VerseRef;
    try {
      vref = VerseRef.fromStr(str);
      return { success: true, vref };
    } catch (error) {
      if (error instanceof VerseRefException) {
        vref = new VerseRef();
        return { success: false, vref };
      }
      throw error;
    }
  }

  /**
   * Parses a verse string and gets the leading numeric portion as a number.
   * @param string verseStr
   * @returns true if the entire string could be parsed as a single, simple verse number (1-999);
   *    false if the verse string represented a verse bridge, contained segment letters, or was invalid
   */
  static tryGetVerseNum(verseStr: string): { success: boolean; vNum: number } {
    let vNum: number;
    if (!verseStr) {
      vNum = -1;
      return { success: true, vNum };
    }

    vNum = 0;
    let ch: string;
    for (let i = 0; i < verseStr.length; i++) {
      ch = verseStr[i];
      if (ch < '0' || ch > '9') {
        if (i === 0) {
          vNum = -1;
        }
        return { success: false, vNum };
      }

      vNum = vNum * 10 + +ch - +'0';
      if (vNum > VerseRef.bcvMaxValue) {
        // whoops, we got too big!
        vNum = -1;
        return { success: false, vNum };
      }
    }
    return { success: true, vNum };
  }

  /**
   * Determines if the verse string is in a valid format (does not consider versification).
   */
  static isVerseParseable(verse: string): boolean {
    return (
      verse.length !== 0 &&
      '0123456789'.includes(verse[0]) &&
      verse[verse.length - 1] !== this.verseRangeSeparator &&
      verse[verse.length - 1] !== this.verseSequenceIndicator
    );
  }

  firstChapter?: number;
  lastChapter?: number;
  lastVerse?: number;
  isExcluded?: boolean;
  hasSegmentsDefined?: boolean;
  hasMultiple?: boolean;
  text?: string;
  BBBCCC?: number;
  BBBCCCVVV?: number;
  BBBCCCVVVS?: string;
  longHashCode?: number;
  versificationStr?: string;

  private readonly rtlMark: string = '\u200f';
  private _bookNum: number;
  private _chapterNum: number;
  private _verseNum: number;
  private _verse: string;
  private _versification: ScrVers;

  constructor(bookNum?: number, chapterNum?: number, verseNum?: number, versification?: ScrVers) {
    if (!bookNum && !chapterNum && !verseNum && !versification) {
      this._bookNum = 0;
      this._chapterNum = 0;
      this._verseNum = 0;
      this._verse = null;
      versification = null;
    } else if (!bookNum && !chapterNum && !verseNum) {
      this._bookNum = 0;
      this._chapterNum = -1;
      this._verseNum = -1;
      this._verse = null;
    } else {
      this._bookNum = bookNum;
      this._chapterNum = chapterNum;
      this._verseNum = verseNum;
    }

    if (versification === undefined) {
      versification = VerseRef.defaultVersification;
    }
    this._versification = versification;
  }

  /**
   * Checks to see if a VerseRef hasn't been set - all values are the default.
   */
  get isDefault(): boolean {
    return this.bookNum === 0 && this.chapterNum === 0 && this.verseNum === 0 && this.versification == null;
  }

  get book(): string {
    return Canon.bookNumberToId(this.bookNum, '');
  }
  set book(value: string) {
    this.bookNum = Canon.bookIdToNumber(value);
  }

  get chapter(): string {
    return this.isDefault || this._chapterNum < 0 ? '' : this._chapterNum.toString();
  }
  set chapter(value: string) {
    const chapter: number = +value;
    this._chapterNum = Number.isInteger(chapter) ? chapter : -1;
  }

  get verse(): string {
    if (this._verse != null) {
      return this._verse;
    }
    return this.isDefault || this._verseNum < 0 ? '' : this._verseNum.toString();
  }
  set verse(value: string) {
    const { success, vNum } = VerseRef.tryGetVerseNum(value);
    this._verse = !success ? value.replace(this.rtlMark, '') : null;
    this._verseNum = vNum;
    if (this._verseNum >= 0) {
      return;
    }

    const { vNum: verseNum } = VerseRef.tryGetVerseNum(this._verse);
    this._verseNum = verseNum;
  }

  /**
   * Parses the reference in the specified string.
   * Optionally versification can follow reference as in GEN 3:11/4
   * Throw an exception if
   * - invalid book name
   * - chapter number is missing or not a number
   * - verse number is missing or does not start with a number
   * - versifcation is invalid
   * @param string verseStr string to parse e.g. "MAT 3:11"
   */
  parse(verseStr: string): void {
    verseStr = verseStr.replace(this.rtlMark, '');
    if (verseStr.includes('/')) {
      const parts: string[] = verseStr.split('/');
      verseStr = parts[0];
      if (parts.length > 1) {
        try {
          const scrVerseCode: number = +parts[1].trim();
          this.versification = new ScrVers(ScrVersType[scrVerseCode]);
        } catch (error) {
          throw new VerseRefException('Invalid reference : ' + verseStr);
        }
      }
    }

    const b_cv: string[] = verseStr.trim().split(' ');
    if (b_cv.length !== 2) {
      throw new VerseRefException('Invalid reference : ' + verseStr);
    }

    const c_v: string[] = b_cv[1].split(':');

    const cnum: number = +c_v[0];
    if (
      c_v.length !== 2 ||
      Canon.bookIdToNumber(b_cv[0]) === 0 ||
      !Number.isInteger(cnum) ||
      cnum < 0 ||
      !VerseRef.isVerseParseable(c_v[1])
    ) {
      throw new VerseRefException('Invalid reference : ' + verseStr);
    }

    this.updateInternal(b_cv[0], c_v[0], c_v[1]);
  }

  get bookNum(): number {
    return this._bookNum;
  }
  set bookNum(value: number) {
    if (value <= 0 || value > Canon.lastBook) {
      throw new VerseRefException('BookNum must be greater than zero and less than or equal to last book');
    }
    this._bookNum = value;
  }

  get chapterNum(): number {
    return this._chapterNum;
  }
  set chapterNum(value: number) {
    // ToDo: replace or remove this placeholder
    this.chapterNum = value;
  }

  get verseNum(): number {
    return this._verseNum;
  }
  set verseNum(value: number) {
    // ToDo: replace or remove this placeholder
    this._verseNum = value;
  }

  get versification(): ScrVers {
    return this._versification;
  }
  set versification(value: ScrVers) {
    this._versification = value;
  }

  /**
   * Determines if the reference is valid
   */
  get valid(): boolean {
    return this.validStatus === ValidStatusType.Valid;
  }

  /**
   * Get the valid status for this reference.
   */
  get validStatus(): ValidStatusType {
    return this.validateVerse(VerseRef.verseRangeSeparators, VerseRef.verseSequenceIndicators);
  }

  /**
   * Validates a verse number using the supplied separators rather than the defaults.
   */
  validateVerse(verseRangeSeparators: string[], verseSequenceSeparators: string[]): ValidStatusType {
    if (!this.verse) {
      return this.internalValid;
    }
    /*
    let prevVerse: number = 0;
    foreach (VerseRef vRef in AllVerses(true, verseRangeSeparators, verseSequenceSeparators)) {
      ValidStatusType validStatus = vRef.InternalValid;
      if (validStatus != ValidStatusType.Valid)
        return validStatus;

      int bbbcccvvv = vRef.BBBCCCVVV;
      if (prevVerse > bbbcccvvv)
        return ValidStatusType.VerseOutOfOrder;
      if (prevVerse == bbbcccvvv)
        return ValidStatusType.VerseRepeated;
      prevVerse = bbbcccvvv;
    }*/
    return ValidStatusType.Valid; // TODO: make Valid tests Valid Status tests
  }

  /**
   * Gets whether a single verse reference is valid.
   */
  private get internalValid(): ValidStatusType {
    // Unknown versification is always invalid
    if (this._versification == null) {
      return ValidStatusType.UnknownVersification;
    }

    // If invalid book, reference is invalid
    if (this._bookNum <= 0 || this._bookNum > Canon.lastBook) {
      return ValidStatusType.OutOfRange;
    }

    // If non-biblical book, any chapter/verse is valid
    /*
    if (!Canon.isCanonical(this._bookNum)) {
      return ValidStatusType.Valid;
    }

    if (this._bookNum > this._versification.getLastBook() || this._chapterNum <= 0 ||
      this._chapterNum > this._versification.getLastChapter(this._bookNum) || this.verseNum < 0 ||
      this.verseNum > this._versification.getLastVerse(this._bookNum, this._chapterNum)
    ) {
      return ValidStatusType.OutOfRange;
    }

    return this._versification.isExcluded(this.BBBCCCVVV) ? ValidStatusType.OutOfRange : ValidStatusType.Valid;
    */
    return ValidStatusType.Valid;
  }

  private updateInternal(bookStr: string, chapterStr: string, verseStr: string): void {
    this.bookNum = Canon.bookIdToNumber(bookStr);
    this.chapter = chapterStr;
    this.verse = verseStr;
  }
}

export class VerseRefException extends Error {}

/**
 * The valid status of the VerseRef
 */
export enum ValidStatusType {
  Valid,
  UnknownVersification,
  OutOfRange,
  VerseOutOfOrder,
  VerseRepeated
}

// note: elsewhere this is a string enum
enum ScrVersType {
  Unknown,
  Original,
  Septuagint,
  Vulgate,
  English,
  RussianProtestant,
  RussianOrthodox
}
