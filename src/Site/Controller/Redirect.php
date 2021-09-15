<?php

namespace Site\Controller;

use Api\Library\Shared\Palaso\Exception\UserUnauthorizedException;
use Api\Library\Shared\SilexSessionHelper;
use Api\Model\Shared\ProjectModel;
use Api\Model\Shared\UserModel;
use Silex\Application;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class Redirect extends App
{
    /**
     * @param Request $request
     * @param Application $app
     * @param $appName
     * @param string $projectId
     * @return Response
     */
    public function view(
        /** @noinspection PhpUnusedParameterInspection */
        Request $request, Application $app, $appName, $projectId = ''
    ) {
        $model = new AppModel($app, $appName, $this->website, $projectId);
        try {
            $this->setupBaseVariables($app);
        } catch (\Exception $e) {
            \error_log('Exception setting up base variables in /redirect');
            return $app->redirect('/auth/logout');
        }
        try {
            if ($model->requireProject) {
                if ($model->isPublicApp) {
                    $model->projectId = SilexSessionHelper::requireValidProjectIdForThisWebsite($model->app, $this->website, $model->projectId);
                } else {
                    $model->projectId =
                        SilexSessionHelper::requireValidProjectIdForThisWebsiteAndValidateUserMembership($model->app, $this->website, $model->projectId);
                }
            }
        } catch (UserUnauthorizedException $e) {
            if (SilexSessionHelper::getUserId($app)) {
                // User tried to access project they're not a member of, so show them projects view so they can pick a different one
                \error_log('UserUnauthorizedException in /redirect, SilexSessionHelper::getUserId returned true');
                return $app->redirect("/app/projects");
            }
            \error_log('UserUnauthorizedException in /redirect, SilexSessionHelper::getUserId returned false');
            return $app->redirect('/auth/logout');
        } catch (\Exception $e) {
            \error_log('Exception getting project ID in /redirect');
            return $app->redirect('/auth/logout');
        }
        if ($model->projectId) {
            try {
                $project = new ProjectModel($model->projectId);
                if ($project && $project->appName) {
                    \error_log("Recent project, redirecting to /app/$project->appName/$model->projectId");
                    return $app->redirect("/app/$project->appName/$model->projectId");
                }
            } catch (\Exception $e) {
                \error_log("Exception trying to create ProjectModel for recent project with ID $model->projectId");
                return $app->redirect('/auth/logout');
            }
        }
        if ($this->_user && $this->_user->projects) {
            if (count($this->_user->projects->refs) == 1) {
                $projectRef = $this->_user->projects->refs[0];
                try {
                    $projectId = $projectRef->id;
                    $project = new ProjectModel($projectId);
                    if ($project && $project->appName) {
                        $projectId = $project->id->asString();
                        \error_log("Single project, redirecting to /app/$project->appName/$projectId");
                        return $app->redirect("/app/$project->appName/$projectId");
                    } else {
                        \error_log("Could not load single project correctly, redirecting to /app/projects");
                        return $app->redirect('/app/projects');
                    }
                } catch (\Exception $e) {
                    \error_log("Exception trying to find appName of single project, redirecting to /app/projects");
                    return $app->redirect('/app/projects');
                }
                if ($project && $project->appName) {
                    $projectId = $project->id->asString();
                    \error_log("Single project, redirecting to /app/$project->appName/$projectId");
                    return $app->redirect("/app/$project->appName/$projectId");
                }
            } else if (count($this->_user->projects->refs) == 0) {
                \error_log("User has no projects; redirecting to new-project page");
                return $app->redirect('/app/lexicon/new-project');
            }
            \error_log("Found many projects: " . \print_r($this->_user->projects->refs, true));
        }
        \error_log("Redirect controller could not make a decision, redirecting to /app/projects");
        return $app->redirect('/app/projects');
    }
}
