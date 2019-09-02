import * as angular from 'angular';

export class UtilityService {
  static $inject = ['$q'];
  constructor(private $q: angular.IQService) {}

  static uuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, char => {
      // noinspection TsLint
      const r = Math.random() * 16 | 0;
      // noinspection TsLint
      const v = (char === 'x') ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // FixMe: move to lexicon-utility.service.ts - IJH 2017-11
  static getAvatarUrl(avatarRef: string): string {
    if (avatarRef) {
      return (avatarRef.startsWith('http')) ? avatarRef : '/Site/views/shared/image/avatar/' + avatarRef;
    } else {
      return '';
    }
  }

  static isAudio(tag: string): boolean {
    const tagAudioPattern = /^\w{2,3}-Zxxx-x(-\w{2,3})*-[aA][uU][dD][iI][oO]$/;
    return tagAudioPattern.test(tag);
  }

  static isIE(userAgent: string): boolean {
    return /MSIE|Trident/.test(userAgent);
  }

  /**
   * Copy array retaining any references to the target.
   */
  static arrayCopyRetainingReferences<T>(source: T[], target: T[]): void {
    // The length = 0 followed by Array.push.apply is a method of replacing the contents of an
    // array without creating a new array thereby keeping original references to the array.
    target.length = 0;
    UtilityService.arrayExtend(target, source);
  }

  /**
   * Extend array retaining any references to the target.
   */
  static arrayExtend<T>(target: T[], extra: T[]): void {
    Array.prototype.push.apply(target, extra);
  }

  // FixMe: move to sfchecks-utility service - IJH 2017-11
  readUsxFile(file: any): angular.IPromise<string> {
    return this.readFile(file, true);
  }

  // FixMe: move to sfchecks-utility service - IJH 2017-11
  readTextFile(file: any): angular.IPromise<string> {
    return this.readFile(file, false);
  }

  // FixMe: move to sfchecks-utility service - IJH 2017-11
  private readFile(file: any, isUsx: boolean = false): angular.IPromise<string> {
    if (!file || file.$error) return;

    const deferred = this.$q.defer<string>();
    const reader = new FileReader();
    reader.addEventListener('loadend', () => {
      if (isUsx) {
        // Basic sanity check: make sure what was uploaded is USX
        // First few characters should be optional BOM, optional <?xml ..., then <usx ...
        const startOfText = reader.result.slice(0, 1000);
        const usxIndex = startOfText.indexOf('<usx');
        if (usxIndex !== -1) {
          deferred.resolve(reader.result);
        } else {
          deferred.reject('Error loading USX file. The file doesn\'t appear to be valid USX.');
        }
      } else {
        deferred.resolve(reader.result);
      }
    });

    // read the clipboard item or file
    const blob = file.getAsFile ? file.getAsFile() : file;
    if (blob instanceof Blob) {
      reader.readAsText(blob);
    }

    return deferred.promise;
  }

}
