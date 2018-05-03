import {InterfaceConfig} from '../../../../bellows/shared/model/interface-config.model';
import {Rights} from '../../core/lexicon-rights.service';
import {LexConfig, LexiconConfig} from '../../shared/model/lexicon-config.model';
import {LexiconProject} from '../../shared/model/lexicon-project.model';

// ToDo: When all the fields are converted to TS we can then figure out how to deal with this control - IJH 2018-04
// for now we can use this class to map what is used in it and if nothing else limit what is passed rather than the
// entire editor controller.
export class FieldControl {
  interfaceConfig: InterfaceConfig;
  config: LexiconConfig;
  makeValidModelRecursive: (config: LexConfig, data?: any, stopAtNodes?: string | string[]) => any;
  project: LexiconProject;
  show: {
    emptyFields: boolean
  };
  rights: Rights;
}
