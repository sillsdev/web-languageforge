import { UserRef } from 'xforge-common/models/user';
import { SFProjectRef } from './sfproject';
import { VerseRefData } from './verse-ref-data';

export interface Comment {
  id: string;
  owner: UserRef;
  project: SFProjectRef;
  answerId?: string;
  scriptureStart?: VerseRefData;
  scriptureEnd?: VerseRefData;
  text?: string;
  audioUrl?: string;
}
