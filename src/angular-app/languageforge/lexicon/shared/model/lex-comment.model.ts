import {LexAuthorInfo} from './lex-author-info.model';

export class LexComment {
  authorInfo: LexAuthorInfo;
  content: string;
  contextGuid: string;
  entryRef: string;
  id: string;
  isDeleted: boolean;
  regarding: LexCommentFieldReference;
  replies: LexCommentReply[];
  score: number;
  status: string;
}

export class LexCommentReply {
  authorInfo: LexAuthorInfo;
  content: string;
  guid: string;
  id: string;
  isDeleted: boolean;
}

class LexCommentFieldReference {
  field: string;
  fieldNameForDisplay: string;
  fieldValue: string;
  inputSystem: string;
  inputSystemAbbreviation: string;
  meaning: string;
  word: string;
}
