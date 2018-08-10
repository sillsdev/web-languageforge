export interface Text {
  id: string;
  audioFileName?: string;
  content?: string;
  endCh?: number;
  endVs?: number;
  // noinspection SpellCheckingInspection
  fontfamily?: string;
  isArchived?: boolean;
  title?: string;
  startCh?: number;
  startVs?: number;
  url?: string;
}

export interface Question {
  id: string;
  answers?: { [answerId: string]: Answer };
  calculatedTitle?: string;
  dateEdited?: string;
  description?: string;
  isArchived?: boolean;
  textRef?: string;
  title?: string;
  url?: string;
  userRef?: UserRef;
  workflowState?: string;
}

export interface QuestionTemplate {
  id: string;
  description?: string;
  title?: string;
}

export interface Answer {
  id: string;
  comments?: { [commentId: string]: Comment };
  isToBeExported?: boolean;
  score?: number;
  tags?: string[];
  textHighlight?: string;
  userRef?: UserRef;
}

export interface Comment {
  id: string;
  content?: string;
  dateCreated?: string;
  dateEdited?: string;
  userRef?: UserRef;
}

interface UserRef {
  // noinspection SpellCheckingInspection
  userid: string;
}
