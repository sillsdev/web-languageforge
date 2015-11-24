'use strict';

angular.module('lexicon.settings', ['bellows.services', 'palaso.ui.listview', 'palaso.ui.typeahead', 'ui.bootstrap', 'palaso.ui.notice', 'palaso.ui.textdrop'])
  .controller('SettingsCtrl', ['$scope', '$filter', 'userService', 'sessionService', 'silNoticeService', 'lexProjectService', 'lexSendReceiveService',
  function($scope, $filter, userService, sessionService, notice, lexProjectService, sendReceiveService) {
    lexProjectService.setBreadcrumbs('settings', $filter('translate')('Project Settings'));

    $scope.rights.canViewSendReceiveProperties = sessionService.hasProjectRight(sessionService.domain.PROJECTS, sessionService.operation.VIEW);
    $scope.rights.canEditSendReceiveProperties = sessionService.hasProjectRight(sessionService.domain.PROJECTS, sessionService.operation.EDIT);
    $scope.rights.canEditCommunicationSettings = false;

    $scope.readProject = function() {
      lexProjectService.readProject(function(result) {
        if (result.ok) {
          $.extend($scope.project, result.data.project);
          $scope.sendReceive.showTab = ($scope.project.sendReceive && $scope.project.sendReceive.identifier) ? true : false;
        }
      });
    };

    $scope.readProject();

    $scope.updateProject = function() {
      var settings = {
        projectName: $scope.project.projectName,
        interfaceLanguageCode: $scope.project.interfaceLanguageCode,
        featured: $scope.project.featured
      };

      lexProjectService.updateProject(settings, function(result) {
        if (result.ok) {
          notice.push(notice.SUCCESS, $scope.project.projectName + ' settings updated successfully.');
        }
      });
    };

    $scope.sendReceive = {};
    $scope.sendReceive.isUnchecked = true;

    $scope.checkSRProject = function checkSRProject(isValidateSuppressed) {
      if (!lexProjectService.isValidProjectCode($scope.project.sendReceive.identifier)) {
        $scope.sendReceive.identifierStatus = 'invalid';
      } else {
        makeFormNeutral();
        $scope.sendReceive.identifierStatus = 'loading';
        $scope.sendReceive.usernameStatus = 'loading';
        $scope.sendReceive.passwordStatus = 'loading';
        sendReceiveService.checkProject($scope.project.sendReceive.identifier, $scope.project.sendReceive.username, $scope.project.sendReceive.password, function(result) {
          $scope.sendReceive.isUnchecked = false;
          if (result.ok) {
            if (result.data.projectExists) {
              $scope.sendReceive.identifierStatus = 'found';
              $scope.sendReceive.usernameStatus = 'no_access';
              $scope.sendReceive.passwordStatus = 'invalid';
            } else {
              $scope.sendReceive.identifierStatus = 'unknown';
              $scope.sendReceive.usernameStatus = 'unknown';
              $scope.sendReceive.passwordStatus = 'unknown';
            }

            if (result.data.hasAccessToProject) {
              $scope.sendReceive.usernameStatus = 'access';
            }

            if (result.data.hasValidCredentials) {
              $scope.sendReceive.passwordStatus = 'valid';
            }
          } else {
            $scope.sendReceive.identifierStatus = 'failed';
            $scope.sendReceive.usernameStatus = 'failed';
            $scope.sendReceive.passwordStatus = 'failed';
          }

          if (!isValidateSuppressed) {
            isFormValid();
          }
        });
      }
    };

    $scope.resetValidateForm = function resetValidateForm() {
      $scope.sendReceive.isUnchecked = true;
    };

    $scope.updateSendReceiveCredentials = function updateSendReceiveCredentials() {
      if (!isFormValid()) {
        return false;
      }

      sendReceiveService.saveCredentials($scope.project.sendReceive.identifier, $scope.project.sendReceive.username, $scope.project.sendReceive.password, function(result) {
        if (result.ok) {
          notice.push(notice.SUCCESS, 'The LanguageDepot.org credentials updated successfully.');
          $scope.project.sendReceive.password = '';
        } else {
          notice.push(notice.ERROR, 'The LanguageDepot.org credentials could not be saved. Please try again.');
        }
      });

      return true;
    };

    function isFormValid() {
      if (!$scope.project.sendReceive) return neutral();
      if (!$scope.project.sendReceive.identifier) return error('Project ID cannot be empty. Please enter a LanguageDepot.org project identifier.');
      if (!lexProjectService.isValidProjectCode($scope.project.sendReceive.identifier)) {
        return error('Project ID must begin with a letter, and only contain lower-case letters, numbers, dashes and underscores.');
      }

      if (!$scope.project.sendReceive.username) return error('Login cannot be empty. Please enter your LanguageDepot.org login username.');
      if (!$scope.project.sendReceive.password) return error('Password cannot be empty. Please enter your LanguageDepot.org password.');

      switch ($scope.sendReceive.identifierStatus) {
        case 'found':
          if ($scope.sendReceive.passwordStatus == 'invalid') {
            return error('The Login and Password isn\'t valid on LanguageForge.org. Enter a Login and Password.');
          }

          if ($scope.sendReceive.usernameStatus == 'no_access') {
            return error('The Login dosen\'t have access to the Project ID on LanguageForge.org. Enter a Login and Password.');
          }

          return ok();
        case 'unknown':
          return error('The Project ID \'' + $scope.project.sendReceive.identifier + '\' doesn\'t exist on LanguageForge.org. Enter an existing Project ID.');
        case 'invalid':
          return error('Project ID must begin with a letter, and only contain lower-case letters, numbers, dashes and underscores.');
        default:
          return error('Something went wrong checking the project on LanguageDepot.org.');
      }
    }

    function makeFormValid(msg) {
      if (!msg) msg = '';
      $scope.formStatus = msg;
      $scope.formStatusClass = 'alert alert-info';
      if (!msg) $scope.formStatusClass = 'neutral';
      return $scope.formValidated = true;
    }

    function makeFormNeutral(msg) {
      if (!msg) msg = '';
      $scope.formStatus = msg;
      $scope.formStatusClass = 'neutral';
      return $scope.formValidated = false;
    }

    function makeFormInvalid(msg) {
      if (!msg) msg = '';
      $scope.formStatus = msg;
      $scope.formStatusClass = 'alert alert-error';
      if (!msg) $scope.formStatusClass = 'neutral';
      return $scope.formValidated = false;
    }

    makeFormNeutral();

    // Shorthand to make things look a touch nicer
    var ok = makeFormValid;
    var neutral = makeFormNeutral;
    var error = makeFormInvalid;

    $scope.settings = {
      sms: {},
      email: {}
    };

    $scope.readCommunicationSettings = function() {
      lexProjectService.readSettings(function(result) {
        if (result.ok) {
          $scope.settings.sms = result.data.sms;
          $scope.settings.email = result.data.email;
        }
      });
    };

    $scope.updateCommunicationSettings = function() {
      lexProjectService.updateSettings($scope.settings.sms, $scope.settings.email, function(result) {
        if (result.ok) {
          notice.push(notice.SUCCESS, $scope.project.projectName + ' communication settings updated successfully.');
        }
      });
    };

  }])

  ;
