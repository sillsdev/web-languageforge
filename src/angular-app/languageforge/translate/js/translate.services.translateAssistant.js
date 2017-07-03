'use strict';

angular.module('translate.services')
  .service('translateAssistant', [function () {
    var engine;
    var session;

    // SIL.Machine.Translation.TranslationEngine.ctor(baseUrl, sourceLanguageTag, targetLanguageTag,
    //    projectId)
    this.initialise = function initialise(sourceLanguageTag, targetLanguageTag, projectId) {
      engine = new SIL.Machine.Translation.TranslationEngine(location.origin + '/machine',
        sourceLanguageTag, targetLanguageTag, projectId);
    };

    /**
     * translateInteractively currently dies if an empty sourceSegment is passed in.
     * also replace \u2014 with dash (otherwise get "Invalid regular expression" error in
     * bridge.js function isPunctuation)
     * @param {string} sourceSegment
     * @returns {string}
     */
    function fixSourceSegment(sourceSegment) {
      return (sourceSegment) ? sourceSegment.split('—').join('-') : '_';
    }

    // SIL.Machine.Translation.TranslationEngine.translateInteractively(sourceSegment,
    //    confidenceThreshold, onFinished)
    this.translateInteractively = function translateInteractively(sourceSegment,
                                                                  confidenceThreshold, callback) {
      if (angular.isUndefined(engine)) return;

      engine.translateInteractively(fixSourceSegment(sourceSegment), confidenceThreshold,
        function (newSession) {
          if (newSession) {
            session = newSession;
          }

          (callback || angular.noop)();
        });
    };

    // SIL.Machine.Translation.InteractiveTranslationSession.updatePrefix(prefix)
    this.updatePrefix = function updatePrefix(prefix) {
      if (angular.isUndefined(engine) || angular.isUndefined(session)) return;

      // returns suggestions
      return session.updatePrefix(prefix);
    };

    this.getCurrentSuggestion = function getCurrentSuggestion() {
      if (angular.isUndefined(engine) || angular.isUndefined(session)) return;

      return session.getCurrentSuggestion();
    };

    // SIL.Machine.Translation.InteractiveTranslationSession.approve(onFinished)
    this.learnSegment = function learnSegment(callback) {
      if (angular.isUndefined(engine) || angular.isUndefined(session)) return;

      // TODO: enable learning
      // session.approve(callback);
      (callback || angular.noop)();
    };

  }])

  ;
