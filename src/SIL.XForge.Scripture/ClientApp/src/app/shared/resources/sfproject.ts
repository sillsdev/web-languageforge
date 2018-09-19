import { Project, ProjectAttributes, ProjectConstants } from '@xforge-common/resources/project';

export class SFProjectConstants extends ProjectConstants {
  static readonly ACTIVE_SEND_RECEIVE_JOB = 'activeSendReceiveJob';
}

export interface SFProjectAttributes extends ProjectAttributes {
  config?: any;
}

export interface SFProject extends Project {
  attributes?: SFProjectAttributes;
}
