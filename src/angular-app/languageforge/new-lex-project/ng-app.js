'use strict';

angular.module('new-lex-project',
  [
    'ngRoute',
    'bellows.services',
    'bellows.filters',
    'ui.bootstrap',
    'ngAnimate',
    'ui.router',
    'palaso.ui.utils',
    'palaso.util.model.transform',
    'pascalprecht.translate'
  ])
  .config(['$stateProvider', '$urlRouterProvider', '$translateProvider',
  function($stateProvider, $urlRouterProvider, $translateProvider) {
    // configure interface language filepath
    $translateProvider.useStaticFilesLoader({
      prefix: '/angular-app/languageforge/new-lex-project/lang/',
      suffix: '.json',
    });
    $translateProvider.preferredLanguage('en');

    // State machine from ui.router
    $stateProvider
      .state('newProject', {
        // Need quotes around Javascript keywords like 'abstract' so YUI compressor won't complain
        'abstract': true,
        // TODO: Can we make the following URL relative?
        templateUrl: '/angular-app/languageforge/new-lex-project/views/new-project.html',
        controller: 'NewLexProjectCtrl',
      })
      .state('newProject.name', {
        templateUrl: '/angular-app/languageforge/new-lex-project/views/new-project-name.html',
        data: {
          step: 1,
        },
      })
      .state('newProject.initialData', {
        templateUrl: '/angular-app/languageforge/new-lex-project/views/new-project-initial-data.html',
        data: {
          step: 2,
        },
      })
      .state('newProject.verifyData', {
        templateUrl: '/angular-app/languageforge/new-lex-project/views/new-project-verify-data.html',
        data: {
          step: 3,
        },
      })
      .state('newProject.selectPrimaryLanguage', {
        templateUrl: '/angular-app/languageforge/new-lex-project/views/new-project-select-primary-language.html',
        data: {
          step: 3, // This is not a typo. There are two possible step 3 templates.
        },
      })
      .state('newProject.createProject', {
        templateUrl: '/angular-app/languageforge/new-lex-project/views/new-project-create.html',
        data: {
          step: 4,
        },
      });

      $urlRouterProvider
      .when('', ['$state', function ($state) {
        if (! $state.$current.navigable) {
          $state.go('newProject.name');
        }
      }])
//      .otherwise('/form')
      ;

  }])
  .controller('NewLexProjectCtrl', ['$scope', '$q', 'sessionService', 'silNoticeService', 'projectService', '$translate', '$state',
  function($scope, $q, ss, notice, projectService, $translate, $state) {
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

    $scope.newProject = {}; // This is where form data will live
    $scope.projectCodeState = 'empty';
    $scope.projectCodeStateDefer = $q.defer();
    $scope.projectCodeStateDefer.resolve('empty');
    $scope.formValidated = false;
    $scope.formStatus = '';
    $scope.formValidationDefer = $q.defer();

    $scope.$watch('formValidated', function(validated) {
      $scope.forwardBtnClass = validated ? 'btn-success' : '';
    });

    // For most uses of this form, there will only be one project type ("Web Dictionary").
    // If that's the case, we set it up here and will hide the project type selector in the form.
    $scope.projectTypeNames = projectService.data.projectTypeNames;
    $scope.projectTypesBySite = projectService.data.projectTypesBySite;
    if (projectService.data.projectTypesBySite().length == 1) {
      $scope.newProject.appName = $scope.projectTypesBySite()[0];
    }

    $scope.iconForStep = function(step) {
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
    }

    $scope.nextStep = function() {
      // If form is still validating, wait for it
      $scope.formValidationDefer.promise.then(function(valid) {
        if (valid) {
          $scope.formStatusClass = 'neutral';
          $scope.formStatus = '';
          $scope.formValidated = false;
          $scope.formValidationDefer = $q.defer();
          $scope.processForm();
        }
      });
    }
    $scope.prevStep = function() {
      // To implement, decide how we could go "back" to the first step: delete the newly-created (but still empty) project?
      console.log("Tried to go back... but that's not yet implemented");
    }

    // Form validation requires API calls, so it return a promise rather than a value.
    $scope.validateForm = function validateForm(currentState) {
      if (angular.isUndefined(currentState)) {
        currentState = $state.current.name;
      }
      $scope.formValidationDefer = $q.defer();
      var ok = function(status) {
        if (!status) { status = ''; }
        $scope.formStatus = status;
        $scope.formStatusClass = 'good';
        $scope.formValidated = true;
        $scope.formValidationDefer.resolve(true);
        return $scope.formValidationDefer.promise;
      };
      var error = function(msg) {
        if (!status) { status = ''; }
        $scope.formStatus = msg;
        $scope.formStatusClass = 'bad';
        $scope.formValidated = false;
        $scope.formValidationDefer.resolve(false);
        return $scope.formValidationDefer.promise;
      }
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
            return error("Another project with code '" + $scope.newProject.projectCode + "' already exists. Either change the project name, or check the \"Edit project code\" box and choose a new code.");
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
        // TODO: Check if .zip file uploaded. If none, go to newProject.selectPrimaryLanguage step instead.
        $state.go('newProject.verifyData');
//        $state.go('newProject.selectPrimaryLanguage');
        break;
      case 'newProject.verifyData':
        $state.go('newProject.createProject');
        break;
      case 'newProject.selectPrimaryLanguage':
        $state.go('newProject.createProject');
        break;
      case 'newProject.createProject':
        console.log('Would create project here');
        break;
      };
      $scope.formValidationDefer.resolve("No verification was really done");
      console.log("Not really verified");
      return $scope.formValidationDefer.promise;
    };

    $scope.processForm = function processForm() {
      // Don't need to validate in this function since it's already been taken care of for us by this point
      switch ($state.current.name) {
      case 'newProject.name':
        $state.go('newProject.initialData');
        break;
      case 'newProject.initialData':
        // TODO: Check if .zip file uploaded. If none, go to newProject.selectPrimaryLanguage step instead.
        $state.go('newProject.verifyData');
//        $state.go('newProject.selectPrimaryLanguage');
        break;
      case 'newProject.verifyData':
        $state.go('newProject.createProject');
        break;
      case 'newProject.selectPrimaryLanguage':
        $state.go('newProject.createProject');
        break;
      case 'newProject.createProject':
        console.log('Would create project here');
        break;
      };
    }

    $scope.projectNameToCode = function(name) {
      if (angular.isUndefined(name)) { return undefined; }
      return name.toLowerCase().replace(/ /g, '_');
    }
    $scope.isValidProjectCode = function(code) {
      // Valid project codes start with a letter and only contain lower-case letters, numbers, or dashes
      var patt = /^[a-z][a-z0-9\-_]*$/;
      return patt.test(code);
    }

    $scope.checkProjectCode = function() {
      $scope.projectCodeStateDefer = $q.defer();
      if (!$scope.isValidProjectCode($scope.newProject.projectCode)) {
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
      $scope.formValidated = false;
      $scope.formStatus = '';
      $scope.formStatusClass = 'neutral';
      $scope.formValidationDefer = $q.defer();
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
        $scope.newProject.projectCode = $scope.projectNameToCode($scope.newProject.projectName);
      }
    });

    // ----- Step 1: Project name -----

    $scope.$watch('newProject.projectName', function(newval, oldval) {
      if (angular.isUndefined(newval)) {
        $scope.newProject.projectCode = '';
      } else if (newval != oldval) {
        $scope.newProject.projectCode = newval.toLowerCase().replace(/ /g, '_');
      }
    });

  }])
;
