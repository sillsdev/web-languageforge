import {InterfaceConfig} from '../../../../bellows/shared/model/interface-config.model';
import {Rights} from '../../core/lexicon-rights.service';
import {LexComment} from '../../shared/model/lex-comment.model';
import {LexEntry} from '../../shared/model/lex-entry.model';
import {LexField} from '../../shared/model/lex-field.model';
import {LexConfig, LexiconConfig} from '../../shared/model/lexicon-config.model';
import {LexiconProject} from '../../shared/model/lexicon-project.model';

// ToDo: When all the fields are converted to TS we can then figure out how to deal with this control - IJH 2018-04
// for now we can use this class to map what is used in it and if nothing else limit what is passed rather than the
// entire editor controller.
export class FieldControl {
  interfaceConfig: InterfaceConfig;
  commentContext: { contextGuid: string };
  config: LexiconConfig;
  currentEntry: LexEntry;
  deleteEntry: (currentEntry: LexEntry) => Promise<void>;
  getContextParts: (contextGuid: string) => any;
  getNewComment?: () => LexComment;
  hideRightPanel: () => void;
  makeValidModelRecursive: (config: LexConfig, data?: any, stopAtNodes?: string | string[]) => any;
  project: LexiconProject;
  saveCurrentEntry: (doSetEntry?: boolean,
                     successCallback?: () => void,
                     failCallback?: (reason?: any) => void) => void;
  selectFieldForComment?: (fieldName: string, model: LexField, inputSystemTag: string, multioptionValue: string,
                           pictureFilePath: string, contextGuid: string) => void;
  setCommentContext: (contextGuid: string) => void;
  show: {
    emptyFields: boolean
  };
  showCommentsPanel: () => void;
  rightPanelVisible: boolean;
  rights: Rights;
}
