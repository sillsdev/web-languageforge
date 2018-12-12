import { Resource, ResourceRef } from './resource';

export abstract class ProjectData extends Resource {
  ownerRef?: string;
  projectRef?: string;
}

export abstract class ProjectDataRef extends ResourceRef {
  static readonly TYPE = ProjectData.TYPE;

  constructor(id: string) {
    super(ProjectDataRef.TYPE, id);
  }
}
