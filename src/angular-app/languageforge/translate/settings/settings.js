'use strict';

angular.module('translate.settings', ['bellows.services', 'ui.bootstrap', 'palaso.ui.listview',
  'palaso.ui.typeahead', 'palaso.ui.archiveProject', 'palaso.ui.deleteProject', 'palaso.ui.notice',
  'palaso.ui.textdrop', 'translate.languages', 'rzModule'])
  .controller('SettingsCtrl',
    ['$scope', '$interval', 'silNoticeService', 'translateRightsService', 'translateProjectApi',
      'machineService', 'modalService',
  function ($scope, $interval, notice, rightsService, projectApi, machineService, modal) {
    $scope.actionInProgress = false;
    $scope.retrainMessage = '';
    $scope.confidence = {
      value: undefined,
      isMyThreshold: false,
      options: {
        floor: 0,
        ceil: 100,
        step: 1,
        showSelectionBar: true,
        translate: function (value) {
          return value + '%';
        }
      }
    };

    var pristineProject;

    rightsService.getRights().then(function (rights) {
      $scope.rights = rights;
    });

    projectApi.readProject(function (result) {
      if (result.ok) {
        angular.merge($scope.project, result.data.project);
        $scope.project.config = $scope.project.config || {};
        pristineProject = angular.copy($scope.project);
        machineService.initialise($scope.project.slug);
        machineService.listenForTrainingStatus(onTrainStatusUpdate, onTrainSuccess);
        if (angular.isDefined($scope.project.config.userPreferences)) {
          if (angular.isDefined($scope.project.config.userPreferences.hasConfidenceOverride)) {
            $scope.confidence.isMyThreshold =
              $scope.project.config.userPreferences.hasConfidenceOverride;
          }

          if (angular.isUndefined($scope.project.config.userPreferences.confidenceThreshold) ||
            !(isFinite($scope.project.config.userPreferences.confidenceThreshold) &&
              angular.isNumber($scope.project.config.userPreferences.confidenceThreshold))
          ) {
            $scope.project.config.userPreferences.confidenceThreshold =
              $scope.project.config.confidenceThreshold;
          }
        }

        selectWhichConfidence();
        if (angular.isUndefined($scope.project.config.isTranslationDataShared) ||
          $scope.project.config.isTranslationDataShared === ''
        ) {
          $scope.project.config.isTranslationDataShared = true;
        }
      }
    });

    $scope.updateProject = function () {
      updateConfigConfidenceValues();
      var projectData = {
        id: $scope.project.id,
        projectName: $scope.project.projectName,
        interfaceLanguageCode: $scope.project.interfaceLanguageCode,
        featured: $scope.project.featured,
        config: $scope.project.config
      };

      projectApi.updateProject(projectData, function (result) {
        if (result.ok) {
          $scope.project.id = result.data;
          machineService.initialise($scope.project.slug);
          pristineProject = angular.copy($scope.project);
          notice.push(notice.SUCCESS,
            $scope.project.projectName + ' settings updated successfully.');
        }
      });
    };

    $scope.updateConfig = function () {
      if ($scope.rights.canEditProject()) {
        $scope.updateProject();
      } else if ($scope.rights.canEditEntry()) {
        updateConfigConfidenceValues();
        projectApi.updateUserPreferences($scope.project.config.userPreferences, function (result) {
          if (result.ok) {
            pristineProject.config.userPreferences =
              angular.copy($scope.project.config.userPreferences);
            notice.push(notice.SUCCESS,
              $scope.project.projectName + ' confidence updated successfully.');
          }
        });
      }
    };

    $scope.retrain = function retrain() {
      var retrainMessage = 'This will retrain the translation engine using the existing data. ' +
        'This can take several minutes and will operate in the background.<br /><br />' +
        'Are you sure you want to retrain the translation engine?';
      modal.showModalSimple('Retrain Translation Engine?', retrainMessage, 'Cancel', 'Retrain')
        .then(function () {
          machineService.train(onTrainStatusUpdate, onTrainFinished);
        }, angular.noop);
    };

    $scope.updateLanguage = function updateLanguage(docType, code, language) {
      $scope.project.config[docType] = $scope.project.config[docType] || {};
      $scope.project.config[docType].inputSystem.tag = code;
      $scope.project.config[docType].inputSystem.languageName = language.name;
    };

    $scope.redrawSlider = function redrawSlider() {
      $interval(function () {
        $scope.$broadcast('rzSliderForceRender');
      }, 0, 1);
    };

    $scope.selectWhichConfidence = selectWhichConfidence;
    function selectWhichConfidence() {
      $scope.confidence.options.disabled = !$scope.confidence.isMyThreshold &&
        !$scope.rights.canEditProject();
      if ($scope.confidence.isMyThreshold) {
        if (angular.isDefined($scope.confidence.value) && isFinite($scope.confidence.value)) {
          $scope.project.config.confidenceThreshold =
            convertValueToThreshold($scope.confidence.value);
          delete $scope.confidence.value;
        }

        $scope.confidence.value =
          convertThresholdToValue($scope.project.config.userPreferences.confidenceThreshold);
      } else {
        if (angular.isDefined($scope.confidence.value) && isFinite($scope.confidence.value)) {
          $scope.project.config.userPreferences.confidenceThreshold =
            convertValueToThreshold($scope.confidence.value);
          delete $scope.confidence.value;
        }

        $scope.confidence.value =
          convertThresholdToValue($scope.project.config.confidenceThreshold);
      }
    }

    $scope.$on('$destroy', function () {
      angular.copy(pristineProject, $scope.project);
    });

    function onTrainStatusUpdate(progress) {
      $scope.$applyAsync(function () {
        $scope.retrainMessage = progress.percentCompleted + '% ' + progress.currentStepMessage;
      });
    }

    function onTrainSuccess(isSuccess) {
      if (isSuccess) {
        $scope.$applyAsync(function () {
          notice.push(notice.SUCCESS, 'Finished re-training the translation engine');
        });
      }
    }

    function onTrainFinished(isSuccess) {
      onTrainSuccess(isSuccess);
      if (!isSuccess) {
        $scope.$applyAsync(function () {
          notice.push(notice.ERROR, 'Could not re-train the translation engine');
        });
      }
    }

    function convertThresholdToValue(threshold) {
      var range = $scope.confidence.options.ceil - $scope.confidence.options.floor;
      return $scope.confidence.options.floor + threshold * range;
    }

    function convertValueToThreshold(value) {
      var range = $scope.confidence.options.ceil - $scope.confidence.options.floor;
      return (value - $scope.confidence.options.floor) / range;
    }

    function updateConfigConfidenceValues() {
      $scope.project.config.userPreferences = $scope.project.config.userPreferences || {};
      $scope.project.config.userPreferences.hasConfidenceOverride = $scope.confidence.isMyThreshold;
      if ($scope.confidence.isMyThreshold) {
        $scope.project.config.userPreferences.confidenceThreshold =
          convertValueToThreshold($scope.confidence.value);
      } else {
        $scope.project.config.confidenceThreshold =
          convertValueToThreshold($scope.confidence.value);
      }
    }

  }])

  ;
