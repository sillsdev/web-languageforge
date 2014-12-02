'use strict';

angular.module('new-lexicon-project',
  [
    'ngRoute',
    'bellows.services',
    'bellows.filters',
    'ui.bootstrap',
    'ngAnimate',
    'ui.router',
    'palaso.ui.utils',
    'palaso.ui.language',
    'palaso.ui.mockUpload',
    'palaso.util.model.transform',
    'pascalprecht.translate',
    'angularFileUpload'
  ])
  .config(['$stateProvider', '$urlRouterProvider', '$translateProvider',
  function($stateProvider, $urlRouterProvider, $translateProvider) {
    
    // configure interface language filepath
    $translateProvider.useStaticFilesLoader({
      prefix: '/angular-app/languageforge/new-lexicon-project/lang/',
      suffix: '.json',
    });
    $translateProvider.preferredLanguage('en');

    // State machine from ui.router
    $stateProvider
      .state('newProject', {
        
        // Need quotes around Javascript keywords like 'abstract' so YUI compressor won't complain
        'abstract': true,
        templateUrl: '/angular-app/languageforge/new-lexicon-project/views/new-project.html',
        controller: 'NewLexProjectCtrl',
      })
      .state('newProject.name', {
        templateUrl: '/angular-app/languageforge/new-lexicon-project/views/new-project-name.html',
        data: {
          step: 1,
        },
      })
      .state('newProject.initialData', {
        templateUrl: '/angular-app/languageforge/new-lexicon-project/views/new-project-initial-data.html',
        data: {
          step: 2,
        },
      })
      .state('newProject.verifyData', {
        templateUrl: '/angular-app/languageforge/new-lexicon-project/views/new-project-verify-data.html',
        data: {
          step: 3,
        },
      })
      .state('newProject.selectPrimaryLanguage', {
        templateUrl: '/angular-app/languageforge/new-lexicon-project/views/new-project-select-primary-language.html',
        data: {
          step: 3, // This is not a typo. There are two possible step 3 templates.
        }
      });

    $urlRouterProvider
      .when('', ['$state', function ($state) {
        if (! $state.$current.navigable) {
          $state.go('newProject.name');
        }
      }]);

  }])
  .controller('NewLexProjectCtrl', ['$scope', '$rootScope', '$q', '$filter', '$modal', '$window', 'sessionService', 'silNoticeService', 'projectService', 'sfchecksLinkService', '$translate', '$state', '$upload',
  function($scope, $rootScope, $q, $filter, $modal, $window, ss, notice, projectService, linkService, $translate, $state, $upload) {
    $scope.interfaceConfig = ss.session.projectSettings.interfaceConfig;
    if (InputSystems.isRightToLeft($scope.interfaceConfig.userLanguageCode)) {
//    if (true) { // Override direction and force rtl, for testing purposes
      $scope.interfaceConfig.direction = 'rtl';
      $scope.interfaceConfig.pullToSide = 'pull-left';
      $scope.interfaceConfig.pullNormal = 'pull-right';
      $scope.interfaceConfig.placementToSide = 'right';
      $scope.interfaceConfig.placementNormal = 'left';
    } else {
      $scope.interfaceConfig.direction = 'ltr';
      $scope.interfaceConfig.pullToSide = 'pull-right';
      $scope.interfaceConfig.pullNormal = 'pull-left';
      $scope.interfaceConfig.placementToSide = 'left';
      $scope.interfaceConfig.placementNormal = 'right';
    }

    $scope.state = $state;

    // This is where form data will live
    $scope.newProject = {};
    $scope.newProject.appName = 'lexicon';
    $scope.projectCodeState = 'empty';
    $scope.projectCodeStateDefer = $q.defer();
    $scope.projectCodeStateDefer.resolve('empty');
    $scope.formValidated = false;
    $scope.formStatus = '';
    $scope.formValidationDefer = $q.defer();

    $scope.makeFormValid = function(msg) {
      if (!msg) { msg = ''; }
      $scope.formValidated = true;
      $scope.formStatus = msg;
      $scope.formStatusClass = 'good';
      $scope.formValidationDefer.resolve(true);
      return $scope.formValidationDefer.promise;
    };
    $scope.makeFormNeutral = function(msg) {
      if (!msg) { msg = ''; }
      $scope.formValidated = false;
      $scope.formStatus = msg;
      $scope.formStatusClass = 'neutral';
      $scope.formValidationDefer = $q.defer();
      return $scope.formValidationDefer.promise;
    };
    $scope.makeFormInvalid = function(msg) {
      $scope.formValidated = false;
      $scope.formStatus = msg;
      $scope.formStatusClass = 'bad';
      $scope.formValidationDefer.resolve(false);
      return $scope.formValidationDefer.promise;
    };

    $scope.$watch('formValidated', function(validated) {
      $scope.forwardBtnClass = validated ? 'btn-success' : '';
    });

    $scope.iconForStep = function iconForStep(step) {
      var classes = [];
      if ($state.current.data.step > step) {
        classes.push('icon-check-sign');
      } else {
        classes.push('icon-check-empty');
      }
      if ($state.current.data.step < step) {
        classes.push('muted');
      }
      return classes;
    };

    $scope.nextStep = function nextStep() {
      if ($state.current.name === 'newProject.initialData') {
        $scope.newProject.emptyProjectDesired = true;
        $scope.progressIndicatorStep3Label = $filter('translate')('Language');
        $scope.validateForm();
      }
      
      // If form is still validating, wait for it
      $scope.formValidationDefer.promise.then(function(valid) {
        if (valid) {
          $scope.makeFormNeutral();
          $scope.processForm();
        }
      });
    };
    
    $scope.prevStep = function prevStep() {
      $scope.show.backButton = false;
      switch ($state.current.name) {
        case 'newProject.name':
        case 'newProject.initialData':
        case 'newProject.verifyData':
          break;
        case 'newProject.selectPrimaryLanguage':
          $state.go('newProject.initialData');
          $scope.nextButtonLabel = 'Skip';
          $scope.newProject.emptyProjectDesired = false;
          $scope.progressIndicatorStep3Label = $filter('translate')('Verify');
          break;
      };
    };

    // Form validation requires API calls, so it return a promise rather than a value.
    $scope.validateForm = function validateForm(currentState) {
      if (angular.isUndefined(currentState)) {
        currentState = $state.current.name;
      }
      $scope.formValidationDefer = $q.defer();

      // Shorthand to make things look a touch nicer
      var ok = $scope.makeFormValid,
        error = $scope.makeFormInvalid;
      
      // TODO: This switch is becoming unwieldy. Separate each case into a separate function. 2014-10 RM
      switch (currentState) {
        case 'newProject.name':
          // Project should have a name, should have a unique code, and should have a type
          if (!$scope.newProject.projectName) {
            return error("Project name should not be empty. Please provide a project name.");
          }
          if (!$scope.newProject.appName) {
            return error("Please select a project type.");
          }
          if ($scope.projectCodeState == 'unchecked') {
            $scope.checkProjectCode();
          }
          return $scope.projectCodeStateDefer.promise.then(function(state) {
            if ($scope.projectCodeState == 'ok') {
              return ok("Everything looks good; ready to proceed.");
            }
            if ($scope.projectCodeState == 'exists') {
              return error("Another project with code '" + $scope.newProject.projectCode + "' already exists.");
            }
            if ($scope.projectCodeState == 'invalid') {
              return error("Project code '" + $scope.newProject.projectCode + "' contains invalid characters. It should contain only lower-case letters, numbers, and dashes.");
            }
            if ($scope.projectCodeState == 'loading') {
              return error("Please wait while we check whether another project with code '" + $scope.newProject.projectCode + "' already exists.");
            }
            if ($scope.projectCodeState == 'empty' || !$scope.newProject.projectCode) {
              return error("Project code should not be empty.");
            }
            // Project code was invalid, but we don't know why. Give a generic message, adapted based on whether the user checked "Edit project code" or not.
            if ($scope.newProject.editProjectCode) {
              return error("Project code '" + $scope.newProject.projectCode + "' cannot be used. Please choose a new project code.");
            } else {
              return error("Project code '" + $scope.newProject.projectCode + "' cannot be used. Either change the project name, or check the \"Edit project code\" box and choose a new code.");
            }
          });
          break;
        case 'newProject.initialData':
          if ($scope.newProject.emptyProjectDesired) {
            return ok("You've chosen to create an empty project with no initial data.");
          }
          if ($scope.uploadSuccess) {
            return ok($scope.newProject.entriesImported + " entries imported. Everything looks good; ready to proceed.");
          } else {
            return error("No initial data uploaded yet.");
          }
          break;
        case 'newProject.verifyData':
          // TODO: Check if user has clicked button
          return ok("Everything looks good; ready to proceed.");
          break;
        case 'newProject.selectPrimaryLanguage':
          if ($scope.newProject.languageCode) {
            return ok("Everything looks good; ready to proceed.");
          } else {
            return error("Please select a primary language for the project.");
          }
          break;
      };
      return ok();
    };

    $scope.processForm = function processForm() {
      // Don't need to validate in this function since it's already been taken care of for us by this point
      switch ($state.current.name) {
        case 'newProject.name':
          $scope.nextButtonLabel = 'Skip';
          $state.go('newProject.initialData');
          break;
        case 'newProject.initialData':
          $scope.nextButtonLabel = 'Dictionary';
          if ($scope.newProject.emptyProjectDesired) {
            $state.go('newProject.selectPrimaryLanguage');
            $scope.show.backButton = true;
          } else {
            $state.go('newProject.verifyData');
            $scope.makeFormValid();
          }
          break;
        case 'newProject.verifyData':
        case 'newProject.selectPrimaryLanguage':
          var url;
          $scope.makeFormValid();
          url = linkService.project($scope.newProject.id, $scope.newProject.appName);
          $window.location.href = url;
          break;
      };
    };

    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
      if (fromState.name == "newProject.name" && toState.name == "newProject.initialData") {
        $scope.createProjectBeforeUpload();
      }
    });

    function projectNameToCode(name) {
      if (angular.isUndefined(name)) return undefined;
      return name.toLowerCase().replace(/ /g, '_');
    };
    function isValidProjectCode(code) {
      if (angular.isUndefined(code)) return false;
      
      // Valid project codes start with a letter and only contain lower-case letters, numbers, or dashes
      var pattern = /^[a-z][a-z0-9\-_]*$/;
      return pattern.test(code);
    };

    $scope.checkProjectCode = function checkProjectCode() {
      $scope.projectCodeStateDefer = $q.defer();
      if (! isValidProjectCode($scope.newProject.projectCode)) {
        $scope.projectCodeState = 'invalid';
        $scope.projectCodeStateDefer.resolve('invalid');
      } else {
        $scope.projectCodeState = 'loading';
        $scope.projectCodeStateDefer.notify('loading');
        projectService.projectCodeExists($scope.newProject.projectCode, function(apiResult) {
          if (apiResult.ok) {
            if (apiResult.data) {
              $scope.projectCodeState = 'exists';
              $scope.projectCodeStateDefer.resolve('exists');
            } else {
              $scope.projectCodeState = 'ok';
              $scope.projectCodeStateDefer.resolve('ok');
            }
          } else {
            $scope.projectCodeState = 'failed';
            $scope.projectCodeStateDefer.reject('failed');
          }
        });
      }
      return $scope.projectCodeStateDefer.promise;
    };
    $scope.resetValidateProjectForm = function resetValidateProjectForm() {
      $scope.makeFormNeutral();
      $scope.projectCodeState = 'unchecked';
      $scope.projectCodeStateDefer = $q.defer();
      $scope.projectCodeStateDefer.resolve('unchecked');
    };

    $scope.$watch('projectCodeState', function(newval, oldval) {
      if (!newval || newval == oldval) { return; }
      if (newval == 'unchecked') {
        // User just typed in the project name box. Need to wait just a bit for the idle-validate to kick in.
        return;
      }
      if (oldval == "loading") {
        // Project code state just resolved. Validate rest of form so Forward button can activate.
        $scope.validateForm();
      }
    });

    $scope.$watch('newProject.editProjectCode', function(newval, oldval) {
      if (oldval && !newval) {
        // When user unchecks the "edit project code" box, go back to setting it from project name
        $scope.newProject.projectCode = projectNameToCode($scope.newProject.projectName);
        $scope.checkProjectCode();
      }
    });

    // ----- Step 1: Project name -----

    $scope.show = {};
    $scope.show.backButton = false;
    $scope.nextButtonLabel = 'Next';
    $scope.progressIndicatorStep3Label = $filter('translate')('Verify');
    
    $scope.$watch('newProject.projectName', function(newval, oldval) {
      if (angular.isUndefined(newval)) {
        $scope.newProject.projectCode = '';
      } else if (newval != oldval) {
        $scope.newProject.projectCode = newval.toLowerCase().replace(/ /g, '_');
      }
    });

    $scope.createProjectBeforeUpload = function createProjectBeforeUpload() {
      if (!$scope.newProject.projectName || !$scope.newProject.projectCode || !$scope.newProject.appName) {
        // This function sometimes gets called during setup, when $scope.newProject is still empty.
        return;
      }
      projectService.create($scope.newProject.projectName, $scope.newProject.projectCode, $scope.newProject.appName, function(result) {
        if (result.ok) {
          $scope.newProject.id = result.data;
        } else {
          notice.push(notice.ERROR, "The " + $scope.newProject.projectName + " project could not be created. Please try again.");
        }
      });
    };


    // ----- Step 2: Initial data upload -----

    $scope.show.importErrors = false;

    $scope.onFileSelect = function onFileSelect(files) {
      $scope.uploadErrorMsg = '';
      
      // First, cope with multiple files if the user selected multiple.
      if (files.length > 1) {
        $scope.uploadErrorMsg = "Please select a single file. If you need to upload multiple files, zip them first with a utility like 7-zip.";
        return;
      }

      $scope.datafile = files[0];
      if ($scope.datafile.size <= ss.fileSizeMax()) {
        notice.setLoading('Importing ' + $scope.datafile.name + '...');
        $scope.makeFormInvalid("Please wait while " + $scope.datafile.name + " is imported...");
        $scope.upload = $upload.upload({
          url: '/upload/lf-lexicon/import-zip',
          file: $scope.datafile,
          data: {
              projectId: ($scope.newProject.id || ''),   // Which project to upload new data to
              filename: $scope.datafile.name
            },
        }).progress(function(evt) {
          $scope.uploadProgress = 100.0 * evt.loaded / evt.total;
        }).success(function(data, status, headers, config) {
          notice.cancelLoading();
          $scope.uploadSuccess = data.result;
          if ($scope.uploadSuccess) {
            notice.push(notice.SUCCESS, $filter('translate')("Successfully imported") + " " + $scope.datafile.name);
            $scope.newProject.entriesImported = data.data.stats.importEntries;
            $scope.newProject.importErrors = data.data.importErrors;
            $scope.makeFormNeutral();
            $scope.processForm();
          } else {
            $scope.uploadProgress = 0;
            $scope.datafile = null;
            $scope.newProject.entriesImported = 0;
            notice.push(notice.ERROR, data.data.errorMessage);
            $scope.validateForm();
          }
        });
      } else {
        notice.push(notice.ERROR, "<b>" + $scope.datafile.name + "</b> (" + $filter('bytes')($scope.datafile.size) + 
            ") is too large. It must be smaller than " + $filter('bytes')(ss.fileSizeMax()) + ".");
        $scope.uploadProgress = 0;
        $scope.datafile = null;
      }
    };
    
    $scope.hasImportErrors = function hasImportErrorrs() {
      return ($scope.newProject.importErrors !== '');
    };
    
    $scope.showImportErrorsButtonLabel = function showImportErrorsButtonLabel() {
      if ($scope.show.importErrors) {
        return $filter('translate')("Hide non-critical import errors");
      }
      return $filter('translate')("Show non-critical import errors");
    };

    // ----- Step 3: Verify initial data -OR- select primary language -----

    $scope.openNewLanguageModal = function openNewLanguageModal() {
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
        $scope.newProject.languageCode = selected.code;
        $scope.newProject.languageName = selected.language.name;
      });
    };

    $scope.$watch('newProject.languageCode', function(newval) {
      if (angular.isUndefined(newval)) { return; }
      $scope.validateForm();
    });

  }])
;
