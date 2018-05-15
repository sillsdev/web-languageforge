import {LexAuthorInfo} from './lex-author-info.model';
import {LexMultiParagraph} from './lex-multi-paragraph.model';
import {LexMultiText} from './lex-multi-text.model';
import {LexMultiValue} from './lex-multi-value.model';
import {LexSense} from './lex-sense.model';
import {LexValue} from './lex-value.model';

export class LexEntry {
  isDeleted?: boolean;
  id?: string;
  guid?: string;
  dirtySR?: number;
  lexeme?: LexMultiText;
  senses: LexSense[] = [];
  authorInfo?: LexAuthorInfo;
  citationForm?: LexMultiText;
  customFields?: { [fieldName: string]: LexMultiText | LexMultiParagraph | LexValue | LexMultiValue };
  entryBibliography?: LexMultiText;
  entryRestrictions?: LexMultiText;
  environments?: LexMultiValue;
  etymology?: LexMultiText;
  etymologyGloss?: LexMultiText;
  etymologyComment?: LexMultiText;
  etymologySource?: LexMultiText;
  literalMeaning?: LexMultiText;
  location?: LexValue;
  mercurialSha?: string;
  morphologyType?: string;
  note?: LexMultiText;
  pronunciation?: LexMultiText;
  cvPattern?: LexMultiText;
  tone?: LexMultiText;
  summaryDefinition?: LexMultiText;
}
