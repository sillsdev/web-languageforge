'use strict';

angular.module('bellows.services')
  .service('utilService', function () {
    this.uuid = function uuid() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0;
        var v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    };

    this.getAvatarUrl = function getAvatarUrl(avatarRef) {
      return (avatarRef) ? '/Site/views/shared/image/avatar/' + avatarRef : '';
    };

    this.isAudio = function isAudio(tag) {
      var tagAudioPattern = /^\w{2,3}-Zxxx-x(-\w{2,3})*-[aA][uU][dD][iI][oO]$/;
      return tagAudioPattern.test(tag);
    };

    /**
     * Copy array retaining any references to the target.
     * @param {Array} sourceArray
     * @param {Array} targetArray
     */
    this.arrayCopyRetainingReferences =
      function arrayCopyRetainingReferences(sourceArray, targetArray) {
        // The length = 0 followed by Array.push.apply is a method of replacing the contents of an
        // array without creating a new array thereby keeping original references to the array.
        targetArray.length = 0;
        this.arrayExtend(targetArray, sourceArray);
      };

    /**
     * Extend array retaining any references to the target.
     * @param {Array} targetArray
     * @param {Array} extraArray
     */
    this.arrayExtend = function arrayExtend(targetArray, extraArray) {
      Array.prototype.push.apply(targetArray, extraArray);
    };

  });
