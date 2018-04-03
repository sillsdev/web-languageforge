import {Project} from '../../../../bellows/shared/model/project.model';
import {LexiconConfig} from './lexicon-config.model';

export class LexiconProject extends Project {
  config?: LexiconConfig;
}
