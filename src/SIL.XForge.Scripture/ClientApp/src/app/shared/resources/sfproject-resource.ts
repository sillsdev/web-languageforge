import { ProjectAttributes, ProjectResource } from '@xforge-common/resources/project-resource';

export interface SFProjectAttributes extends ProjectAttributes {
  config?: any;
}

export interface SFProjectResource extends ProjectResource {
  attributes?: SFProjectAttributes;
}
