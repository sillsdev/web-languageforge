<?php

namespace Site\Controller;

use Api\Library\Shared\Palaso\Exception\ResourceNotAvailableException;
use Api\Library\Shared\Palaso\Exception\UserUnauthorizedException;
use Api\Library\Shared\SilexSessionHelper;
use Api\Library\Shared\Website;
use Api\Model\Languageforge\LfProjectModel;
use Api\Model\Shared\ProjectModel;
use Api\Model\Shared\Command\ProjectCommands;
use Api\Model\Shared\UserModel;
use Silex\Application;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class App extends Base
{
    /**
     * @param Request $request
     * @param Application $app
     * @param $appName
     * @param string $projectId
     * @return Response
     */
    public function view(
        /** @noinspection PhpUnusedParameterInspection */
        Request $request, Application $app, $appName, $projectId = ''
    ) {


        /**
         * TODO: This logic should be moved into a future Authentication handler.
         * As of right now, Auth.php cannot give us the answer we need to know if
         * Authentication was successfully or not, so we check and process the invite token
         * here.  CJH - 2019-08
         */
        if ($app['session']->get('inviteToken')) {
            try
            {
                $projectId = $this->processInviteToken($app);
            }
            catch (ResourceNotAvailableException $e)
            {
                return $app->redirect(
                    '/app/projects#!/?errorMessage=' .
                    base64_encode($e->getMessage())
                );
            } finally
            {
                $app['session']->set('inviteToken', '');
            }
        }

        $model = new AppModel($app, $appName, $this->website, $projectId);
        try {
            $this->setupBaseVariables($app);
            $this->setupAngularAppVariables($model);
        } catch (UserUnauthorizedException $e)
        {
            if (SilexSessionHelper::getUserId($app)) {
                return $app->redirect('/app/projects');
            }
            return $app->redirect('/auth/logout');

        } catch (\Exception $e) {
            // setupBaseVariables() had a catch block for exceptions of unspecified type and it has been refactored here
            // Investigations into exception type were unsuccessful
            return $app->redirect('/auth/logout');
        }
        return $this->renderPage($app, 'angular-app');
    }

    /**
     * authentication is handled by the security policy set in index.php
     *
     * both /app/[appName] and /public/[appName] are handled by this controller
     * /public/[appName] does not require authentication whereas /app/[appName] requires a user to be logged in
     *
     * @param AppModel $model
     * @throws UserUnauthorizedException
     * @throws AppNotFoundException
     * @throws \Exception
     */
    public function setupAngularAppVariables(AppModel $model)
    {
        if ($model->projectId == 'favicon.ico') {
            $model->projectId = '';
        }

        if ($model->isChildApp) {
            $model->appName = "{$model->appName}-{$model->projectId}";
            $model->projectId = '';
        }

        $this->_appName = $model->appName;
        $this->data['isAngular2'] = $model->isAppAngular2();
        $this->data['appName'] = $model->appName;
        $this->data['appFolder'] = $model->appFolder;
        $this->data['projectId'] = $model->projectId;

        if ($model->requireProject) {
            if ($model->isPublicApp) {
                $model->projectId = SilexSessionHelper::requireValidProjectIdForThisWebsite($model->app, $this->website, $model->projectId);
            } else {
                $model->projectId =
                    SilexSessionHelper::requireValidProjectIdForThisWebsiteAndValidateUserMembership($model->app, $this->website, $model->projectId);
            }
        }

        $model->app['session']->set('projectId', $model->projectId);
        $this->_projectId = $model->projectId;

        $this->addJavascriptFiles($model->siteFolder . '/js', ['vendor', 'assets']);

        if ($this->data['isAngular2']) {
            $this->addJavascriptFiles($model->appFolder . '/dist');
        } else {
            $this->addJavascriptFiles($model->appFolder, ['js/vendor', 'js/assets']);
        }

        if ($model->parentAppFolder) {
            $this->addJavascriptFiles($model->parentAppFolder, ['js/vendor', 'js/assets']);
        }

        $this->addCssFiles(NG_BASE_FOLDER . 'bellows/shared');
        $this->addCssFiles($model->appFolder, ['node_modules']);

        if ($model->appName !== 'ldproject') {
            // Special case: LD project management does not use project IDs from Mongo,
            // so don't try to load the language code from LF Mongo since there's no LF project yet
            $this->addSemanticDomainFile($model);
        }
    }

    /**
     * @param AppModel $model
     * @throws \Exception
     */
    private function addSemanticDomainFile(AppModel $model)
    {
        $interfaceLanguageCode = 'en';
        if ($model->projectId) {
            $project = ProjectModel::getById($model->projectId);
            if ($project->interfaceLanguageCode) {
                $interfaceLanguageCode = $project->interfaceLanguageCode;
            }

            $usernameOrEmail = $model->app['security.token_storage']->getToken()->getUser()->getUsername();
            $user = new UserModel();
            if ($user->readByUsernameOrEmail($usernameOrEmail)) {
                if ($user->interfaceLanguageCode) {
                    $interfaceLanguageCode = $user->interfaceLanguageCode;
                }
            }
        }

        $semDomFilePath = $model->siteFolder . '/core/semantic-domains/semantic-domains.' . $interfaceLanguageCode .
            '.generated-data.js';
        if (file_exists($semDomFilePath)) {
            $this->data['jsNotMinifiedFiles'][] = $semDomFilePath;
            return;
        }

        $semDomFilePath = $model->siteFolder . '/core/semantic-domains/semantic-domains.en.generated-data.js';
        if (file_exists($semDomFilePath)) {
            $this->data['jsNotMinifiedFiles'][] = $semDomFilePath;
        }
    }

    private function processInviteToken(Application $app)
    {
        try
        {
            $projectId = ProjectModel::getIdByInviteToken($app['session']->get('inviteToken'));
        } catch (ResourceNotAvailableException $e)
        {
            throw new ResourceNotAvailableException('This invite link is not valid, it may have been disabled. Please check with your project manager.');
        }
        $userId = SilexSessionHelper::getUserId($app);
        ProjectCommands::useInviteToken($userId, $projectId);

        return $projectId;
    }

}

