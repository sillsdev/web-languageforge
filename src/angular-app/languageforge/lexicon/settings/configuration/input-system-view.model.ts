import {inputSystemsRegions} from '../../../../bellows/core/input-systems/input-systems-regions.generated-data';
import {inputSystemsScripts} from '../../../../bellows/core/input-systems/input-systems-scripts.generated-data';
import {UtilityService} from '../../../../bellows/core/utility.service';
import {InputSystem} from '../../../../bellows/shared/model/input-system.model';
import {OptionSelects} from './option-selects.model';

/**
 * ConfigurationInputSystemsViewModel class (based on BCP 47)
 * References: http://en.wikipedia.org/wiki/IETF_language_tag
 *             http://tools.ietf.org/html/rfc5646#page-15
 */
export class ConfigurationInputSystemsViewModel {
  uuid: string;

  // Manage the Special dropdown on the View
  special: string;

  // Manage the Purpose dropdown on the View
  purpose: string;

  // Manage the Variant textbox on the View.
  variantString: string;

  // 2-3 letter (RFC 5646 2.2.1 Primary Language Subtag)
  language: string;

  // 3-letter (RFC 5646 2.2.2 Extended Language Subtag) currently not implemented

  // 4-letter (RFC 5646 2.2.3 Script Subtag)
  script: string;

  // 2-letter or 3-number (RFC 5646 2.2.4 Region Subtag)
  region: string;

  variant: string;

  // RFC 5646 2.2.7 Private Use Subtag

  inputSystem: InputSystem;

  private selects: any;

  constructor(selects: OptionSelects, inputSystem: InputSystem = new InputSystem()) {
    this.uuid = UtilityService.uuid();
    this.special = '';
    this.purpose = '';
    this.variantString = '';
    this.language = '';
    this.script = '';
    this.region = '';
    this.variant = '';
    this.selects = selects;
    this.inputSystem = inputSystem;
    if (inputSystem.tag !== undefined) {
      this.parseTag(inputSystem.tag);
    }
  }

  /**
   * Create a language tag based on the view
   */
  buildTag(): ConfigurationInputSystemsViewModel {
    let newTag = this.language;
    const specialOptions = this.selects.special.optionsOrder;
    switch (this.special) {
      // IPA transcription
      case specialOptions[1]:
        newTag += '-fonipa';
        if (this.purpose || this.variantString.length > 0) {
          newTag += '-x';
        }

        newTag += (this.purpose) ? '-' + this.purpose : '';
        newTag += (this.variantString) ? '-' + this.variantString : '';
        break;

      // Voice
      case specialOptions[2]:
        newTag += '-Zxxx';
        newTag += '-x';
        newTag += '-audio';
        newTag += (this.variantString) ? '-' + this.variantString : '';
        break;

      // Script / Region / Variant
      case specialOptions[3]:
        newTag += (this.script) ? '-' + this.script : '';
        newTag += (this.region) ? '-' + this.region : '';
        newTag += (this.variantString) ? '-x-' + this.variantString : '';
        if (!this.script && !this.region && !this.variantString) {
          newTag += '-unspecified';
        }

        break;
    }

    this.inputSystem.tag = newTag;

    // console.log('newTag: ' + newTag);
    return this;
  }

  /**
   * Parse the language tag to populate ConfigurationInputSystemsViewModel
   */
  parseTag(tag: string): ConfigurationInputSystemsViewModel {
    const tokens = tag.split('-');
    let hasPrivateUsage = false;

    // Assumption we will never have an entire tag that is private
    // usage or grandfathered (entire tag starts with x- or i-)

    // Language code
    this.language = tokens[0];

    const specialOptionsOrder = this.selects.special.optionsOrder;
    this.special = specialOptionsOrder[0];

    const purposeOptionsOrder = this.selects.purpose.optionsOrder;
    this.purpose = '';
    this.variantString = '';

    // Parse the rest of the language tag
    for (let i = 1, l = tokens.length; i < l; i++) {

      if (!hasPrivateUsage) {

        // Script
        // scripts would be better obtained from a service CP 2014-08
        if ((/^[a-zA-Z]{4}$/.test(tokens[i])) &&
          (tokens[i] in inputSystemsScripts)
        ) {
          this.script = tokens[i];
          this.special = specialOptionsOrder[3];
          continue;
        }

        // Region
        // scripts would be better obtained from a service CP 2014-08
        if ((/^[a-zA-Z]{2}$/.test(tokens[i]) || /^[0-9]{3}$/.test(tokens[i])) &&
          (tokens[i] in inputSystemsRegions)
        ) {
          this.region = tokens[i];
          this.special = specialOptionsOrder[3];
          continue;
        }

        // Variant
        if (/^[a-zA-Z]{5,}$/.test(tokens[i]) || /^[0-9][0-9a-zA-Z]{3,}$/.test(tokens[i])) {
          // FixMe: variant seems unused; investigate - IJH 2017-08
          this.variant = tokens[i];
          if (tokens[i] === 'fonipa') {
            this.special = specialOptionsOrder[1];
          }

          continue;
        }

        // Special marker for private usage
        if (tokens[i] === 'x') {
          hasPrivateUsage = true;
        }

        // Parse for the rest of the private usage tags
      } else {

        // SIL registered private use tags are audio, etic, and emic
        switch (tokens[i]) {
          case 'audio':
            this.special = specialOptionsOrder[2];
            continue;
          case 'etic':
            this.special = specialOptionsOrder[1];
            this.purpose = purposeOptionsOrder[0];
            continue;
          case 'emic':
            this.special = specialOptionsOrder[1];
            this.purpose = purposeOptionsOrder[1];
            continue;
          default:
            // General Private Usage used to populate variantString
            if (tokens[i]) {
              // If Special hasn't been set, presence of a token here means
              // Special must have been set to Script/Region/Variant
              if (this.special === specialOptionsOrder[0]) {
                this.special = specialOptionsOrder[3];
              }

              if (this.variantString.length > 0) {
                this.variantString += '-';
              }
            }

            this.variantString += tokens[i];
        }
      }
    }

    return this;
  }

  /**
   * Compute the language name for display
   */
  languageDisplayName(): string {
    let name = this.inputSystem.languageName;
    const specialOptions = this.selects.special.optionsOrder;

    if (this.special === specialOptions[1]) {
      name += ' (IPA';
      name += (this.variantString) ? '-' + this.variantString : '';
      name += ')';
    } else if (this.special === specialOptions[2]) {
      name += ' (Voice';
      name += (this.variantString) ? '-' + this.variantString : '';
      name += ')';
    } else if (this.special === specialOptions[3]) {
      name += ' (';
      if (this.variantString) {
        name += this.variantString;
      } else if (this.region) {
        name += this.region;
      } else if (this.script) {
        name += this.script;
      } else {
        name += 'unspecified';
      }

      name += ')';
    }

    return name;
  }
}
