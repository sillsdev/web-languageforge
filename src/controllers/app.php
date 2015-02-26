<?php

use models\ProjectModel;

use models\commands\SessionCommands;

require_once 'secure_base.php';

class app extends Secure_base
{
    public function view($app = 'main', $projectId = '')
    {
        $siteFolder = "angular-app/" . $this->website->base;
        $parentAppFolder = '';
        
        $appFolder = $siteFolder . "/$app";
        if ($projectId == 'new') {
            $parentAppFolder = $appFolder;
            $appFolder .= "/new-project";
            $projectId = '';
            $app = $app . "-new-project";
        }
        
        if (!file_exists($appFolder)) {
            $appFolder = "angular-app/bellows/apps/$app";
            if (!file_exists($appFolder)) {
                show_404($this->website->base); // this terminates PHP
            }
        }
        if ($projectId == 'favicon.ico') { $projectId = ''; }

        $this->data['appName'] = $app;
        $this->data['baseSite'] = $this->website->base; // used to add the right minified JS file
        $this->data['appFolder'] = $appFolder;

        // update the projectId in the session if it is not empty
        $projectModel = new ProjectModel();
        if ($projectId && $projectModel->exists($projectId)) {
            $projectModel = $projectModel->getById($projectId);
            if (!$projectModel->userIsMember((string) $this->session->userdata('user_id'))) {
                $error_msg = 'Uh oh, you are not an authorized member of this ' . $this->website->domain . ' project.  Please contact the Project Manager to be added to the project';
                show_error($error_msg, 403, '403 Forbidden: User not authorized');
            }
            $this->session->set_userdata('projectId', $projectId);
        } else {
            $projectId = (string) $this->session->userdata('projectId');
        }

        // Other session data
        $sessionData = SessionCommands::getSessionData($projectId, (string) $this->session->userdata('user_id'), $this->website);
        $this->data['jsonSession'] = json_encode($sessionData);

        $this->addJavascriptFiles("angular-app/bellows/js", array('vendor/', 'assets/'));
        $this->addJavascriptFiles("angular-app/bellows/directive");
        $this->addJavascriptFiles($siteFolder . '/js');
        if ($parentAppFolder) {
            $this->addJavascriptFiles($parentAppFolder, array('vendor/', 'assets/'));
        }
        $this->addJavascriptFiles($appFolder, array('vendor/', 'assets/'));

        $this->addJavascriptNotMinifiedFiles("angular-app/bellows/js/vendor");
        $this->addJavascriptNotMinifiedFiles("angular-app/bellows/js/assets");
        $this->addJavascriptNotMinifiedFiles($appFolder . "/js/vendor");
        $this->addJavascriptNotMinifiedFiles($appFolder . "/js/assets");

        $this->addCssFiles("angular-app/bellows/css");
        $this->addCssFiles($appFolder);

        $this->renderPage('angular-app');
    }
}
