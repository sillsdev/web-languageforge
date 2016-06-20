<?php

namespace Site\Controller;

use Api\Model\UserModelBase;
use Silex\Application;

class Validate extends Base
{
    public function check(Application $app, $validateKey = '') {
        $userActivated = false;
        $userModel = new UserModelBase();
        if ($userModel->readByProperty('validationKey', $validateKey)) {
            if ($userModel->validate()) {
                $userModel->active = true;
                $userModel->write();
                $userActivated = true;
            }
        }

        if ($userActivated) {
            return $this->renderPage($app, 'validate');
        } else {
            // if the validation has expired, chances are they have already validated.  Redirect to login
            return $app->redirect('/auth/login');
        }
    }
}
