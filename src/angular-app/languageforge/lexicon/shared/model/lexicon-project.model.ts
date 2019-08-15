import {Project} from '../../../../bellows/shared/model/project.model';
import {LexiconConfig} from './lexicon-config.model';

export interface LexiconProject extends Project {
  config?: LexiconConfig;
  languageCode: string;
  sendReceive?: SendReceive;
}

export type LexRoleKey = 'manager' | 'contributor' | 'observer_with_comment' | 'observer' | 'tech_support';

export class SendReceive {
  credentialsStatus?: string;
  isUnchecked?: boolean;
  password: string;
  project: SendReceiveProject;
  projects?: SendReceiveProject[];
  projectStatus: string;
  username: string;
}

export class SendReceiveProject {
  identifier?: string;
  isLinked: boolean;
  name: string;
  repoClarification: string;
  repository: string;
  role: string;
}
