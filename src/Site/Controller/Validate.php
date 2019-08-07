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
            $errorString = 'This invite link is not valid, it may have been disabled. Please check with your project manager.';
            // If the user is logged in, pass an error message through the URL
            if ($this->isLoggedIn($app))
            {
                $encodedError = base64_encode($errorString);
                return $app->redirect('/app/projects#!/?errorMessage=' . $encodedError);
            // Otherwise send it through the FlashBag
            } else
            {
                $app['session']->getFlashBag()->add('errorMessage', $errorString);
                return $app->redirect('/app/projects');
            }
        }

        // Add the user based on the invite token if they are logged in
        if ($this->isLoggedIn($app))
        {
            if ($inviteToken == 'test') { // ANDREW: Remove test code
                $testProjectId = ProjectCommands::createProject('Test ready', 'testcode39', LfProjectModel::LEXICON_APP, SilexSessionHelper::getUserId($app), $this->website, $srProject = null);
                ProjectCommands::getNewInviteLink($testProjectId, 'Manager');
                $model = ProjectModel::getById($testProjectId);
            }
            ProjectCommands::useInviteToken(SilexSessionHelper::getUserId($app), $model->id->id);
        }
        return $app->redirect('/app/lexicon/' . $model->id->id);
    }
}
