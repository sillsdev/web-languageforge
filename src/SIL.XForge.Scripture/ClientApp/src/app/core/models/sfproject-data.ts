import { ProjectData } from '../../../xforge-common/models/project-data';
import { ResourceRef } from '../../../xforge-common/models/resource';

export abstract class SFProjectData extends ProjectData {}

export class SFProjectDataRef extends ResourceRef {}
