'use strict';

angular.module('translate.services')
  .service('translateAssistant',
    [
  function () {
    var engine = {};

    // SIL.Machine.Translation.TranslationEngine.ctor(sourceLanguageTag, targetLanguageTag)
    this.initialise = function initialise(sourceLanguageTag, targetLanguageTag) {
      engine = new SIL.Machine.Translation.TranslationEngine(
        'https://cat.languageforge.org/machine', sourceLanguageTag, targetLanguageTag);
    };

    // SIL.Machine.Translation.TranslationEngine.translateInteractively(sourceSegment,
    //    confidenceThreshold, onFinished)
    this.translateInteractively = engine.translateInteractively;

    // SIL.Machine.Translation.InteractiveTranslationSession.setPrefix$1(prefix, isLastWordComplete)
    this.setPrefix = function setPrefix(sourceSegment, confidenceThreshold, prefixWords,
                                        isLastWordComplete, callback) {
      engine.translateInteractively(sourceSegment, confidenceThreshold, function (session) {
        if (!session) {
          (callback || angular.noop)('');
          return;
        }

        // setPrefix$1 returns suggestions array
        (callback || angular.noop)(session.setPrefix$1(prefixWords, isLastWordComplete));
      });
    };

    this.getCurrentSuggestion = function getCurrentSuggestion(sourceSegment, confidenceThreshold,
                                                              callback) {
      engine.translateInteractively(sourceSegment, confidenceThreshold, function (session) {
        if (!session) {
          (callback || angular.noop)('');
          return;
        }

        (callback || angular.noop)(session.getCurrentSuggestion());
      });
    };

  }])

  ;
