<?php

namespace Site\Controller;

use Api\Library\Shared\SilexSessionHelper;
use Api\Model\Command\SessionCommands;
use Api\Model\ProjectModel;
use Api\Model\UserModel;
use Silex\Application;

class App extends Base
{
    public function view(Application $app, $appName, $projectId = '') {
        $this->setupNgView($app, $appName, $projectId);

        return $this->renderPage($app, 'angular-app');
    }

    public function setupNgView(Application $app, $appName, $projectId = '')
    {
        $siteFolder = NG_BASE_FOLDER . $this->website->base;
        $parentAppFolder = '';
        $appFolder = $this->website->base . '/' . $appName;

        if ($projectId == 'favicon.ico') {
            $projectId = '';
        }

        $possibleSubFolder = "$siteFolder/$appName/$projectId";
        if ($projectId != '' && file_exists($possibleSubFolder) && file_exists("$possibleSubFolder/ng-app.html") && file_exists("$possibleSubFolder/views")) {
            $parentAppFolder = $appFolder;
            $appFolder .= "/$projectId";
            $appName .= "-$projectId";
            $projectId = '';
        }

        if (!file_exists(NG_BASE_FOLDER . $appFolder)) {
            $appFolder = 'bellows/apps/' . $appName;
            if (!file_exists(NG_BASE_FOLDER . $appFolder)) {
                $app->abort(404, $this->website->base); // this terminates PHP
            }
        }

        $this->data['appName'] = $appName;
        $this->data['appFolder'] = $appFolder;
        $this->data['useMinifiedJs'] = USE_MINIFIED_JS;

        $this->_userId = SilexSessionHelper::getUserId($app);

        // update the projectId in the session if it is not empty
        if (!$projectId) {
            $projectId = SilexSessionHelper::getProjectId($app, $this->website);
        }
        if ($projectId && ProjectModel::projectExists($projectId)) {
            $projectModel = ProjectModel::getById($projectId);
            if (!$projectModel->userIsMember($this->_userId)) {
                $projectId = '';
            } else {
                $user = new UserModel($this->_userId);
                $user->lastUsedProjectId = $projectId;
                $user->write();
            }
        } else {
            $projectId = '';
        }
        $app['session']->set('projectId', $projectId);
        $this->_projectId = $projectId;

        // Other session data

        $sessionData = SessionCommands::getSessionData($this->_projectId, $this->_userId, $this->website);
        $this->data['jsonSession'] = json_encode($sessionData);

        $this->addJavascriptFiles(NG_BASE_FOLDER . 'bellows/js', array('vendor/', 'assets/'));
        $this->addJavascriptFiles(NG_BASE_FOLDER . 'bellows/directive');
        $this->addJavascriptFiles($siteFolder . '/js');
        if (NG_BASE_FOLDER . $parentAppFolder) {
            $this->addJavascriptFiles(NG_BASE_FOLDER . $parentAppFolder, array('vendor/', 'assets/'));
        }
        $this->addJavascriptFiles(NG_BASE_FOLDER . $appFolder, array('vendor/', 'assets/'));

        if ($appName == 'semdomtrans' || $appName == 'semdomtrans-new-project') {
            // special case for semdomtrans app
            // add lexicon JS files since the semdomtrans app depends upon these JS files
            $this->addJavascriptFiles($siteFolder . '/lexicon', array('vendor/', 'assets/'));
        }

        $this->addJavascriptNotMinifiedFiles(NG_BASE_FOLDER . 'bellows/js/vendor');
        $this->addJavascriptNotMinifiedFiles(NG_BASE_FOLDER . 'bellows/js/assets');
        $this->addJavascriptNotMinifiedFiles(NG_BASE_FOLDER . $appFolder . '/js/vendor');
        $this->addJavascriptNotMinifiedFiles(NG_BASE_FOLDER . $appFolder . '/js/assets');

        $this->addCssFiles(NG_BASE_FOLDER . 'bellows');
        $this->addCssFiles(NG_BASE_FOLDER . $appFolder);
    }
}
