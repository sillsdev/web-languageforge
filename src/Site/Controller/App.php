<?php

namespace Site\Controller;

use Silex\Application;
use Api\Model\ProjectModel;
use Api\Model\Command\SessionCommands;

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
        if ($projectId == 'new') {
            $parentAppFolder = $appFolder;
            $appFolder .= '/new-project';
            $projectId = '';
            $appName = $appName . '-new-project';
        } elseif ($projectId == 'manage') {
            $parentAppFolder = $appFolder;
            $appFolder .= '/app-management';
            $projectId = '';
            $appName = $appName . '-app-management';
        }

        if (!file_exists(NG_BASE_FOLDER . $appFolder)) {
            $appFolder = 'bellows/apps/' . $appName;
            if (!file_exists(NG_BASE_FOLDER . $appFolder)) {
                $app->abort(404, $this->website->base); // this terminates PHP
            }
        }
        if ($projectId == 'favicon.ico') {
            $projectId = '';
        }

        $this->data['appName'] = $appName;
        $this->data['appFolder'] = $appFolder;
        $this->data['useMinifiedJs'] = USE_MINIFIED_JS;
        $this->data['useLocalDependencies'] = USE_LOCAL_DEPENDENCIES;

        // update the projectId in the session if it is not empty
        $projectModel = new ProjectModel();
        if ($projectId && $projectModel->exists($projectId)) {
            $projectModel = $projectModel->getById($projectId);
            if (!$projectModel->userIsMember((string)$app['session']->get('user_id'))) {
                $projectId = '';
            }
            $app['session']->set('projectId', $projectId);
        } else {
            if (!$projectModel->userIsMember((string)$app['session']->get('user_id'))) {
                $projectId = '';
            } else {
                $projectId = (string)$app['session']->get('projectId');
            }
        }

        // Other session data

        $sessionData = SessionCommands::getSessionData($projectId, (string)$app['session']->get('user_id'),
            $this->website);
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
