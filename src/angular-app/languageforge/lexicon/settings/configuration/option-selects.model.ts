import {InputSystemsService} from '../../../../bellows/core/input-systems/input-systems.service';
import {Options, OrderedOptions} from '../../../../bellows/shared/model/options.model';

export class OptionSelects {
  special: OrderedOptions;
  purpose: OrderedOptions;
  script: Options;
  region: Options;

  constructor() {
    this.special = {
      optionsOrder: ['none', 'ipaTranscription', 'voice', 'scriptRegionVariant'],
      options: {
        none: 'none',
        ipaTranscription: 'IPA transcription',
        voice: 'Voice',
        scriptRegionVariant: 'Script / Region / Variant'
      }
    };
    this.purpose = {
      optionsOrder: ['etic', 'emic'],
      options: {
        etic: 'Etic (raw phonetic transcription)',
        emic: 'Emic (uses the phonology of the language)'
      }
    };
    this.script = {
      options: InputSystemsService.scripts()
    };
    this.region = {
      options: InputSystemsService.regions()
    };
  }
}
