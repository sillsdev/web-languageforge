import { ProjectData } from '@xforge-common/models/project-data';
import { SFProjectRef } from './sfproject';
import { SFUserRef } from './sfproject.generated';

export abstract class SFProjectData extends ProjectData {
  owner?: SFUserRef;
  project?: SFProjectRef;
}
