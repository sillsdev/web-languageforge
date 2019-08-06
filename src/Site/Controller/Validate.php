<?php

namespace Site\Controller;

use Api\Model\Languageforge\LfProjectModel;
use Api\Model\Shared\Command\ProjectCommands;
use Api\Library\Shared\SilexSessionHelper;

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
        if ($this->isLoggedIn($app))
        {
            $testProjectId = ProjectCommands::createProject('Test ready', 'testcode39', LfProjectModel::LEXICON_APP, SilexSessionHelper::getUserId($app), $this->website, $srProject = null);
            $testLink = ProjectCommands::getNewInviteLink($testProjectId, 'Manager');
            $lastSlashPos = strrpos($testLink, '/');
            $testToken = substr($testLink, $lastSlashPos + 1);

            try
            {
                $model = ProjectModel::getByInviteToken($testToken);
                ProjectCommands::useInviteToken(SilexSessionHelper::getUserId($app), $model->id->id);
                return $app->redirect('/app/lexicon/' . $model->id->id);
            } catch (ResourceNotAvailibleException $e)
            {
                return 'Bad invite token!';
            }
        }
    }
}
