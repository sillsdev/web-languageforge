'use strict';

angular.module('projects', ['bellows.services', 'palaso.ui.listview', 'ui.bootstrap', 'palaso.ui.notice', 'palaso.ui.utils', 'palaso.ui.language', 'wc.Directives', 'pascalprecht.translate'])
.controller('ProjectsCtrl', ['$scope', 'projectService', 'sessionService', 'silNoticeService', 'modalService', '$modal', '$window',
                             function($scope, projectService, ss, notice, modalService, $modal, $window) {
  $scope.finishedLoading = false;

  // Rights
  $scope.rights = {};
  $scope.rights.edit = ss.hasSiteRight(ss.domain.PROJECTS, ss.operation.EDIT);
  $scope.rights.archive = ss.hasSiteRight(ss.domain.PROJECTS, ss.operation.ARCHIVE);
  $scope.rights.create = ss.hasSiteRight(ss.domain.PROJECTS, ss.operation.CREATE);
  $scope.rights.showControlBar = $scope.rights.archive || $scope.rights.create;
  $scope.newProject = {};
  $scope.newProjectWizard = {step: 1, maxSteps: 3};

  // Listview Selection
  $scope.newProjectCollapsed = true;
  $scope.selected = [];
  $scope.updateSelection = function(event, item) {
    var selectedIndex = $scope.selected.indexOf(item);
    var checkbox = event.target;
    if (checkbox.checked && selectedIndex == -1) {
      $scope.selected.push(item);
    } else if (!checkbox.checked && selectedIndex != -1) {
      $scope.selected.splice(selectedIndex, 1);
    }
  };
  $scope.isSelected = function(item) {
    return item != null && $scope.selected.indexOf(item) >= 0;
  };

  // Listview Data
  $scope.projects = [];
  $scope.queryProjectsForUser = function() {
    projectService.list(function(result) {
      if (result.ok) {
        $scope.projects = result.data.entries;
        $scope.projectCount = result.data.count;
        $scope.finishedLoading = true;
      }
    });
  };

  // Archive projects
  $scope.archiveProjects = function() {
    var projectIds = [];
    var message = '';
    for(var i = 0, l = $scope.selected.length; i < l; i++) {
      projectIds.push($scope.selected[i].id);
    }
    if (projectIds.length == 1) {
      message = "Are you sure you want to archive the selected project?";
    } else {
      message = "Are you sure you want to archive the " + projectIds.length + " selected projects?";
    }
    var modalOptions = {
        closeButtonText: 'Cancel',
        actionButtonText: 'Archive',
        headerText: 'Archive Project?',
        bodyText: message
      };
    modalService.showModal({}, modalOptions).then(function (result) {
      projectService.archive(projectIds, function(result) {
        if (result.ok) {
          $scope.selected = []; // Reset the selection
          $scope.queryProjectsForUser();
          if (projectIds.length == 1) {
            notice.push(notice.SUCCESS, "The project was archived successfully");
          } else {
            notice.push(notice.SUCCESS, "The projects were archived successfully");
          }
        }
      });
    });
  };

  // Add new project wizard
  $scope.newProjectWizardForward = function() {
    if ($scope.currentStepIsValid()) {
      $scope.newProjectWizard.step = Math.min($scope.newProjectWizard.step + 1, $scope.newProjectWizard.maxSteps);
    }
  };
  $scope.newProjectWizardBack = function() {
    if ($scope.currentStepIsValid()) {
      $scope.newProjectWizard.step = Math.max($scope.newProjectWizard.step - 1, 1);
    }
  };
  $scope.currentStepIsValid = function() {
    switch ($scope.newProjectWizard.step) {
    case 1:
      return $scope.projectCodeState == 'ok';
    case 2:
      return true;
    case 3:
      return true;
    default:
      return false;
    }
  }
  $scope.addProject = function() {
    projectService.create($scope.newProject.projectName, $scope.newProject.projectCode, $scope.newProject.appName, function(result) {
      if (result.ok) {
        notice.push(notice.SUCCESS, "The " + $scope.newProject.projectName + " project was created successfully");
        $scope.queryProjectsForUser();
        $scope.newProject = {};
        $scope.newProjectWizard.step = 1;
      }
    });
  };
  $scope.setLanguage = function(languageCode, language) {
    $scope.newProject.languageCode = languageCode;
    $scope.newProject.languageName = language.name;
  };
  $scope.openNewLanguageModal = function openNewLanguageModal() {
    // TODO: Rewrite this to use our modalService, passing in $scope.selected variable. 2014-10 RM
    var modalInstance = $modal.open({
      templateUrl: '/angular-app/languageforge/lexicon/views/select-new-language.html',
      controller: ['$scope', '$modalInstance', function($scope, $modalInstance) {
        $scope.selected = {
          code: '',
          language: {}
        };
        $scope.add = function() {
          $modalInstance.close($scope.selected);
        };
      }]
    });
    modalInstance.result.then(function(selected) {
      console.log('Modal result:', selected);
      $scope.setLanguage(selected.code, selected.language);
    });
    /* Rewritten version should look something like:
    modalService.showModal({
      templateUrl: '/angular-app/languageforge/lexicon/views/select-new-language.html',
    }).then(function(result) {
      console.log('Modal result:', result);
      $scope.setLanguage(result.code, result.language);
    });
    */
  };

  $scope.$watch('newProject.projectName', function(newval, oldval) {
    if (angular.isUndefined(newval)) {
      $scope.newProject.calculatedProjectCode = '';
    } else if (newval != oldval) {
      $scope.newProject.calculatedProjectCode = newval.toLowerCase().replace(/ /g, '_');
    }
  });

  $scope.isInProject = function(project) {
    if (project.role != 'none') {
      return true;
    }
    return false;
  };

  $scope.isManager = function(project) {
    if (project.role == 'project_manager') {
      return true;
    }
    return false;
  };

  // Add user as Manager of project
  $scope.addManagerToProject = function(project) {
    projectService.joinProject(project.id, 'project_manager', function(result) {
      if (result.ok) {
        notice.push(notice.SUCCESS, "You are now a Manager of the " + project.projectName + " project.");
        $scope.queryProjectsForUser();
      }
    });
  };

  // Add user as Member of project
  $scope.addMemberToProject = function(project) {
    projectService.joinProject(project.id, 'contributor', function(result) {
      if (result.ok) {
        notice.push(notice.SUCCESS, "You are now a Contributor for the " + project.projectName + " project.");
        $scope.queryProjectsForUser();
      }
    });
  };

  $scope.resetValidateProjectForm = function resetValidateProjectForm() {
    $scope.projectCodeState = 'empty';
  };

  /*
  // State of the projectCode being validated:
  // 'empty'   : no project code entered
  // 'auto'    : project code automatically calculated from name
  // 'loading' : project code entered, being validated
  // 'exist'   : project code already exists
  // 'invalid' : project code does not meet the criteria of starting with a letter
  //        and only containing lower-case letters, numbers, or dashes
  // 'ok'      : project code valid and unique
  */
  $scope.projectCodeState = 'empty';

  // Check projectCode is unique and valid
  $scope.checkProjectCode = function() {
    // valid pattern start with a letter and only containing lower-case letters, numbers, or dashes
    var patt = /^[a-z][a-z0-9\-_]*$/;
    if ($scope.projectCodeState == 'empty') {
      $scope.newProject.projectCode = $scope.newProject.calculatedProjectCode;
      $scope.projectCodeState = 'auto';
    }

    if (patt.test($scope.newProject.projectCode)) {
      $scope.projectCodeState = 'loading';
      projectService.projectCodeExists($scope.newProject.projectCode, function(result) {
        if (result.ok) {
          if (result.data) {
            $scope.projectCodeState = 'exists';
          } else {
            $scope.projectCodeState = 'ok';
          }
        }
      });
    } else {
      $scope.projectCodeState = 'invalid';
    }
  };

  $scope.projectTypeNames = projectService.data.projectTypeNames;
  $scope.projectTypesBySite = projectService.data.projectTypesBySite;

  if (projectService.data.projectTypesBySite().length == 1) {
    $scope.newProject.appName = $scope.projectTypesBySite()[0];
  }
}])
;
