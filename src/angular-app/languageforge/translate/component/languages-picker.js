'use strict';

angular.module('translate.languages', ['palaso.ui.language'])
  .component('languagesPicker', {
    templateUrl: '/angular-app/languageforge/translate/component/languages-picker.html',
    bindings: {
      tlpProject: '<',
      tlpUpdateLanguage: '&'
    },
    controller: ['$uibModal', function ($modal) {
      this.tlpProject = this.tlpProject || {};
      this.tlpProject.config = this.tlpProject.config || {};
      this.tlpProject.config.isTranslationDataShared =
        this.tlpProject.config.isTranslationDataShared || true;

      this.displayLanguage = function displayLanguage(tag, languageName) {
        if (languageName) {
          return languageName + ' (' + tag + ')';
        }

        return '';
      };

      this.openLanguageModal = function (type) {
        var modalInstance = $modal.open({
          templateUrl: '/angular-app/languageforge/translate/component/select-language.html',
          controller: ['$scope', '$uibModalInstance', function ($scope, $modalInstance) {
            var typeNames = { source: 'Source', target: 'Target' };
            $scope.typeName = typeNames[type];
            $scope.selected = {
              code: '',
              language: {}
            };
            $scope.select = function () {
              $modalInstance.close($scope.selected);
            };
          }],

          windowTopClass: 'modal-select-language'
        });
        modalInstance.result.then(function (selected) {
          (this.tlpUpdateLanguage || angular.noop)({
            docType: type,
            code: selected.code,
            language: selected.language
          });
        }.bind(this));
      };

    }]
  })

;