class AppNotFoundException extends \Exception { }

class AppModel {
    /**
     * @var Application
     */
    public $app;

    /**
     * @var string
     */
    public $appName;

    /**
     * @var string
     */
    public $parentAppFolder;

    /**
     * @var string
     */
    public $appFolder;

    /**
     * @var string
     */
    public $projectId;

    /**
     * @var bool
     */
    public $isBellows;

    /**
     * @var bool
     */
    public $isChildApp;

    /**
     * @var string
     */
    public $siteFolder;

    /**
     * @var string
     */
    public $bellowsFolder;

    /**
     * @var bool
     */
    public $requireProject;

    /**
     * @var bool
     */
    public $isPublicApp;

    /**
     * AppModel constructor
     * @param string $appName
     * @param string $projectId
     * @param Website $website
     * @param boolean $isPublicApp
     * @throws AppNotFoundException
     */
    public function __construct(Application $app, $appName, $website, $projectId = '') {
        $this->app = $app;
        $this->appName = $appName;
        $this->projectId = $projectId;
        $this->isPublicApp = (preg_match('@^/(public|auth)/@', $app['request']->getRequestUri()) == 1);
        $this->determineFolderPaths($appName, $projectId, $website, $this->isPublicApp);
     }

    /**
     * @param string $appName
     * @param string $projectId
     * @param Website $website
     * @param boolean $isPublic
     * @throws AppNotFoundException
     */
    private function determineFolderPaths($appName, $projectId, $website, $isPublic) {
        $siteFolder = NG_BASE_FOLDER . $website->base;
        $sitePublicFolder = "$siteFolder/public";
        $bellowsFolder = NG_BASE_FOLDER . "bellows";
        $bellowsAppFolder = "$bellowsFolder/apps";
        $bellowsPublicAppFolder = "$bellowsAppFolder/public";
        $parentAppFolder = '';
        $isChildApp = false;
        $isBellows = false;

        if ($isPublic) {
            if ($this->isChildApp($sitePublicFolder, $appName, $projectId)) {
                $parentAppFolder = "$sitePublicFolder/$appName";
                $appFolder = "$parentAppFolder/$projectId";
                $isChildApp = true;
                $appName = "$appName-$projectId";
            } elseif ($this->isChildApp($bellowsPublicAppFolder, $appName, $projectId)) {
                $parentAppFolder = "$bellowsPublicAppFolder/$appName";
                $appFolder = "$parentAppFolder/$projectId";
                $isChildApp = true;
                $appName = "$appName-$projectId";
                $isBellows = true;
            } elseif ($this->appExists($sitePublicFolder, $appName)) {
                $appFolder = "$sitePublicFolder/$appName";
            } elseif ($this->appExists($bellowsPublicAppFolder, $appName)) {
                $appFolder = "$bellowsPublicAppFolder/$appName";
                $isBellows = true;
            } else {
                throw new AppNotFoundException();
            }
        } else {
            if ($this->isChildApp($siteFolder, $appName, $projectId)) {
                $parentAppFolder = "$siteFolder/$appName";
                $appFolder = "$parentAppFolder/$projectId";
                $isChildApp = true;
                $appName = "$appName-$projectId";
            } elseif ($this->isChildApp($bellowsAppFolder, $appName, $projectId)) {
                $parentAppFolder = "$bellowsAppFolder/$appName";
                $appFolder = "$parentAppFolder/$projectId";
                $appName = "$appName-$projectId";
                $isChildApp = true;
                $isBellows = true;
            } elseif ($this->appExists($siteFolder, $appName)) {
                $appFolder = "$siteFolder/$appName";
            } elseif ($this->appExists($bellowsAppFolder, $appName)) {
                $appFolder = "$bellowsAppFolder/$appName";
                $isBellows = true;
            } else {
                throw new AppNotFoundException();
            }
        }

        $this->siteFolder = $siteFolder;
        $this->appFolder = $appFolder;
        $this->parentAppFolder = $parentAppFolder;
        $this->isChildApp = $isChildApp;
        $this->isBellows = $isBellows;
        $this->bellowsFolder = $bellowsFolder;
        $this->requireProject = $this->isProjectContextRequired($appName);
    }

    private function isProjectContextRequired($appName) {
        switch ($appName) {
            case "lexicon":
            case "projectmanagement":
            case "usermanagement":
                return true;
            default:
                return false;
        }
    }

    public function isAppAngular2() {
        $siteAppsInAngular2 = [
            "rapid-words",
            "review-suggest"
        ];
        return in_array($this->appName, $siteAppsInAngular2);
    }

    private function isChildApp($location, $parentAppName, $appName) {
        $appFolder = "$location/$parentAppName/$appName";
        return (
            $appName != '' &&
            file_exists($appFolder) &&
            file_exists("$appFolder/$parentAppName-$appName.html")
        );
    }

    private function appExists($location, $appName) {
        $appFolder = "$location/$appName";
        return file_exists($appFolder);
    }
}
