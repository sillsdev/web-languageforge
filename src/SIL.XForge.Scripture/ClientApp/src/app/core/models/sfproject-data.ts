import { Resource } from '@xforge-common/models/resource';
import { SFProjectRef } from './sfproject';
import { SFUserRef } from './sfuser';

export abstract class SFProjectData extends Resource {
  owner?: SFUserRef;
  project?: SFProjectRef;
}
