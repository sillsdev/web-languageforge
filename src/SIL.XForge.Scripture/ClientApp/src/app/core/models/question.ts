import { UserRef } from 'xforge-common/models/user';
import { Answer } from './answer';
import { SFProjectRef } from './sfproject';
import { VerseRefData } from './verse-ref-data';

export interface Question {
  id: string;
  owner: UserRef;
  project: SFProjectRef;
  source?: QuestionSource;
  scriptureStart?: VerseRefData;
  scriptureEnd?: VerseRefData;
  // used by Transcelerator to identify question (don't display to user)
  textEn?: string;
  text?: string;
  audioUrl?: string;
  modelAnswer?: string;
  answers?: Answer[];
}

export enum QuestionSource {
  Created = 'Created',
  Transcelerator = 'Transcelerator'
}
