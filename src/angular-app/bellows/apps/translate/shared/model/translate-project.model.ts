import { Project } from '../../../../shared/model/project.model';
import { TranslateConfig } from './translate-config.model';

export class TranslateProject extends Project {
  config?: TranslateConfig;
}
