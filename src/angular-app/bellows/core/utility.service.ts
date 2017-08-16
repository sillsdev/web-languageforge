export function UtilityService() {
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

  this.isAudio = function isAudio(tag: string):boolean {
    const tagAudioPattern = /^\w{2,3}-Zxxx-x(-\w{2,3})*-[aA][uU][dD][iI][oO]$/;
    return tagAudioPattern.test(tag);
  };

  /**
   * Copy array retaining any references to the target.
   */
  this.arrayCopyRetainingReferences = function arrayCopyRetainingReferences<T>(source: Array<T>, target: Array<T>) {
    // The length = 0 followed by Array.push.apply is a method of replacing the contents of an
    // array without creating a new array thereby keeping original references to the array.
    target.length = 0;
    this.arrayExtend(target, source);
  };

  /**
   * Extend array retaining any references to the target.
   */
  this.arrayExtend = function arrayExtend<T>(target: Array<T>, extra: Array<T>) {
    Array.prototype.push.apply(target, extra);
  };

}
