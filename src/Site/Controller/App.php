<?php

namespace Site\Controller;

use Api\Library\Shared\SilexSessionHelper;
use Api\Library\Shared\Website;
use Api\Model\Shared\Command\SessionCommands;
use Silex\Application;
use Symfony\Component\HttpFoundation\Request;

class App extends Base
{
    public function view(Request $request, Application $app, $appName, $projectId = '') {
        $this->setupBaseVariables($app);
        $retVal = $this->setupNgView($app, $appName, $projectId);
        return $this->renderPage($app, 'angular-app');
    }

    public function setupNgView(Application $app, $appName, $projectId = '')
    {
        /**
         * authentication is handled by the security policy set in index.php
         *
         * both /app/[appName] and /public/[appName] are handled by this controller
         * /public/[appName] does not require authentication whereas /app/[appName] requires a user to be logged in
         *
         */

        if ($projectId == 'favicon.ico') {
            $projectId = '';
        }

        $isPublicApp = (preg_match('@^/(public|auth)/@', $app['request']->getRequestUri()) == 1);

        $appModel = new AppModel($appName, $projectId, $this->website, $isPublicApp);

        if ($appModel->isChildApp) {
            $appName = "$appName-$projectId";
            $projectId = '';
        }

        $this->data['isBootstrap4'] = $appModel->isBootstrap4;
        $this->data['appName'] = $appName;
        $this->data['appFolder'] = $appModel->appFolder;
        $this->data['bootstrapFolder'] = $appModel->bootstrapFolder;

        if ($appModel->requireProject) {
            if ($isPublicApp) {
                $projectId = SilexSessionHelper::requireValidProjectIdForThisWebsite($app, $this->website, $projectId);
            } else {
                $projectId = SilexSessionHelper::requireValidProjectIdForThisWebsiteAndValidateUserMembership($app, $this->website, $projectId);
            }
        }

        $app['session']->set('projectId', $projectId);
        $this->_projectId = $projectId;

        // determine help menu button visibility
        // placeholder for UI language 'en' to support translation of helps in the future
        $helpsFolder = $appModel->appFolder . "/helps/en/page";
        if (file_exists($helpsFolder) &&
            iterator_count(new \FilesystemIterator($helpsFolder, \FilesystemIterator::SKIP_DOTS)) > 0
        ) {
            $this->_showHelp = true;
            // there is an implicit dependency on bellows JS here using the jsonRpc module
            $this->addJavascriptFiles(NG_BASE_FOLDER . 'container/js', array('vendor/', 'assets/'));
        }

        // Other session data
        $this->data['jsonSession'] = json_encode(SessionCommands::getSessionData($this->_projectId, $this->_userId, $this->website, $appName), JSON_UNESCAPED_SLASHES);

        $this->addJavascriptFiles($appModel->bellowsFolder . '/_js_module_definitions');
        $this->addJavascriptFiles($appModel->bellowsFolder . '/js', array('vendor', 'assets'));
        $this->addJavascriptFiles($appModel->bellowsFolder . '/directive');
        $this->addJavascriptFiles($appModel->siteFolder . '/js', array('vendor', 'assets'));
        $this->addJavascriptFiles($appModel->appFolder , array('js/vendor', 'js/assets'));
        if ($appModel->parentAppFolder) {
            $this->addJavascriptFiles($appModel->parentAppFolder, array('js/vendor', 'js/assets'));
        }

        if ($appName == 'semdomtrans' || $appName == 'semdomtrans-new-project') {
            // special case for semdomtrans app
            // add lexicon JS files since the semdomtrans app depends upon these JS files
            $this->addJavascriptFiles($appModel->siteFolder . '/lexicon', array('js/vendor', 'js/assets'));
        }

        if ($appModel->isBootstrap4) {
            $this->addCssFiles(NG_BASE_FOLDER . 'bellows/cssBootstrap4');
            $this->addCssFiles(NG_BASE_FOLDER . 'bellows/directive/bootstrap4');
        } else {
            $this->addCssFiles(NG_BASE_FOLDER . 'bellows/cssBootstrap2');
            $this->addCssFiles(NG_BASE_FOLDER . 'bellows/directive/bootstrap2');
        }
        $this->addCssFiles($appModel->bootstrapFolder);
    }
}

class AppNotFoundException extends \Exception { }

class AppModel {

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
    public $bootstrapFolder;

    /**
     * @var bool
     */
    public $isBootstrap4;

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
     * @param $appName string
     * @param $projectId string
     * @param $website Website
     * @param $isPublicApp bool
     */
    public function __construct($appName, $projectId, $website, $isPublicApp)
    {
        $this->determineFolderPaths($appName, $projectId, $website, $isPublicApp);
    }

    private function determineFolderPaths($appName, $projectId, $website, $isPublic) {
        $isBootstrap4 = $this->isAppBootstrap4($appName, $website);
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

        $bootstrapNumber = ($isBootstrap4) ? 4 : 2;
        if (file_exists("$appFolder/bootstrap$bootstrapNumber")) {
            $bootstrapFolder = "$appFolder/bootstrap$bootstrapNumber";
        } else {
            $bootstrapFolder = $appFolder;
        }

        $this->siteFolder = $siteFolder;
        $this->appFolder = $appFolder;
        $this->parentAppFolder = $parentAppFolder;
        $this->bootstrapFolder = $bootstrapFolder;
        $this->isBootstrap4 = $isBootstrap4;
        $this->isChildApp = $isChildApp;
        $this->isBellows = $isBellows;
        $this->bellowsFolder = $bellowsFolder;
        $this->requireProject = $this->isProjectContextRequired($appName);
    }

    private function isProjectContextRequired($appName) {
        switch ($appName) {
            case "sfchecks":
            case "lexicon":
            case "semdomtrans":
            case "projectmanagement":
            case "usermanagement":
                return true;
            default:
                return false;
        }
    }

    private function isAppBootstrap4($appName, $website) {

        // replace "appName" with the name of the angular app that has been migrated to bootstrap 4
        // Note that this will affect both the angular app and the app frame

        $sharedAppsInBoostrap4 = array("sharedApp1", "sharedApp2");

        $siteAppsInBootstrap4 = array(
            "scriptureforge" => array("appName"),
            "languageforge" => array("appName"),
            "waaqwiinaagiwritings" => array(),
            "jamaicanpsalms.scriptureforge" => array(),
            "demo.scriptureforge" => array(),
        );

        $siteLookup = preg_replace('/^(dev\.)?(\S+)\.(org|local|com)$/', '$2', $website->domain);

        if (in_array($appName, $sharedAppsInBoostrap4)) {
            return true;
        }

        if (array_key_exists($siteLookup, $siteAppsInBootstrap4)) {
            if (in_array($appName, $siteAppsInBootstrap4[$siteLookup])) {
                return true;
            }
        }

        return false;
    }

    private function isChildApp($location, $parentAppName, $appName) {
        $appFolder = "$location/$parentAppName/$appName";
        return (
            $appName != '' &&
            file_exists($appFolder) &&
            file_exists("$appFolder/$parentAppName-$appName.html") &&
            file_exists("$appFolder/views")
        );
    }

    private function appExists($location, $appName) {
        $appFolder = "$location/$appName";
        return file_exists($appFolder);
    }
}
