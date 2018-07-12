<?php

namespace Site\Controller;

use Api\Library\Shared\Palaso\Exception\UserUnauthorizedException;
use Api\Library\Shared\SilexSessionHelper;
use Api\Library\Shared\Website;
use Api\Model\Shared\ProjectModel;
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
     * @throws UserUnauthorizedException
     * @throws \Exception
     */
    public function view(
        /** @noinspection PhpUnusedParameterInspection */
        Request $request, Application $app, $appName, $projectId = ''
    ) {
        $this->setupBaseVariables($app);
        $this->setupAngularAppVariables($app, $appName, $projectId);
        return $this->renderPage($app, 'angular-app');
    }

    /**
     * authentication is handled by the security policy set in index.php
     *
     * both /app/[appName] and /public/[appName] are handled by this controller
     * /public/[appName] does not require authentication whereas /app/[appName] requires a user to be logged in
     *
     * @param Application $app
     * @param string $appName
     * @param string $projectId
     * @throws UserUnauthorizedException
     * @throws AppNotFoundException
     * @throws \Exception
     */
    public function setupAngularAppVariables(Application $app, $appName, $projectId = '')
    {
        if ($projectId == 'favicon.ico') {
            $projectId = '';
        }

        $isPublicApp = (preg_match('@^/(public|auth)/@', $app['request']->getRequestUri()) == 1);

        $appModel = new AppModel($appName, $projectId, $this->website, $isPublicApp);

        if ($appModel->isChildApp) {
            $appName = "$appName-$projectId";
            $projectId = '';
        }

        $this->_appName = $appName;
        $this->data['isAngular2'] = $appModel->isAppAngular2();
        $this->data['appName'] = $appName;
        $this->data['appFolder'] = $appModel->appFolder;

        if ($appModel->requireProject) {
            if ($isPublicApp) {
                $projectId = SilexSessionHelper::requireValidProjectIdForThisWebsite($app, $this->website, $projectId);
            } else {
                $projectId = SilexSessionHelper::requireValidProjectIdForThisWebsiteAndValidateUserMembership($app, $this->website, $projectId);
            }
        }

        $app['session']->set('projectId', $projectId);
        $this->_projectId = $projectId;

        $this->addJavascriptFiles($appModel->siteFolder . '/js', ['vendor', 'assets']);

        if ($this->data['isAngular2']) {
            $this->addJavascriptFiles($appModel->appFolder . '/dist');
        } else {
            $this->addJavascriptFiles($appModel->appFolder, ['js/vendor', 'js/assets']);
        }

        if ($appModel->parentAppFolder) {
            $this->addJavascriptFiles($appModel->parentAppFolder, ['js/vendor', 'js/assets']);
        }

        if ($appName == 'semdomtrans' || $appName == 'semdomtrans-new-project') {
            // special case for semdomtrans app
            // add lexicon JS files since the semdomtrans app depends upon these JS files
            $this->addJavascriptFiles($appModel->siteFolder . '/lexicon', ['js/vendor', 'js/assets']);
        }

        $this->addCssFiles(NG_BASE_FOLDER . 'bellows/shared');
        $this->addCssFiles($appModel->appFolder, ['node_modules']);

        $this->addSemanticDomainFile($app, $appModel, $projectId);
    }

    /**
     * @param Application $app
     * @param AppModel $appModel
     * @param string $projectId
     * @throws \Exception
     */
    private function addSemanticDomainFile(Application $app, AppModel $appModel, string $projectId)
    {
        $interfaceLanguageCode = 'en';
        if ($projectId) {
            $project = ProjectModel::getById($projectId);
            if ($project->interfaceLanguageCode) {
                $interfaceLanguageCode = $project->interfaceLanguageCode;
            }

            $usernameOrEmail = $app['security.token_storage']->getToken()->getUser()->getUsername();
            $user = new UserModel();
            if ($user->readByUsernameOrEmail($usernameOrEmail)) {
                if ($user->interfaceLanguageCode) {
                    $interfaceLanguageCode = $user->interfaceLanguageCode;
                }
            }
        }

        $semDomFilePath = $appModel->siteFolder . '/core/semantic-domains/semantic-domains.' . $interfaceLanguageCode .
            '.generated-data.js';
        if (file_exists($semDomFilePath)) {
            $this->data['jsNotMinifiedFiles'][] = $semDomFilePath;
            return;
        }

        $semDomFilePath = $appModel->siteFolder . '/core/semantic-domains/semantic-domains.en.generated-data.js';
        if (file_exists($semDomFilePath)) {
            $this->data['jsNotMinifiedFiles'][] = $semDomFilePath;
        }
    }

}

class AppNotFoundException extends \Exception { }

class AppModel {
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
     * AppModel constructor
     * @param string $appName
     * @param string $projectId
     * @param Website $website
     * @param boolean $isPublicApp
     * @throws AppNotFoundException
     */
    public function __construct($appName, $projectId, $website, $isPublicApp)
    {
        $this->appName = $appName;
        $this->determineFolderPaths($appName, $projectId, $website, $isPublicApp);
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
            case "sfchecks":
            case "lexicon":
            case "translate":
            case "semdomtrans":
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
