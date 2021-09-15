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
                return $app->redirect("/app/projects");
            }
            return $app->redirect('/auth/logout');
        } catch (\Exception $e) {
            return $app->redirect('/auth/logout');
        }
        if ($model->projectId) {
            try {
                $project = new ProjectModel($model->projectId);
                if ($project && $project->appName) {
                    return $app->redirect("/app/$project->appName/$model->projectId");
                }
            } catch (\Exception $e) {
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
                        return $app->redirect("/app/$project->appName/$projectId");
                    } else {
                        return $app->redirect('/app/projects');
                    }
                } catch (\Exception $e) {
                    return $app->redirect('/app/projects');
                }
                if ($project && $project->appName) {
                    $projectId = $project->id->asString();
                    return $app->redirect("/app/$project->appName/$projectId");
                }
            } else if (count($this->_user->projects->refs) == 0) {
                return $app->redirect('/app/lexicon/new-project');
            }
        }
        return $app->redirect('/app/projects');
    }
}
