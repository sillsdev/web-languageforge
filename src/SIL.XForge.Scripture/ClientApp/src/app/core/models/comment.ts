import { VerseRefData } from './verse-ref-data';

export interface Comment {
  id: string;
  ownerRef: string;
  projectRef: string;
  answerRef?: string;
  scriptureStart?: VerseRefData;
  scriptureEnd?: VerseRefData;
  text?: string;
  audioUrl?: string;
}
