import { ScrVers } from './scr-vers';
import { VerseRef } from './verse-ref';

/**
 * Partially converted from https://github.com/sillsdev/libpalaso/blob/master/SIL.Scripture.Tests/VerseRefTests.cs
 */
describe('VerseRef Model', () => {
  const rtlMarker = '\u200F';

  let versification: ScrVers;

  beforeEach(() => {
    versification = new ScrVers('Dummy'); // Defaults to the eng.vrs file but without a common name
  });

  afterEach(() => {
    versification.clearExcludedVerses();
    versification.clearVerseSegments();
  });

  it('should construct', () => {
    let vref: VerseRef = new VerseRef(1, 2, 3, ScrVers.Septuagint);
    expect(vref.valid).toBe(true);
    // expect(vref.BBBCCCVVV).toEqual(0x001002003);
    // expect(vref.BBBCCCVVVS).toEqual('001002003');
    expect(vref.bookNum).toEqual(1);
    expect(vref.book).toEqual('GEN');
    expect(vref.chapterNum).toEqual(2);
    expect(vref.chapter).toEqual('2');
    expect(vref.verseNum).toEqual(3);
    expect(vref.versification).toEqual(ScrVers.Septuagint);

    vref = new VerseRef(4, 5, 6);
    // expect(vref.BBBCCCVVV).toEqual(0x004005006);
    // expect(vref.BBBCCCVVVS).toEqual('004005006');
    expect(vref.bookNum).toEqual(4);
    expect(vref.book).toEqual('NUM');
    expect(vref.chapterNum).toEqual(5);
    expect(vref.verseNum).toEqual(6);
    expect(vref.versification).toEqual(VerseRef.defaultVersification);

    vref = new VerseRef();
    expect(vref.isDefault).toBe(true);
    expect(vref.valid).toBe(false);
    // expect(vref.BBBCCCVVV).toEqual(0x000000000);
    // expect(vref.BBBCCCVVVS).toEqual('000000000');
    expect(vref.bookNum).toEqual(0);
    expect(vref.book).toEqual('');
    expect(vref.chapterNum).toEqual(0);
    expect(vref.chapter).toEqual('');
    expect(vref.verseNum).toEqual(0);
    expect(vref.verse).toEqual('');
    expect(vref.versification).toEqual(null);

    vref = VerseRef.fromStr('LUK 3:4', ScrVers.English);
    expect(vref.valid).toBe(true);
    expect(vref.bookNum).toEqual(42);
    expect(vref.chapterNum).toEqual(3);
    expect(vref.verseNum).toEqual(4);
    expect(vref.verse).toEqual('4');
    expect(vref.versification).toEqual(ScrVers.English);

    vref = VerseRef.fromStr('LUK 3:4b-5a', ScrVers.Vulgate);
    expect(vref.valid).toBe(true);
    // expect(vref.BBBCCCVVV).toEqual(0x042003004);
    // expect(vref.BBBCCCVVVS).toEqual('042003004b');
    expect(vref.bookNum).toEqual(42);
    expect(vref.chapterNum).toEqual(3);
    expect(vref.verseNum).toEqual(4);
    expect(vref.verse).toEqual('4b-5a');
    // expect(vref.segment(null)).toEqual('b');
    // expect(vref.allVerses().Count()).toEqual(2);
    expect(vref.versification).toEqual(ScrVers.Vulgate);
  });
});
