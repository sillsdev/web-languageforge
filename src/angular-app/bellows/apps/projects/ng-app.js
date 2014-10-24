'use strict';

angular.module('projects', ['bellows.services', 'bellows.filters', 'palaso.ui.listview', 'ui.bootstrap', 'palaso.ui.notice', 'palaso.ui.utils', 'palaso.ui.language', 'wc.Directives', 'angularFileUpload', 'pascalprecht.translate'])
.controller('ProjectsCtrl', ['$scope', 'projectService', 'sessionService', 'silNoticeService', 'modalService', '$modal', '$window', '$upload', '$filter',
                             function($scope, projectService, ss, notice, modalService, $modal, $window, $upload, $filter) {
  $scope.finishedLoading = false;

  // Rights
  $scope.rights = {};
  $scope.rights.edit = ss.hasSiteRight(ss.domain.PROJECTS, ss.operation.EDIT);
  $scope.rights.archive = ss.hasSiteRight(ss.domain.PROJECTS, ss.operation.ARCHIVE);
  $scope.rights.create = ss.hasSiteRight(ss.domain.PROJECTS, ss.operation.CREATE);
  $scope.rights.showControlBar = $scope.rights.archive || $scope.rights.create;

  // New project and related variables
  $scope.newProject = {emptyProjectDesired: false};
  $scope.newProjectWizard = {step: 1, maxSteps: 4};
  $scope.datafile = null;

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
    $scope.newProjectWizard.step = Math.min($scope.newProjectWizard.step + 1, $scope.newProjectWizard.maxSteps);
  }
  $scope.newProjectWizardBack = function() {
    $scope.newProjectWizard.step = Math.max($scope.newProjectWizard.step - 1, 1);
  }

  $scope.newProjectWizardCheckAndMoveForward = function() {
    var valid = $scope.currentStepValidity($scope.newProjectWizardForward);
    if (valid.canAdvance) {
      $scope.newProjectWizard.toolTipError = '';
      $scope.newProjectWizardForward();
    } else {
      $scope.newProjectWizard.toolTipError = valid.errorMsg;
    }
  };

  $scope.newProjectWizardCheckAndMoveBack = function() {
    var valid = $scope.currentStepValidity($scope.newProjectWizardBack);
    if (valid.canAdvance) {
      $scope.newProjectWizard.toolTipError = '';
      $scope.newProjectWizardBack();
    } else {
      $scope.newProjectWizard.toolTipError = valid.errorMsg;
    }
  };
  $scope.currentStepValidity = function(forwardOrBack) {
    // Param forwardOrBack only used if project code was still loading, to apply user's click
    // after project code has been validated (and so user doesn't have to click twice)
    var ok = {canAdvance: true, errorMsg: ''};
    switch ($scope.newProjectWizard.step) {
    case 1:
      if ($scope.projectCodeState == 'ok') {
        return ok;
      } else if ($scope.projectCodeState == 'loading') {
        $scope.afterProjectCodeValid = forwardOrBack;
        return {
          canAdvance: false,
          errorMsg: "Please wait...",
        };
      } else {
        return {
          canAdvance: false,
          errorMsg: "Can't proceed until project code is OK",
        };
      }
      break;
      // TODO: After step 1, also need to call the server to create the newly-requested project.
      // This provides a projectId, and a place for the step 2 .zip file to land. (Right now it lands
      // in "whatever project the user visited last", which is badly wrong).
    case 2:
      if ($scope.uploadSuccess || $scope.newProject.emptyProjectDesired) {
        return ok;
        // TODO: Also check for successful unpacking of .zip file here.
        // UI should show "Upload complete. Processing... (spinner)". Then give
        // either a success or failure message. To implement this, the
        // LexUploadCommands::uploadProjectZip function will need to return
        // something to indicate success in unzipping and finding valid data
        // (a .lift file) inside. Actually processing that data should be a
        // second API call, which would return success or failure based on how
        // many entries were imported.
      } else {
        return {
          canAdvance: false,
          errorMsg: "Either upload initial data or check the \"Don't upload data\" checkbox.",
        }
      }
      break;
    case 3:
      return ok;
      break;
    case 4:
      return ok;
      break;
    default:
      return false;
    }
  }
  $scope.addProject = function() {
    projectService.create($scope.newProject.projectName, $scope.newProject.projectCode, $scope.newProject.appName, function(result) {
      if (result.ok) {
        notice.push(notice.SUCCESS, "The " + $scope.newProject.projectName + " project was created successfully");
        $scope.queryProjectsForUser();
        $scope.newProject = {emptyProjectDesired: false};
        $scope.newProjectWizard.step = 1;
      }
    });
  };
  $scope.createProjectBeforeStep2 = function() {
    projectService.create($scope.newProject.projectName, $scope.newProject.projectCode, $scope.newProject.appName, function(result) {
      if (result.ok) {
        // No notification yet; project wizard is where user's attention should remain for now
        $scope.newProject.id = result.data;
      } else {
        notice.push(notice.ERROR, "The " + $scope.newProject.projectName + " project could not be created. Please try again.");
      }
    });
  };
  $scope.$watch('newProjectWizard.step', function(newval, oldval) {
    if (oldval == 1 && newval == 2) {
      $scope.createProjectBeforeStep2();
    }
  });
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
            $scope.afterProjectCodeValid = undefined;
          } else {
            $scope.projectCodeState = 'ok';
            if (angular.isDefined($scope.afterProjectCodeValid)) {
              $scope.afterProjectCodeValid();
              $scope.afterProjectCodeValid = undefined;
            }
          }
        }
      });
    } else {
      $scope.projectCodeState = 'invalid';
    }
  };
  $scope.checkProjectCodeIfNotOk = function() {
    // Useful for ng-blur, so code won't be re-checked if idle validation already checked it
    if ($scope.projectCodeState != 'ok') {
      $scope.checkProjectCode();
    }
  }

  $scope.onFileSelect = function onFileSelect(files) {
    // First, cope with multiple files if the user selected multiple.
    if (files.length > 1) { // Really >1
      $scope.uploadErrorMsg = "Please select a single file. If you need to upload multiple files, zip them first with a utility like 7-zip.";
      return;
    }
    $scope.datafile = files[0];
    console.log(files[0]);
    notice.setLoading('Importing ' + $scope.datafile.name + '...');
    $scope.upload = $upload.upload({
      url: '/upload/lf-lexicon/lex-project',
      file: $scope.datafile,
      data: {projectId: ($scope.newProject.id || '')}, // Which project to upload new data to
    }).progress(function(evt) {
      $scope.uploadProgress = 100.0 * evt.loaded / evt.total;
    }).success(function(data, status, headers, config) {
      notice.cancelLoading();
      $scope.uploadSuccess = data.result;
      if ($scope.uploadSuccess) {
        notice.push(notice.SUCCESS, $filter('translate')("Successfully imported") + " " + $scope.datafile.name);
      } else {
        notice.push(notice.ERROR, $filter('translate')("Sorry, something went wrong in the import process."));
        // Should really have a more specific error message.
        // TODO: Update the PHP API to provide specific error messages regarding failure reasons.
      }
      console.log('Upload complete. Data:', data);
      console.log('Status:', status);
      console.log('Headers:', headers('date'));
      console.log('Config:', config);
    });
  };

  $scope.projectTypeNames = projectService.data.projectTypeNames;
  $scope.projectTypesBySite = projectService.data.projectTypesBySite;

  if (projectService.data.projectTypesBySite().length == 1) {
    $scope.newProject.appName = $scope.projectTypesBySite()[0];
  }
}])
;
