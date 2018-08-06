import {LexAuthorInfo} from './lex-author-info.model';
import {LexField} from './lex-field.model';
import {LexMultiText} from './lex-multi-text.model';

export class LexExample {
  liftId: string;
  sentence: LexMultiText;
  translation: LexMultiText;
  translationGuid: string;
  customFields: { [fieldName: string]: LexField };
  authorInfo: LexAuthorInfo;
  guid: string;

  // less common fields used in FLEx
  reference?: LexMultiText;
}
