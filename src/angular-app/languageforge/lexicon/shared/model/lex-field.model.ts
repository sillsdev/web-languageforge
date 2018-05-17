import {LexMultiParagraph} from './lex-multi-paragraph.model';
import {LexMultiText} from './lex-multi-text.model';
import {LexMultiValue} from './lex-multi-value.model';
import {LexValue} from './lex-value.model';

export type LexField = LexMultiText | LexMultiParagraph | LexValue | LexMultiValue;
