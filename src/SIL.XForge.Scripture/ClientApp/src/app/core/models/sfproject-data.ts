import { ProjectData, ProjectDataRef } from '@xforge-common/models/project-data';
import { SFProjectRef } from './sfproject';
import { SFUserRef } from './sfuser';

export abstract class SFProjectData extends ProjectData {
  owner?: SFUserRef;
  project?: SFProjectRef;
}

export class SFProjectDataRef extends ProjectDataRef {}
