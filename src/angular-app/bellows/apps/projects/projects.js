'use strict';

angular.module('projects', ['bellows.services', 'palaso.ui.listview', 'ui.bootstrap',
  'palaso.ui.notice', 'palaso.ui.utils', 'wc.Directives'
])
  .controller('ProjectsCtrl', ['$scope', 'projectService', 'sessionService', 'silNoticeService',
  function ($scope, projectService, ss, notice) {
    $scope.finishedLoading = false;

    // Rights
    $scope.rights = {};
    $scope.rights.edit = ss.hasSiteRight(ss.domain.PROJECTS, ss.operation.EDIT);
    $scope.rights.create = ss.hasSiteRight(ss.domain.PROJECTS, ss.operation.CREATE);
    $scope.rights.showControlBar = $scope.rights.create;

    $scope.siteName = ss.baseSite();

    // Listview Selection
    $scope.newProjectCollapsed = true;
    $scope.selected = [];
    $scope.updateSelection = function (event, item) {
      var selectedIndex = $scope.selected.indexOf(item);
      var checkbox = event.target;
      if (checkbox.checked && selectedIndex == -1) {
        $scope.selected.push(item);
      } else if (!checkbox.checked && selectedIndex != -1) {
        $scope.selected.splice(selectedIndex, 1);
      }
    };

    $scope.isSelected = function (item) {
      return item != null && $scope.selected.indexOf(item) >= 0;
    };

    // Listview Data
    $scope.projects = [];
    $scope.queryProjectsForUser = function () {
      projectService.list(function (result) {
        if (result.ok) {
          $scope.projects = result.data.entries;
          $scope.projectCount = result.data.count;
          $scope.finishedLoading = true;
        }
      });
    };

    $scope.isInProject = function (project) {
      return (project.role != 'none');
    };

    $scope.isManager = function (project) {
      return (project.role == 'project_manager');
    };

    // Add user as Manager of project
    $scope.addManagerToProject = function (project) {
      projectService.joinProject(project.id, 'project_manager', function (result) {
        if (result.ok) {
          notice.push(notice.SUCCESS, 'You are now a Manager of the ' + project.projectName +
            ' project.');
          $scope.queryProjectsForUser();
        }
      });
    };

    // Add user as Member of project
    $scope.addMemberToProject = function (project) {
      projectService.joinProject(project.id, 'contributor', function (result) {
        if (result.ok) {
          notice.push(notice.SUCCESS, 'You are now a Contributor for the ' + project.projectName +
            ' project.');
          $scope.queryProjectsForUser();
        }
      });
    };

    $scope.projectTypeNames = projectService.data.projectTypeNames;
    $scope.projectTypesBySite = projectService.data.projectTypesBySite;
  }])

  ;
