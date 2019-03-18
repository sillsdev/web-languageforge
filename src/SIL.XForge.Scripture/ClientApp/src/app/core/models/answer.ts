import { UserRef } from 'xforge-common/models/user';
import { VerseRefData } from './verse-ref-data';

export interface Answer {
  id: string;
  owner: UserRef;
  scriptureStart?: VerseRefData;
  scriptureEnd?: VerseRefData;
  text?: string;
  audioUrl?: string;
}
