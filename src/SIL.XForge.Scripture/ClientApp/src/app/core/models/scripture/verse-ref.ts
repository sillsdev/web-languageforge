// import { ValidStatusType } from '../sfdomain-model.generated';
import { Canon } from './canon';
import { ScrVers } from './scr-vers';

export class VerseRef {
  static readonly verseRangeSeparator = '-';
  static readonly verseSequenceIndicator = ',';
  static readonly defaultVersification: ScrVers = ScrVers.English;
  static readonly verseRangeSeparators: string[] = [VerseRef.verseRangeSeparator];
  static readonly verseSequenceIndicators: string[] = [VerseRef.verseSequenceIndicator];

  firstChapter?: number;
  lastChapter?: number;
  lastVerse?: number;
  isExcluded?: boolean;
  hasSegmentsDefined?: boolean;
  hasMultiple?: boolean;
  book?: string;
  chapter?: string;
  text?: string;
  bBBCCC?: number;
  bBBCCCVVV?: number;
  bBBCCCVVVS?: string;
  longHashCode?: number;
  versificationStr?: string;
  valid?: boolean;
  // validStatus?: ValidStatusType;

  private _bookNum: number;
  private _chapterNum: number;
  private _verseNum: number;
  private _verse: string;
  private _versification: ScrVers;

  constructor(
    bookNum?: number,
    chapterNum?: number,
    verseNum?: number,
    versification: ScrVers = VerseRef.defaultVersification
  ) {
    this._bookNum = bookNum;
    this._chapterNum = chapterNum;
    this._verseNum = verseNum;
    this._versification = versification;
  }

  get bookNum(): number {
    return this._bookNum;
  }
  set bookNum(value: number) {
    if (value <= 0 || value > Canon.LastBook) {
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

  get verse(): string {
    return this._verse;
  }
  set verse(value: string) {
    // ToDo: replace or remove this placeholder
    this._verse = value;
  }

  get versification(): ScrVers {
    return this._versification;
  }
  set versification(value: ScrVers) {
    // ToDo: replace or remove this placeholder
    this._versification = value;
  }

  parse(verseStr: string): void {
    // this.updateInternal();
  }

  private updateInternal(bookStr: string, chapterStr: string, verseStr: string): void {
    this.bookNum = Canon.bookIdToNumber(bookStr);
    // this.chapter = chapterStr;
    // this.verse = verseStr;
  }
}

class VerseRefException extends Error {}
