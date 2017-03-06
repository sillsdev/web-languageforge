'use strict';

angular.module('translate.settings', ['bellows.services', 'ui.bootstrap', 'palaso.ui.listview',
  'palaso.ui.typeahead', 'palaso.ui.archiveProject', 'palaso.ui.deleteProject', 'palaso.ui.notice',
  'palaso.ui.textdrop', 'translate.languages'])
  .controller('SettingsCtrl', ['$scope', '$filter', 'userService', 'sessionService',
    'silNoticeService', 'translateRightsService', 'translateProjectService', 'translateAssistant',
  function ($scope, $filter, userService, sessionService,
            notice, rights, projectService, assistant) {
    $scope.rights = rights;
    $scope.project = $scope.project || {};
    $scope.project.config = $scope.project.config || {};
    $scope.actionInProgress = false;

    projectService.readProject(function (result) {
      if (result.ok) {
        angular.merge($scope.project, result.data.project);
      }
    });

    $scope.updateProject = function () {
      var settings = {
        projectName: $scope.project.projectName,
        interfaceLanguageCode: $scope.project.interfaceLanguageCode,
        featured: $scope.project.featured,
        config: $scope.project.config
      };

      projectService.updateProject(settings, function (result) {
        if (result.ok) {
          assistant.initialise($scope.project.config.source.inputSystem.tag,
            $scope.project.config.target.inputSystem.tag, $scope.project.slug);
          notice.push(notice.SUCCESS,
            $scope.project.projectName + ' settings updated successfully.');
        }
      });
    };

    $scope.updateConfig = function () {
      projectService.updateConfig($scope.project.config, function (result) {
        if (result.ok) {
          assistant.initialise($scope.project.config.source.inputSystem.tag,
            $scope.project.config.target.inputSystem.tag, $scope.project.slug);
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
  }])

  ;
