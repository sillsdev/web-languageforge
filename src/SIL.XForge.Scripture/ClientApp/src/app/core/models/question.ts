import { UserRef } from 'xforge-common/models/user';
import { SFProjectRef } from './sfproject';

export class Question {
  id: string;
  owner: UserRef;
  project: SFProjectRef;
  source?: QuestionSource;
  scriptureStart?: VerseRefData;
  scriptureEnd?: VerseRefData;
  text?: string;
  audioUrl?: string;
}

export enum QuestionSource {
  Created = 'Created',
  Transcelerator = 'Transcelerator'
}

export interface VerseRefData {
  book?: string;
  chapter?: string;
  verse?: string;
  versification?: string;
}
