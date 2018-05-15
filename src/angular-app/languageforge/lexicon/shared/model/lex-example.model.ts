import {LexAuthorInfo} from './lex-author-info.model';
import {LexMultiParagraph} from './lex-multi-paragraph.model';
import {LexMultiText} from './lex-multi-text.model';
import {LexMultiValue} from './lex-multi-value.model';
import {LexValue} from './lex-value.model';

export class LexExample {
  liftId: string;
  sentence: LexMultiText;
  translation: LexMultiText;
  translationGuid: string;
  customFields: { [fieldName: string]: LexMultiText | LexMultiParagraph | LexValue | LexMultiValue };
  authorInfo: LexAuthorInfo;
  guid: string;

  // less common fields used in FLEx
  reference?: LexMultiText;
}
