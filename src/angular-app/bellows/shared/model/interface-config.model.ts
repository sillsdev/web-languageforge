import {OrderedOptions} from './options.model';

export class InterfaceConfig {
  direction = 'ltr';
  pullNormal = 'float-left';
  pullToSide = 'float-right';
  placementNormal = 'right';
  placementToSide = 'left';
  languageCode = 'en';
  isUserLanguageCode?: boolean;
  audioRecordingCodec: 'webm';
  whenToConvertAudio: 'never';
  selectLanguages?: OrderedOptions<SelectLanguage>;
  selectAudioRecordingCodec?: OrderedOptions<SelectAudioRecordingCodec>;
  selectWhenToConvertAudio?: OrderedOptions<SelectWhenToConvertAudio>;
}

export interface SelectLanguage {
  name: string;
  option: string;
  hasSemanticDomain?: boolean;
}

export interface SelectAudioRecordingCodec {
  codec: string;
}

export interface SelectWhenToConvertAudio {
  frequency: string;
}
