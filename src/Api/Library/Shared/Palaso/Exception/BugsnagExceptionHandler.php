<?php

namespace Api\Library\Shared\Palaso\Exception;

use Api\Library\Shared\SilexSessionHelper;
use Api\Model\Shared\ProjectModel;
use Api\Model\Shared\UserModel;
use Bugsnag\Silex\Silex1ServiceProvider;
use Silex\Application;

class BugsnagExceptionHandler
{
    public static function setup(Application $application, String $apiKey)
    {
        $application->register(new Silex1ServiceProvider());

        $application['bugsnag.options'] = [
            'api_key' => $apiKey,
        ];

        $application['bugsnag']->setAppVersion(VERSION);

        $application['bugsnag']->registerCallback(function ($report) use ($application) {
            if ($application['security.token_storage']->getToken() != NULL) {
                $userId = SilexSessionHelper::getUserId($application);
                $user = new UserModel($userId);
                $report->setUser([
                    'id' => $userId,
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

        if (defined('ENVIRONMENT')) {
            $application['bugsnag']->setReleaseStage(ENVIRONMENT);
        }
    }

    public static function getBugsnag(Application $application)
    {
        return $application['bugsnag'];
    }
}
