import { Record } from '@orbit/data';
import { Dict } from '@orbit/utils';

export interface ProjectAttributes extends Dict<any> {
  projectName?: string;
  projectCode?: string;
}

export interface ProjectResource extends Record {
  attributes?: ProjectAttributes;
}
