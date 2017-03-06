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

    // SIL.Machine.Translation.TranslationEngine.translateInteractively(sourceSegment,
    //    confidenceThreshold, onFinished)
    this.translateInteractively = function translateInteractively(sourceSegment,
                                                                  confidenceThreshold, callback) {
      if (angular.isUndefined(engine)) return;

      engine.translateInteractively(sourceSegment, confidenceThreshold, function (newSession) {
        if (newSession) {
          session = newSession;
        }

        (callback || angular.noop)();
      });
    };

    // SIL.Machine.Translation.InteractiveTranslationSession.updatePrefix(prefix)
    this.updatePrefix = function updatePrefix(prefix, callback) {
      if (angular.isUndefined(engine) || angular.isUndefined(session)) return;

      var suggestions = session.updatePrefix(prefix);
      (callback || angular.noop)(suggestions);
    };

    this.getCurrentSuggestion = function getCurrentSuggestion(callback) {
      if (angular.isUndefined(engine) || angular.isUndefined(session)) return;

      var suggestions = session.getCurrentSuggestion();
      (callback || angular.noop)(suggestions);
    };

  }])

  ;
