<?php

namespace Api\Library\Shared\Palaso\Exception;

use Api\Library\Shared\SilexSessionHelper;
use Api\Model\Shared\ProjectModel;
use Api\Model\Shared\UserModel;
use Bugsnag\Silex\Silex1ServiceProvider;
use Silex\Application;
use Sil\PhpEnv\Env; // https://github.com/silinternational/php-env#class-env-summary-of-functions

class BugsnagExceptionHandler
{
    public static function setup(Application $application)
    {
        $application->register(new Silex1ServiceProvider());

        $application['bugsnag.options'] = [
            'api_key' => Env::requireEnv('BUGSNAG_API_KEY'),
        ];

        $application['bugsnag']->setNotifyReleaseStages(Env::requireArray('BUGSNAG_NOTIFY_RELEASE_STAGES'));
        $application['bugsnag']->setAppVersion(VERSION);
        $application['bugsnag']->setAppType('PHP');

        $application['bugsnag']->registerCallback(function ($report) use ($application) {
            if ($application['security.token_storage']->getToken() != NULL) {
                $userId = SilexSessionHelper::getUserId($application);
                $user = new UserModel($userId);
                $report->setUser([
                    'username' => $user->username,
                    'name' => $user->name,
                    'email' => $user->email,
                    'created' => $user->dateCreated->asFormattedString(),
                ]);
                $projectId = $application['session']->get('projectId');
                $project = new ProjectModel($projectId);
                $report->setMetaData([
                    'app' => [
                        'projectCode' => $project->projectCode,
                        'projectName' => $project->projectName
                    ]
                ]);
            }
        });
    }

    public static function finishInitialization(Application $application) {
        if ($application['bugsnag'] == null)
            return;

        $application['bugsnag']->setReleaseStage($application['website']->releaseStage);
    }

    public static function getBugsnag(Application $application)
    {
        return $application['bugsnag'];
    }
}
