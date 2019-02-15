import { AbstractControl, ValidationErrors } from '@angular/forms';

import { ScrVers } from '../core/models/scripture/scr-vers';
import { VerseRef } from '../core/models/scripture/verse-ref';

export class SFValidators {
  static verseStr(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return null;
    }

    const verseRef = VerseRef.fromStr(control.value, ScrVers.English);

    return verseRef.valid ? null : { verseStr: true };
  }
}
