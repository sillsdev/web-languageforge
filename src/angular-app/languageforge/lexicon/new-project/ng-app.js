'use strict';

angular.module('lexicon-new-project',
  [
    'bellows.services',
    'bellows.filters',
    'ui.bootstrap',
    'ngAnimate',
    'ui.router',
    'palaso.ui.utils',
    'palaso.ui.language',
    'palaso.ui.sendReceiveCredentials',
    'palaso.ui.mockUpload',
    'palaso.util.model.transform',
    'pascalprecht.translate',
    'angularFileUpload',
    'lexicon.services'
  ])
  .config(['$stateProvider', '$urlRouterProvider', '$translateProvider',
  function ($stateProvider, $urlRouterProvider, $translateProvider) {

    // configure interface language filepath
    $translateProvider.useStaticFilesLoader({
      prefix: '/angular-app/languageforge/lexicon/new-project/lang/',
      suffix: '.json'
    });
    $translateProvider.preferredLanguage('en');

    // State machine from ui.router
    $stateProvider
      .state('newProject', {

        // Need quotes around Javascript keywords like "abstract" so YUI compressor won't complain
        "abstract": true,
        templateUrl: '/angular-app/languageforge/lexicon/new-project/views/new-project.html',
        controller: 'NewLexProjectCtrl'
      })
      .state('newProject.chooser', {
        templateUrl:
          '/angular-app/languageforge/lexicon/new-project/views/new-project-chooser.html',
        data: {
          step: 0
        }
      })
      .state('newProject.name', {
        templateUrl: '/angular-app/languageforge/lexicon/new-project/views/new-project-name.html',
        data: {
          step: 1
        }
      })
      .state('newProject.initialData', {
        templateUrl:
          '/angular-app/languageforge/lexicon/new-project/views/new-project-initial-data.html',
        data: {
          step: 2
        }
      })
      .state('newProject.sendReceiveCredentials', {
        templateUrl:
          '/angular-app/languageforge/lexicon/new-project/views/new-project-sr-credentials.html',
        data: {
          step: 2 // This is not a typo. There are two possible step 2 templates.
        }
      })
      .state('newProject.verifyData', {
        templateUrl:
          '/angular-app/languageforge/lexicon/new-project/views/new-project-verify-data.html',
        data: {
          step: 3
        }
      })
      .state('newProject.selectPrimaryLanguage', {
        templateUrl: '/angular-app/languageforge/lexicon/new-project/views/' +
          'new-project-select-primary-language.html',
        data: {
          step: 3 // This is not a typo. There are two possible step 3 templates.
        }
      });

    $urlRouterProvider
      .when('', ['$state', function ($state) {
        if (!$state.$current.navigable) {
          $state.go('newProject.chooser');
        }
      }]);

  }])
  .controller('NewLexProjectCtrl', ['$scope', '$q', '$filter', '$modal', '$window',
    'sessionService', 'silNoticeService', 'projectService', 'sfchecksLinkService', '$translate',
    '$state', '$upload', 'lexProjectService', 'lexSendReceiveService',
  function ($scope, $q, $filter, $modal, $window,
            ss, notice, projectService, linkService, $translate,
            $state, $upload, lexProjectService, sendReceiveService) {
    $scope.interfaceConfig = {};
    $scope.interfaceConfig.userLanguageCode = 'en';
    if (angular.isDefined(ss.session.projectSettings)) {
      $scope.interfaceConfig = ss.session.projectSettings.interfaceConfig;
    }

    $scope.interfaceConfig.direction = 'ltr';
    $scope.interfaceConfig.pullToSide = 'pull-right';
    $scope.interfaceConfig.pullNormal = 'pull-left';
    $scope.interfaceConfig.placementToSide = 'left';
    $scope.interfaceConfig.placementNormal = 'right';
    if (InputSystems.isRightToLeft($scope.interfaceConfig.userLanguageCode)) {
      $scope.interfaceConfig.direction = 'rtl';
      $scope.interfaceConfig.pullToSide = 'pull-left';
      $scope.interfaceConfig.pullNormal = 'pull-right';
      $scope.interfaceConfig.placementToSide = 'right';
      $scope.interfaceConfig.placementNormal = 'left';
    }

    $scope.state = $state;

    // This is where form data will live
    $scope.newProject = {};
    $scope.newProject.appName = 'lexicon';
    $scope.project = {};
    $scope.project.sendReceive = {};

    $scope.projectCodeState = 'empty';
    $scope.projectCodeStateDefer = $q.defer();
    $scope.projectCodeStateDefer.resolve('empty');

    function makeFormValid(msg) {
      if (!msg) msg = '';
      $scope.formValidated = true;
      $scope.formStatus = msg;
      $scope.formStatusClass = 'alert alert-info';
      if (!msg) $scope.formStatusClass = 'neutral';
      $scope.forwardBtnClass = 'btn-success';
      $scope.formValidationDefer.resolve(true);
      return $scope.formValidationDefer.promise;
    }

    function makeFormNeutral(msg) {
      if (!msg) msg = '';
      $scope.formValidated = false;
      $scope.formStatus = msg;
      $scope.formStatusClass = 'neutral';
      $scope.forwardBtnClass = '';
      $scope.formValidationDefer = $q.defer();
      return $scope.formValidationDefer.promise;
    }

    function makeFormInvalid(msg) {
      if (!msg) msg = '';
      $scope.formValidated = false;
      $scope.formStatus = msg;
      $scope.formStatusClass = 'alert alert-error';
      if (!msg) $scope.formStatusClass = 'neutral';
      $scope.forwardBtnClass = '';
      $scope.formValidationDefer.resolve(false);
      return $scope.formValidationDefer.promise;
    }

    makeFormNeutral();

    // Shorthand to make things look a touch nicer
    var ok = makeFormValid;
    var neutral = makeFormNeutral;
    var error = makeFormInvalid;

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

    $scope.getProjectFromInternet = function getProjectFromInternet() {
      $state.go('newProject.name');
      $scope.isSRProject = true;
      $scope.show.nextButton = true;
      $scope.show.backButton = true;
    };

    $scope.createNew = function createNew() {
      $state.go('newProject.name');
      $scope.isSRProject = false;
      $scope.show.nextButton = true;
      $scope.show.backButton = true;
    };

    $scope.prevStep = function prevStep() {
      $scope.show.backButton = false;
      $scope.resetValidateProjectForm();
      switch ($state.current.name) {
        case 'newProject.name':
          $state.go('newProject.chooser');
          $scope.show.nextButton = false;
          break;
        case 'newProject.sendReceiveCredentials':
          $state.go('newProject.name');
          $scope.show.backButton = true;
          $scope.nextButtonLabel = $filter('translate')('Next');
          $scope.checkProjectCode();
          break;
        case 'newProject.initialData':
        case 'newProject.verifyData':
          break;
        case 'newProject.selectPrimaryLanguage':
          $state.go('newProject.initialData');
          $scope.nextButtonLabel = $filter('translate')('Skip');
          $scope.newProject.emptyProjectDesired = false;
          $scope.progressIndicatorStep3Label = $filter('translate')('Verify');
          break;
      }
    };

    $scope.nextStep = function nextStep() {
      if ($state.current.name === 'newProject.initialData') {
        $scope.newProject.emptyProjectDesired = true;
        $scope.progressIndicatorStep3Label = $filter('translate')('Language');
      }

      validateForm().then(function (isValid) {
        if (isValid) {
          gotoNextState();
        }
      });
    };

    // Form validation requires API calls, so it return a promise rather than a value.
    function validateForm() {
      $scope.formValidationDefer = $q.defer();

      switch ($state.current.name) {
        case 'newProject.name':
          if (!$scope.newProject.projectName) {
            return error('Project Name cannot be empty. Please enter a project name.');
          }

          if (!$scope.newProject.projectCode) {
            return error('Project Code cannot be empty. ' +
              'Please enter a project code or uncheck "Edit project code".');
          }

          if (!$scope.newProject.appName) {
            return error('Please select a project type.');
          }

          if ($scope.projectCodeState == 'unchecked') {
            $scope.checkProjectCode();
          }

          return $scope.projectCodeStateDefer.promise.then(function () {
            switch ($scope.projectCodeState) {
              case 'ok':
                return ok();
              case 'exists':
                return error('Another project with code \'' + $scope.newProject.projectCode +
                  '\' already exists.');
              case 'invalid':
                return error('Project Code must begin with a letter, ' +
                  'and only contain lower-case letters, numbers, dashes and underscores.');
              case 'loading':
                return error();
              case 'empty':
                return neutral();
              default:

                // Project code state is unknown. Give a generic message,
                // adapted based on whether the user checked "Edit project code" or not.
                if ($scope.newProject.editProjectCode) {
                  return error('Project code \'' + $scope.newProject.projectCode +
                    '\' cannot be used. Please choose a new project code.');
                } else {
                  return error('Project code \'' + $scope.newProject.projectCode +
                    '\' cannot be used. Either change the project name, ' +
                    'or check the "Edit project code" box and choose a new code.');
                }
            }
          });

          break;
        case 'newProject.sendReceiveCredentials':
          return validateSendReceiveCredentialsForm();
          break;
        case 'newProject.initialData':
        case 'newProject.verifyData':
          break;
        case 'newProject.selectPrimaryLanguage':
          if (!$scope.newProject.languageCode) {
            return error('Please select a primary language for the project.');
          }

          break;
      }
      return ok();
    }

    $scope.validateForm = validateForm;

    function gotoNextState() {
      switch ($state.current.name) {
        case 'newProject.name':
          if ($scope.isSRProject) {
            $state.go('newProject.sendReceiveCredentials');
            $scope.nextButtonLabel = $filter('translate')('Synchronize');
            $scope.show.backButton = true;
            $scope.resetValidateProjectForm();
            if (!$scope.project.sendReceive.username) {
              $scope.project.sendReceive.username = ss.session.username;
            }
          } else {
            createProject(makeFormNeutral);
            $state.go('newProject.initialData');
            $scope.nextButtonLabel = $filter('translate')('Skip');
            $scope.show.backButton = false;
            $scope.projectCodeState = 'empty';
            $scope.projectCodeStateDefer = $q.defer();
            $scope.projectCodeStateDefer.resolve('empty');
          }

          makeFormNeutral();
          break;
        case 'newProject.initialData':
          $scope.nextButtonLabel = $filter('translate')('Dictionary');
          if ($scope.newProject.emptyProjectDesired) {
            $state.go('newProject.selectPrimaryLanguage');
            $scope.show.backButton = true;
            makeFormNeutral();
          } else {
            $state.go('newProject.verifyData');
            makeFormValid();
          }

          break;
        case 'newProject.sendReceiveCredentials':
          createProject(saveSRCredentials);
          break;
        case 'newProject.verifyData':
          gotoLexicon();
          break;
        case 'newProject.selectPrimaryLanguage':
          savePrimaryLanguage(gotoLexicon);
          break;
      }
    }

    function gotoLexicon() {
      var url;
      makeFormValid();
      url = linkService.project($scope.newProject.id, $scope.newProject.appName);
      $window.location.href = url;
    }

    // ----- Step 0: Chooser -----

    $scope.show = {};
    $scope.show.nextButton = false;
    $scope.show.backButton = false;
    $scope.show.flexHelp = false;
    $scope.nextButtonLabel = $filter('translate')('Next');
    $scope.progressIndicatorStep3Label = $filter('translate')('Verify');

    // ----- Step 1: Project name -----

    function projectNameToCode(name) {
      if (angular.isUndefined(name)) return undefined;
      return name.toLowerCase().replace(/ /g, '_');
    }

    $scope.checkProjectCode = function checkProjectCode() {
      $scope.projectCodeStateDefer = $q.defer();
      if (!lexProjectService.isValidProjectCode($scope.newProject.projectCode)) {
        $scope.projectCodeState = 'invalid';
        $scope.projectCodeStateDefer.resolve('invalid');
      } else {
        $scope.projectCodeState = 'loading';
        $scope.projectCodeStateDefer.notify('loading');
        projectService.projectCodeExists($scope.newProject.projectCode, function (result) {
          if (result.ok) {
            if (result.data) {
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
      makeFormNeutral();
      $scope.projectCodeState = 'unchecked';
      $scope.projectCodeStateDefer = $q.defer();
      $scope.projectCodeStateDefer.resolve('unchecked');
      $scope.project.sendReceive.isUnchecked = true;
      $scope.project.sendReceive.usernameStatus = 'unchecked';
      $scope.project.sendReceive.passwordStatus = 'unchecked';
    };

    $scope.$watch('projectCodeState', function (newval, oldval) {
      if (!newval || newval == oldval) { return; }

      if (newval == 'unchecked') {
        // User just typed in the project name box.
        // Need to wait just a bit for the idle-validate to kick in.
        return;
      }

      if (oldval == 'loading') {
        // Project code state just resolved. Validate rest of form so Forward button can activate.
        validateForm();
      }
    });

    $scope.$watch('newProject.editProjectCode', function (newval, oldval) {
      if (oldval && !newval) {
        // When user unchecks the "edit project code" box, go back to setting it from project name
        $scope.newProject.projectCode = projectNameToCode($scope.newProject.projectName);
        $scope.checkProjectCode();
      }
    });

    $scope.$watch('newProject.projectName', function (newval, oldval) {
      if (angular.isUndefined(newval)) {
        $scope.newProject.projectCode = '';
      } else if (newval != oldval) {
        $scope.newProject.projectCode = newval.toLowerCase().replace(/ /g, '_');
      }
    });

    function createProject(callback) {
      if (!$scope.newProject.projectName || !$scope.newProject.projectCode ||
        !$scope.newProject.appName) {
        // This function sometimes gets called during setup, when $scope.newProject is still empty.
        return;
      }

      projectService.createSwitchSession($scope.newProject.projectName,
        $scope.newProject.projectCode, $scope.newProject.appName, function (result) {
        if (result.ok) {
          $scope.newProject.id = result.data;
          ss.refresh(callback);
        } else {
          notice.push(notice.ERROR, 'The ' + $scope.newProject.projectName +
            ' project could not be created. Please try again.');
        }
      });
    }

    // ----- Step 2: Initial data upload -----

    $scope.show.importErrors = false;

    $scope.onFileSelect = function onFileSelect(files) {
      $scope.uploadErrorMsg = '';

      // First, cope with multiple files if the user selected multiple.
      if (files.length > 1) {
        $scope.uploadErrorMsg = 'Please select a single file. ' +
          'If you need to upload multiple files, zip them first with a utility like 7-zip.';
        return;
      }

      $scope.datafile = files[0];
      if ($scope.datafile.size <= ss.fileSizeMax()) {
        notice.setLoading('Importing ' + $scope.datafile.name + '...');
        makeFormInvalid();
        $scope.upload = $upload.upload({
          url: '/upload/lf-lexicon/import-zip',
          file: $scope.datafile,
          data: {
              filename: $scope.datafile.name
            }
        }).progress(function (evt) {
          $scope.uploadProgress = 100.0 * evt.loaded / evt.total;
        }).success(function (data) {
          notice.cancelLoading();
          $scope.uploadSuccess = data.result;
          if ($scope.uploadSuccess) {
            notice.push(notice.SUCCESS, $filter('translate')('Successfully imported') + ' ' +
              $scope.datafile.name);
            $scope.newProject.entriesImported = data.data.stats.importEntries;
            $scope.newProject.importErrors = data.data.importErrors;
            gotoNextState();
          } else {
            $scope.uploadProgress = 0;
            $scope.datafile = null;
            $scope.newProject.entriesImported = 0;
            notice.push(notice.ERROR, data.data.errorMessage);
          }
        }).error(function (data, status) {
          notice.cancelLoading();
          var errorMessage = $filter('translate')('Import failed.');
          if (status > 0) {
            errorMessage += ' Status: ' + status;
            if (data) {
              errorMessage += '- ' + data;
            }
          }

          notice.push(notice.ERROR, errorMessage);
        });
      } else {
        notice.push(notice.ERROR, '<b>' + $scope.datafile.name + '</b> (' +
          $filter('bytes')($scope.datafile.size) + ') is too large. It must be smaller than ' +
          $filter('bytes')(ss.fileSizeMax()) + '.');
        $scope.uploadProgress = 0;
        $scope.datafile = null;
      }
    };

    $scope.hasImportErrors = function hasImportErrorrs() {
      return ($scope.newProject.importErrors !== '');
    };

    $scope.showImportErrorsButtonLabel = function showImportErrorsButtonLabel() {
      if ($scope.show.importErrors) {
        return $filter('translate')('Hide non-critical import errors');
      }

      return $filter('translate')('Show non-critical import errors');
    };

    // ----- Step 2: Send Receive Credentials -----

    function validateSendReceiveCredentialsForm() {
      $scope.project.sendReceive.projectStatus = 'unchecked';
      if (!$scope.project.sendReceive.username) {
        return error('Login cannot be empty. Please enter your LanguageDepot.org login username.');
      }

      if (!$scope.project.sendReceive.password) {
        return error('Password cannot be empty. Please enter your LanguageDepot.org password.');
      }

      if ($scope.project.sendReceive.isUnchecked) {
        return neutral();
      }

      if ($scope.project.sendReceive.usernameStatus == 'unknown') {
        return error('The Login dosen\'t exist on LanguageDepot.org. Enter a Login.');
      }

      if ($scope.project.sendReceive.passwordStatus == 'invalid') {
        return error('The Password isn\'t valid on LanguageDepot.org. Enter the Password.');
      }

      $scope.project.sendReceive.projectStatus = 'no_access';
      if (!$scope.project.sendReceive.project) {
        return error('Please select a Project.');
      }

      if ($scope.project.sendReceive.project.role != 'manager') {
        return error('Please select a Project that you are the Manager on LanguageDepot.org.');
      }

      $scope.project.sendReceive.projectStatus = 'ok';
      return ok();
    }

    function saveSRCredentials() {
      if (!$scope.project.sendReceive.project || !$scope.project.sendReceive.username ||
        !$scope.project.sendReceive.password) {
        return;
      }

      sendReceiveService.saveCredentials($scope.project.sendReceive.project,
        $scope.project.sendReceive.username,
        $scope.project.sendReceive.password, function (result) {
        if (result.ok) {
          getProject();
        } else {
          notice.push(notice.ERROR, 'The LanguageDepot.org credentials could not be saved. ' +
            'Please try again.');
        }
      });
    }

    function getProject() {
      sendReceiveService.receiveProject(function (result) {
        if (result.ok) {
          notice.push(notice.SUCCESS, 'Started sync with LanguageDepot.org...');
        } else {
          notice.push(notice.ERROR, 'The project could not be synced with LanguageDepot.org. ' +
            'Please try again.');
        }

        gotoLexicon();
      });
    }

    // ----- Step 3: Verify initial data -OR- select primary language -----

    $scope.primaryLanguage = function primaryLanguage() {
      if ($scope.newProject.languageCode) {
        return $scope.newProject.language.name + ' (' + $scope.newProject.languageCode + ')';
      }

      return '';
    };

    $scope.openNewLanguageModal = function openNewLanguageModal() {
      var modalInstance = $modal.open({
        templateUrl: '/angular-app/languageforge/lexicon/views/select-new-language.html',
        controller: ['$scope', '$modalInstance', function ($scope, $modalInstance) {
          $scope.selected = {
            code: '',
            language: {}
          };
          $scope.add = function () {
            $modalInstance.close($scope.selected);
          };
        }]
      });
      modalInstance.result.then(function (selected) {
        $scope.newProject.languageCode = selected.code;
        $scope.newProject.language = selected.language;
      });
    };

    function savePrimaryLanguage(callback) {
      var config = { inputSystems: [] };
      var optionlist = {};
      var inputSystem = {};
      notice.setLoading('Configuring project for first use...');
      if (angular.isDefined(ss.session.projectSettings)) {
        config = ss.session.projectSettings.config;
        optionlist = ss.session.projectSettings.optionlists;
      }

      inputSystem.abbreviation = $scope.newProject.languageCode;
      inputSystem.tag = $scope.newProject.languageCode;
      inputSystem.languageName = $scope.newProject.language.name;
      config.inputSystems[$scope.newProject.languageCode] = inputSystem;
      if ('th' in config.inputSystems) {
        delete config.inputSystems.th;
        replaceFieldInputSystem(config.entry, 'th', $scope.newProject.languageCode);
      }

      lexProjectService.updateConfiguration(config, optionlist, function (result) {
        notice.cancelLoading();
        if (result.ok) {
          (callback || angular.noop)();
        } else {
          makeFormInvalid('Could not add ' + $scope.newProject.language.name + ' to project.');
        }
      });
    }

    function replaceFieldInputSystem(item, existingTag, replacementTag) {
      if (item.type === 'fields') {
        angular.forEach(item.fields, function (field) {
          replaceFieldInputSystem(field, existingTag, replacementTag);
        });
      } else {
        if (angular.isDefined(item.inputSystems)) {
          angular.forEach(item.inputSystems, function (inputSystemTag, index) {
            if (inputSystemTag === existingTag) {
              item.inputSystems[index] = replacementTag;
            }
          });
        }
      }
    }

    $scope.$watch('newProject.languageCode', function (newval) {
      if (angular.isDefined(newval)) {
        validateForm();
      }
    });

  }])

  ;
