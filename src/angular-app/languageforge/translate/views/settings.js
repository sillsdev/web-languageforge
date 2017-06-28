'use strict';

angular.module('translate.settings', ['bellows.services', 'ui.bootstrap', 'palaso.ui.listview',
  'palaso.ui.typeahead', 'palaso.ui.archiveProject', 'palaso.ui.deleteProject', 'palaso.ui.notice',
  'palaso.ui.textdrop', 'translate.languages'])
  .controller('SettingsCtrl',
    ['$scope', 'silNoticeService', 'translateProjectApi', 'translateAssistant',
  function ($scope, notice, projectApi, assistant) {
    $scope.actionInProgress = false;
    var pristineProject;

    projectApi.readProject(function (result) {
      if (result.ok) {
        angular.merge($scope.project, result.data.project);
        pristineProject = angular.copy($scope.project);
      }
    });

    $scope.updateProject = function () {
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
          assistant.initialise($scope.project.config.source.inputSystem.tag,
            $scope.project.config.target.inputSystem.tag, $scope.project.slug);
          pristineProject = angular.copy($scope.project);
          notice.push(notice.SUCCESS,
            $scope.project.projectName + ' settings updated successfully.');
        }
      });
    };

    $scope.updateConfig = function () {
      projectApi.updateConfig($scope.project.config, function (result) {
        if (result.ok) {
          assistant.initialise($scope.project.config.source.inputSystem.tag,
            $scope.project.config.target.inputSystem.tag, $scope.project.slug);
          pristineProject = angular.copy($scope.project);
          notice.push(notice.SUCCESS,
            $scope.project.projectName + ' configuration updated successfully.');
        }
      });
    };

    $scope.updateLanguage = function updateLanguage(docType, code, language) {
      $scope.project.config[docType] = $scope.project.config[docType] || {};
      $scope.project.config[docType].inputSystem.tag = code;
      $scope.project.config[docType].inputSystem.languageName = language.name;
    };

    $scope.$on('$destroy', function () {
      angular.copy(pristineProject, $scope.project);
    });

  }])

  ;
