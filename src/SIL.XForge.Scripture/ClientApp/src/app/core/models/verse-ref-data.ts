import { ScrVersType } from './sfdomain-model.generated';

export class VerseRefData {
  constructor(
    public bookNum?: number,
    public chapterNum?: number,
    public verseNum?: number,
    public versification: ScrVersType = ScrVersType.English
  ) {}
}
