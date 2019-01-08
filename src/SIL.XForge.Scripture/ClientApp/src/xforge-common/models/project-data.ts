import { Resource, ResourceRef } from './resource';

export abstract class ProjectData extends Resource {
  ownerRef?: string;
  projectRef?: string;
}

export abstract class ProjectDataRef extends ResourceRef {}
