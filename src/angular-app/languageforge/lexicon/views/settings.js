'use strict';

angular.module('lexicon.settings', ['bellows.services', 'ui.bootstrap', 'palaso.ui.listview',
  'palaso.ui.typeahead', 'palaso.ui.sendReceiveCredentials',
  'palaso.ui.archiveProject', 'palaso.ui.deleteProject', 'palaso.ui.notice', 'palaso.ui.textdrop'])
  .controller('SettingsCtrl', ['$scope', '$filter', 'userService', 'sessionService',
    'silNoticeService', 'lexProjectService', 'lexSendReceiveApi',
  function ($scope, $filter, userService, ss,
            notice, lexProjectService, sendReceiveApi) {
    lexProjectService.setBreadcrumbs('settings', $filter('translate')('Project Settings'));

    $scope.rights.canViewSendReceiveProperties = ss
      .hasProjectRight(ss.domain.PROJECTS, ss.operation.VIEW);
    $scope.rights.canEditSendReceiveProperties = ss
      .hasProjectRight(ss.domain.PROJECTS, ss.operation.EDIT);
    $scope.rights.archive = (!ss.session.project.isArchived &&
      (ss.session.project.userIsProjectOwner ||
      ss.hasSiteRight(ss.domain.PROJECTS, ss.operation.ARCHIVE)));
    $scope.rights.remove = ss.session.project.userIsProjectOwner ||
      ss.hasSiteRight(ss.domain.PROJECTS, ss.operation.DELETE);

    $scope.readProject = function () {
      lexProjectService.readProject(function (result) {
        if (result.ok) {
          $.extend($scope.project, result.data.project);
          $scope.sendReceive.showTab =
            ($scope.project.sendReceive && $scope.project.sendReceive.project) ? true : false;
          if ($scope.sendReceive.showTab && !$scope.project.sendReceive.username) {
            $scope.project.sendReceive.username = ss.session.username;
          }
        }
      });
    };

    $scope.readProject();

    $scope.updateProject = function () {
      var settings = {
        projectName: $scope.project.projectName,
        interfaceLanguageCode: $scope.project.interfaceLanguageCode,
        featured: $scope.project.featured
      };

      lexProjectService.updateProject(settings, function (result) {
        if (result.ok) {
          notice.push(notice.SUCCESS,
            $scope.project.projectName + ' settings updated successfully.');
        }
      });
    };

    $scope.sendReceive = {};
    $scope.project = $scope.project || {};
    $scope.project.sendReceive = {};
    $scope.actionInProgress = false;

    $scope.resetValidateForm = function resetValidateForm() {
      $scope.project.sendReceive.isUnchecked = true;
    };

    $scope.updateSendReceiveCredentials = function updateSendReceiveCredentials() {
      if (!isFormValid()) {
        return;
      }

      sendReceiveApi.updateSRProject($scope.project.sendReceive.project, function (result) {
        if (result.ok) {
          notice.push(notice.SUCCESS,
            'The LanguageDepot.org project info was updated successfully.');
          $scope.project.sendReceive.password = '';
          $scope.project.sendReceive.passwordStatus = 'unchecked';
        } else {
          notice.push(notice.ERROR,
            'The LanguageDepot.org project info could not be saved. Please try again.');
        }
      });
    };

    function isFormValid() {
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

  }])

  ;
