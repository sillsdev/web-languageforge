import * as angular from 'angular';

export interface UtilityService {
  uuid(): string;
  getAvatarUrl(avatarRef: string): string;
  isAudio(tag: string): boolean;
  arrayCopyRetainingReferences<T>(source: Array<T>, target: Array<T>): void;
  arrayExtend<T>(target: Array<T>, extra: Array<T>): void;
  readUsxFile(file: any): angular.IPromise<string>;
  readTextFile(file: any): angular.IPromise<string>;
}

export function UtilityService($q: angular.IQService) {
  this.uuid = function uuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      let r = Math.random() * 16 | 0;
      let v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  this.getAvatarUrl = function getAvatarUrl(avatarRef: string): string {
    return (avatarRef) ? '/Site/views/shared/image/avatar/' + avatarRef : '';
  };

  this.isAudio = function isAudio(tag: string): boolean {
    const tagAudioPattern = /^\w{2,3}-Zxxx-x(-\w{2,3})*-[aA][uU][dD][iI][oO]$/;
    return tagAudioPattern.test(tag);
  };

  /**
   * Copy array retaining any references to the target.
   */
  this.arrayCopyRetainingReferences =
    function arrayCopyRetainingReferences<T>(source: Array<T>, target: Array<T>): void {
      // The length = 0 followed by Array.push.apply is a method of replacing the contents of an
      // array without creating a new array thereby keeping original references to the array.
      target.length = 0;
      this.arrayExtend(target, source);
    };

  /**
   * Extend array retaining any references to the target.
   */
  this.arrayExtend = function arrayExtend<T>(target: Array<T>, extra: Array<T>): void {
    Array.prototype.push.apply(target, extra);
  };

  function readFile(file: any, isUsx: boolean = false): angular.IPromise<string> {
    if (!file || file.$error) return;

    let deferred = $q.defer<string>();
    const reader = new FileReader();
    reader.addEventListener('loadend', function () {
      if (isUsx) {
        // Basic sanity check: make sure what was uploaded is USX
        // First few characters should be optional BOM, optional <?xml ..., then <usx ...
        let startOfText = reader.result.slice(0, 1000);
        let usxIndex = startOfText.indexOf('<usx');
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

  this.readUsxFile = function readUsxFile(file: any): angular.IPromise<string> {
    return readFile(file,true);
  };

  this.readTextFile = function readTextFile(file: any): angular.IPromise<string> {
    return readFile(file,false);
  };

}
