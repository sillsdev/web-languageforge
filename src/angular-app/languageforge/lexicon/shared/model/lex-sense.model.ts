import {LexAuthorInfo} from './lex-author-info.model';
import {LexExample} from './lex-example.model';
import {LexField} from './lex-field.model';
import {LexMultiText} from './lex-multi-text.model';
import {LexMultiValue} from './lex-multi-value.model';
import {LexPicture} from './lex-picture.model';
import {LexValue} from './lex-value.model';

export class LexSense {
  liftId: string;
  guid: string;
  definition: LexMultiText;
  gloss: LexMultiText;
  pictures: LexPicture[];
  partOfSpeech: LexValue;
  semanticDomain: LexMultiValue;
  examples: LexExample[];
  customFields: { [fieldName: string]: LexField };
  authorInfo: LexAuthorInfo;

  // less common fields used in FLEx
  scientificName?: LexMultiText;
  anthropologyNote?: LexMultiText;
  senseBibliography?: LexMultiText;
  discourseNote?: LexMultiText;
  encyclopedicNote?: LexMultiText;
  generalNote?: LexMultiText;
  grammarNote?: LexMultiText;
  phonologyNote?: LexMultiText;
  senseRestrictions?: LexMultiText;
  semanticsNote?: LexMultiText;
  sociolinguisticsNote?: LexMultiText;
  source?: LexMultiText;
  usages?: LexMultiValue;
  reversalEntries?: LexMultiValue;
  senseType?: LexValue;
  academicDomains?: LexMultiValue;
  anthropologyCategories?: LexMultiValue;
  senseImportResidue?: LexMultiText;
  status?: LexMultiValue;
}
