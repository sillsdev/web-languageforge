<?php

namespace Site\Controller;

use Api\Model\Shared\UserModel;
use Silex\Application;

class Validate extends Base
{
    public function check(Application $app, $validateKey = '') {
        $userActivated = false;
        $userModel = new UserModel();
        if ($userModel->readByProperty('validationKey', $validateKey)) {
            if ($userModel->validate(true)) {
                $userModel->active = true;
                $userModel->write();
                $userActivated = true;
            }
        }

        if ($userActivated) {
            $app['session']->getFlashBag()->add('infoMessage', 'Congratulations!  You email has been validated and you\'re ready to login.');
        }
        return $app->redirect('/auth/login');
    }
}
