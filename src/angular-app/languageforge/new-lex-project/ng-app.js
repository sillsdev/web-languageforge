angular.module('new-lex-project',
  [
    'ngRoute',
    'bellows.services',
    'bellows.filters',
    'ui.bootstrap',
    'ngAnimate',
    'ui.router',
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
  .controller('NewLexProjectCtrl', ['$scope', '$rootScope', 'sessionService', 'silNoticeService', '$translate', '$state',
  function($scope, $rootScope, ss, notice, $translate, $state) {
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
    $scope.doneLoading = 'Dialog is ready.';
    $scope.state = $state;
    $scope.formValidated = false;
    $scope.$watch('formValidated', function(validated) {
      $scope.forwardBtnClass = validated ? 'btn-success' : '';
      $scope.formStatus = validated ? "Form validates" : "There's an error somewhere in the form";
      if ($scope.newLexProjectForm.$pristine) {
        $scope.formStatus = '';
      }
    });
    $scope.nextStep = function() {
//      $state.current.data.step += 1;
      $scope.formValidated = false;
//      notice.push(notice.SUCCESS, "Moving to step " + $state.current.data.step);
      $scope.processForm();
    }
    $scope.prevStep = function() {
      $scope.formValidated = !$scope.formValidated;
      $scope.newLexProjectForm.$setDirty();
    }
    $scope.iconForStep = function(step) {
      classes = [];
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

    $scope.processForm = function processForm() {
      switch ($state.current.name) {
      case 'newProject.name':
        $state.go('newProject.initialData');
        break;
      case 'newProject.initialData':
        $state.go('newProject.verifyData');
        break;
      case 'newProject.verifyData':
        $state.go('newProject.createProject');
        break;
      case 'newProject.createProject':
        console.log('Would create project here');
        break;
      };
    }

    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
      switch (fromState.name) {
      case 'newProject.name':
        console.log('Verify that project name looks good');
        break
      case 'newProject.initialData':
        console.log('Verify that the uploaded data works');
        break;
      // etc...
      }
    });

  }])
;
