import {Project, ProjectRole, ProjectRoles} from '../../../../bellows/shared/model/project.model';
import {LexiconConfig} from './lexicon-config.model';

export interface LexiconProject extends Project {
  config?: LexiconConfig;
  languageCode: string;
  sendReceive?: SendReceive;
}

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

export class LexRoles extends ProjectRoles {
  static OBSERVER_WITH_COMMENT: ProjectRole = { name: 'Observer With Comment', key: 'observer_with_comment' };
  static OBSERVER: ProjectRole = { name: 'Observer', key: 'observer' };
}
