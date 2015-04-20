<?php

use models\UserModelBase;

use models\UserModel;

require_once 'base.php';

class validate extends Base
{
    public function check($validateKeySubmitted = '')
    {
        $userActivated = false;
        $userModel = new UserModelBase();
        if ($userModel->readByProperty('validationKey', $validateKeySubmitted)) {
            if ($userModel->validate()) {
                $userModel->active = true;
                $userModel->write();
                $userActivated = true;
            }
        }

        if ($userActivated) {
            $this->renderPage("validate/validate");
        } else {
            $this->load->helper('url');
            // if the validation has expired, chances are they have already validated.  Redirect to login
            redirect('/login', 'location');
        }

    }
}
