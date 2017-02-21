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
    'ngFileUpload',
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
    $translateProvider.useSanitizeValueStrategy('escape');

    // State machine from ui.router
    $stateProvider
      .state('newProject', {

        // Need quotes around Javascript keywords like 'abstract' so YUI compressor won't complain
        'abstract': true, // jscs:ignore
        templateUrl:
          '/angular-app/languageforge/lexicon/new-project/views/' + bootstrapVersion + '/new-project-abstract.html',
        controller: 'NewLexProjectCtrl'
      })
      .state('newProject.chooser', {
        url: '/chooser',
        templateUrl:
          '/angular-app/languageforge/lexicon/new-project/views/' + bootstrapVersion + '/new-project-chooser.html',
        data: {
          step: 0
        }
      })
      .state('newProject.name', {
        templateUrl: '/angular-app/languageforge/lexicon/new-project/views/' + bootstrapVersion + '/new-project-name.html',
        data: {
          step: 1
        }
      })
      .state('newProject.sendReceiveCredentials', {
        templateUrl:
          '/angular-app/languageforge/lexicon/new-project/views/' + bootstrapVersion + '/new-project-sr-credentials.html',
        data: {
          step: 1 // This is not a typo. There are two possible step 2 templates.
        }
      })
      .state('newProject.initialData', {
        templateUrl:
          '/angular-app/languageforge/lexicon/new-project/views/' + bootstrapVersion + '/new-project-initial-data.html',
        data: {
          step: 2
        }
      })
      .state('newProject.sendReceiveClone', {
        templateUrl:
          '/angular-app/languageforge/lexicon/new-project/views/' + bootstrapVersion + '/new-project-sr-clone.html',
        data: {
          step: 2 // This is not a typo. There are two possible step 2 templates.
        }
      })
      .state('newProject.verifyData', {
        templateUrl:
          '/angular-app/languageforge/lexicon/new-project/views/' + bootstrapVersion + '/new-project-verify-data.html',
        data: {
          step: 3
        }
      })
      .state('newProject.selectPrimaryLanguage', {
        templateUrl: '/angular-app/languageforge/lexicon/new-project/views/' + bootstrapVersion +
          '/new-project-select-primary-language.html',
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
    '$state', 'Upload', 'lexProjectService', 'lexSendReceiveApi',  'lexSendReceive',
  function ($scope, $q, $filter, $modal, $window,
            sessionService, notice, projectService, linkService, $translate,
            $state, Upload, lexProjectService, sendReceiveApi, sendReceive) {
    $scope.interfaceConfig = {};
    $scope.interfaceConfig.userLanguageCode = 'en';
    if (angular.isDefined(sessionService.session.projectSettings) &&
        angular.isDefined(sessionService.session.projectSettings.interfaceConfig)) {
      $scope.interfaceConfig = sessionService.session.projectSettings.interfaceConfig;
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

    $scope.isSRProject = false;
    $scope.show = {};
    $scope.show.nextButton = ($state.current.name != 'newProject.chooser');
    $scope.show.backButton = false;
    $scope.show.flexHelp = false;
    $scope.show.cloning = true;
    $scope.show.step3 = true;
    $scope.nextButtonLabel = $filter('translate')('Next');
    $scope.progressIndicatorStep1Label = $filter('translate')('Name');
    $scope.progressIndicatorStep2Label = $filter('translate')('Initial Data');
    $scope.progressIndicatorStep3Label = $filter('translate')('Verify');
    resetValidateProjectForm();

    function makeFormValid(msg) {
      if (!msg) msg = '';
      $scope.formValidated = true;
      $scope.formStatus = msg;
      $scope.formStatusClass = 'alert alert-info';
      if (!msg) $scope.formStatusClass = (bootstrapVersion == 'bootstrap4' ? '' : 'neutral');
      $scope.forwardBtnClass = 'btn-success';
      $scope.formValidationDefer.resolve(true);
      return $scope.formValidationDefer.promise;
    }

    function makeFormNeutral(msg) {
      if (!msg) msg = '';
      $scope.formValidated = false;
      $scope.formStatus = msg;
      $scope.formStatusClass = (bootstrapVersion == 'bootstrap4' ? '' : 'neutral');
      $scope.forwardBtnClass = (bootstrapVersion == 'bootstrap4' ? 'btn-secondary' : '');
      $scope.formValidationDefer = $q.defer();
      return $scope.formValidationDefer.promise;
    }

    function makeFormInvalid(msg) {
      if (!msg) msg = '';
      $scope.formValidated = false;
      $scope.formStatus = msg;
      $scope.formStatusClass = (bootstrapVersion == 'bootstrap4' ? 'alert alert-danger' : 'alert alert-error');
      if (!msg) $scope.formStatusClass = (bootstrapVersion == 'bootstrap4' ? '' : 'neutral');
      $scope.forwardBtnClass = '';
      $scope.formValidationDefer.resolve(false);
      return $scope.formValidationDefer.promise;
    }

    // Shorthand to make things look a touch nicer
    var ok = makeFormValid;
    var neutral = makeFormNeutral;
    var error = makeFormInvalid;

    $scope.iconForStep = function iconForStep(step) {
      var classes = [];
      if ($state.current.data.step > step) {
          classes.push((bootstrapVersion =='bootstrap4' ? "fa fa-check-square":'icon-check-sign'));
      }

      if ($state.current.data.step == step) {
          classes.push((bootstrapVersion =='bootstrap4' ? "fa fa-square-o":'icon-check-empty'));
      }
      else if ($state.current.data.step < step) {
          classes.push((bootstrapVersion =='bootstrap4' ? "fa fa-square-o muted":'icon-check-empty muted'));
      }

      return classes;
    };

    $scope.getProjectFromInternet = function getProjectFromInternet() {
      $state.go('newProject.sendReceiveCredentials');
      $scope.isSRProject = true;
      $scope.show.nextButton = true;
      $scope.show.backButton = true;
      $scope.show.step3 = false;
      $scope.nextButtonLabel = $filter('translate')('Get Started');
      $scope.progressIndicatorStep1Label = $filter('translate')('Connect');
      $scope.progressIndicatorStep2Label = $filter('translate')('Verify');
      $scope.resetValidateProjectForm();
      if (!$scope.project.sendReceive.username) {
        $scope.project.sendReceive.username = sessionService.session.username;
      }

      validateForm();
    };

    $scope.createNew = function createNew() {
      $state.go('newProject.name');
      $scope.isSRProject = false;
      $scope.show.nextButton = true;
      $scope.show.backButton = true;
      $scope.show.step3 = true;
      $scope.nextButtonLabel = $filter('translate')('Next');
      $scope.progressIndicatorStep1Label = $filter('translate')('Name');
      $scope.progressIndicatorStep2Label = $filter('translate')('Initial Data');
    };

    $scope.prevStep = function prevStep() {
      $scope.show.backButton = false;
      $scope.resetValidateProjectForm();
      switch ($state.current.name) {
        case 'newProject.sendReceiveCredentials':
          $state.go('newProject.chooser');
          $scope.show.nextButton = false;
          break;
        case 'newProject.name':
          $state.go('newProject.chooser');
          $scope.show.nextButton = false;
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
        case 'newProject.chooser':
          return error();
          break;
        case 'newProject.sendReceiveCredentials':
          return validateSendReceiveCredentialsForm();
          break;
        case 'newProject.sendReceiveClone':
          if (sendReceive.isInProgress()) {
            return error();
          }

          break;
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
        case 'newProject.sendReceiveCredentials':

          // For now, this is the point of no return.  We can't cancel an LfMerge clone, and we
          // don't want the user to go to the project and start editing before the clone has
          // completed.
          $scope.show.backButton = false;
          $scope.show.cloning = true;
          $scope.show.nextButton = false;
          $scope.resetValidateProjectForm();
          if ($scope.project.sendReceive.project.isLinked) {
            var role = 'contributor';
            if ($scope.project.sendReceive.project.role == 'manager') {
              role = 'project_manager';
            }

            projectService.joinSwitchSession($scope.project.sendReceive.project.identifier, role,
              function (result) {
                if (result.ok) {
                  $scope.newProject.id = result.data;
                  sessionService.refresh(gotoLexicon);
                } else {
                  notice.push(notice.ERROR, 'Well this is embarrassing. ' +
                    'We couldn\'t join you to the project. Sorry about that.');
                }
              });

          } else {
            $scope.newProject.projectName = $scope.project.sendReceive.project.name;
            $scope.newProject.projectCode = $scope.project.sendReceive.project.identifier;
            projectService.projectCodeExists($scope.newProject.projectCode, function (result) {
              if (result.ok && result.data) {
                $scope.newProject.projectCode += '_lf';
              }

              createProject(getProject);
              makeFormNeutral();
            });
          }

          break;
        case 'newProject.sendReceiveClone':
          if (!sendReceive.isInProgress()) {
            gotoLexicon();
          }

          break;
        case 'newProject.name':
          createProject();
          $state.go('newProject.initialData');
          $scope.nextButtonLabel = $filter('translate')('Skip');
          $scope.show.backButton = false;
          $scope.projectCodeState = 'empty';
          $scope.projectCodeStateDefer = $q.defer();
          $scope.projectCodeStateDefer.resolve('empty');
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

    function resetValidateProjectForm() {
      makeFormNeutral();
      $scope.projectCodeState = 'unchecked';
      $scope.projectCodeStateDefer = $q.defer();
      $scope.projectCodeStateDefer.resolve('unchecked');
      $scope.project.sendReceive.isUnchecked = true;
      $scope.project.sendReceive.usernameStatus = 'unchecked';
      $scope.project.sendReceive.passwordStatus = 'unchecked';
    }

    $scope.resetValidateProjectForm = resetValidateProjectForm;

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
      if (!$scope.isSRProject) {
        if (angular.isUndefined(newval)) {
          $scope.newProject.projectCode = '';
        } else if (newval != oldval) {
          $scope.newProject.projectCode = newval.toLowerCase().replace(/ /g, '_');
        }
      }
    });

    function createProject(callback) {
      if (!$scope.newProject.projectName || !$scope.newProject.projectCode ||
        !$scope.newProject.appName) {
        // This function sometimes gets called during setup, when $scope.newProject is still empty.
        return;
      }

      projectService.createSwitchSession($scope.newProject.projectName,
        $scope.newProject.projectCode, $scope.newProject.appName,
        $scope.project.sendReceive.project, function (result) {
        if (result.ok) {
          $scope.newProject.id = result.data;
          sessionService.refresh(callback);
        } else {
          notice.push(notice.ERROR, 'The ' + $scope.newProject.projectName +
            ' project could not be created. Please try again.');
        }
      });
    }

    // ----- Step 2: Initial data upload -----

    $scope.show.importErrors = false;

    $scope.uploadFile = function uploadFile(file) {
      if (!file || file.$error) return;
      if (file.size > sessionService.fileSizeMax()) {
        notice.push(notice.ERROR, '<b>' + file.name + '</b> (' +
          $filter('bytes')(file.size) + ') is too large. It must be smaller than ' +
          $filter('bytes')(sessionService.fileSizeMax()) + '.');
        return;
      }

      notice.setLoading('Importing ' + file.name + '...');
      Upload.upload({
        url: '/upload/lf-lexicon/import-zip',
        data: { file: file }
      }).then(function (response) {
        notice.cancelLoading();
        var isUploadSuccess = response.data.result;
        if (isUploadSuccess) {
          notice.push(notice.SUCCESS, $filter('translate')('Successfully imported') + ' ' +
            file.name);
          $scope.newProject.entriesImported = response.data.data.stats.importEntries;
          $scope.newProject.importErrors = response.data.data.importErrors;
          gotoNextState();
        } else {
          $scope.newProject.entriesImported = 0;
          notice.push(notice.ERROR, response.data.data.errorMessage);
        }
      },

      function (response) {
        notice.cancelLoading();
        var errorMessage = $filter('translate')('Import failed.');
        if (response.status > 0) {
          errorMessage += ' Status: ' + response.status;
          if (response.statusText) {
            errorMessage += ' ' + response.statusText;
          }

          if (response.data) {
            errorMessage += '- ' + response.data;
          }
        }

        notice.push(notice.ERROR, errorMessage);
      },

      function (evt) {
        notice.setPercentComplete(100.0 * evt.loaded / evt.total);
      });
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

    // ----- Step 1: Send Receive Credentials -----

    function validateSendReceiveCredentialsForm() {
      if (angular.isDefined($scope.project.sendReceive.project) &&
          $scope.project.sendReceive.project.isLinked) {
        $scope.nextButtonLabel = $filter('translate')('Join Project');
      } else {
        $scope.nextButtonLabel = $filter('translate')('Get Started');
      }

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

      if (!$scope.project.sendReceive.project.isLinked &&
          $scope.project.sendReceive.project.role != 'manager') {
        return error('Please select a Project that you are the Manager on LanguageDepot.org.');
      }

      $scope.project.sendReceive.projectStatus = 'ok';
      return ok();
    }

    function getProject() {
      sendReceiveApi.receiveProject(function (result) {
        if (result.ok) {
          $state.go('newProject.sendReceiveClone');
          sendReceive.startCloneStatusTimer();
        } else {
          notice.push(notice.ERROR, 'The project could not be synchronized with' +
            ' LanguageDepot.org. Please try again.');
          gotoLexicon();
        }
      });
    }

    // ----- Step 2: Send Receive Clone -----

    $scope.cloneNotice = sendReceive.cloneNotice;
    sendReceive.clearState();
    sendReceive.setCloneProjectStatusSuccessCallback(gotoLexicon);

    $scope.$on('$destroy', sendReceive.cancelCloneStatusTimer);
    $scope.$on('$locationChangeStart', sendReceive.cancelCloneStatusTimer);

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
      if (angular.isDefined(sessionService.session.projectSettings)) {
        config = sessionService.session.projectSettings.config;
        optionlist = sessionService.session.projectSettings.optionlists;
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
