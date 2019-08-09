<?php

namespace Site\Controller;

use Api\Model\Languageforge\LfProjectModel;
use Api\Model\Shared\Command\ProjectCommands;
use Api\Library\Shared\SilexSessionHelper;
use Api\Library\Shared\Palaso\Exception\ResourceNotAvailableException;

use Api\Model\Shared\Mapper\MongoMapper;
use Api\Model\Shared\ProjectModel;
use Api\Model\Shared\UserModel;
use Silex\Application;

class Validate extends Base
{
    public static function check(Application $app, $validateKey = '')
    {
        $userActivated = false;
        $userModel = new UserModel();
        if ($userModel->readByProperty('validationKey', $validateKey)) {
            if ($userModel->validate(true)) {
                $userModel->active = true;
                $userModel->write();
                $userActivated = true;
            }
        }
        return $userActivated;
    }

    public function checkAndRedirect(Application $app, $validateKey = '') {
        if (self::check($app, $validateKey)) {
            $app['session']->getFlashBag()->add('infoMessage', 'Congratulations!  Your email has been validated and you\'re ready to login.');
        }
        return $app->redirect('/auth/login');
    }

    public function processInviteAndRedirect(Application $app, $inviteToken = '')
    {
        // Attempt to find the project with the given invite link
        try
        {
            $model = ProjectModel::getByInviteToken($inviteToken);

        } catch (ResourceNotAvailableException $e)
        {
            $errorString = 'This invite link is not valid, it may have been disabled. Please check with the project manager';
            $encodedError = base64_encode($errorString);
            $redirectPath = $this->isLoggedIn($app) ? '/app/projects': '/auth/login';
            $redirectPath .= '#!/?errorMessage=' . $encodedError;

            return $app->redirect($redirectPath);
        }

        // Add the user based on the invite token if they are logged in, otherwise redirect to login
        if ($this->isLoggedIn($app))
        {
            ProjectCommands::useInviteToken(SilexSessionHelper::getUserId($app), $model->id->id);
            return $app->redirect('/app/lexicon/' . $model->id->id);
        } else
        {
            $app['session']->set('inviteToken', $inviteToken);
            $redirectPath = 'auth/login' . base64_encode('Please log in or create an account to access this project');
            return $app->redirect('/auth/login#!/?errorMessage=');
        }

    }
}
