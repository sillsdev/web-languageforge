import { InputSystem } from '../../../../shared/model/input-system.model';
import { ParatextProject } from '../../../../shared/model/paratext-user-info.model';

export class TranslateConfig {
  confidenceThreshold: number;
  documentSets: TranslateConfigDocumentSets;
  isTranslationDataShared?: boolean | string;
  isTranslationDataScripture?: boolean;
  metrics: TranslateConfigMetrics;
  source?: TranslateConfigDocType;
  target?: TranslateConfigDocType;
  userPreferences: TranslateUserPreferences;
}

export class TranslateConfigDocType {
  inputSystem?: InputSystem;
  paratextProject?: ParatextProject;
}

export class TranslateConfigDocumentSets {
  idsOrdered: string[];
}

export class TranslateUserPreferences {
  confidenceThreshold: number;
  hasConfidenceOverride: boolean;
  isDocumentOrientationTargetRight: boolean;
  isFormattingOptionsShown: boolean;
  selectedDocumentSetId: string;
}

export class TranslateConfigMetrics {
  activeEditTimeout: number;
  editingTimeout: number;
}
