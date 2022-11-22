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
     * @return Response
     */
    public function view(
        /** @noinspection PhpUnusedParameterInspection */
        Request $request,
        Application $app,
        $appName = "project",
        $projectId = ""
    ) {
        try {
            $this->setupBaseVariables($app);
        } catch (\Exception $e) {
            // Don't know what went wrong, so go to logout route to clear the session
            // This will then redirect to the login page
            return $app->redirect("/auth/logout");
        }
        try {
            // Get most recent project ID, either from PHP session or from user's lastUsedProjectID in MongoDB
            $projectId = SilexSessionHelper::requireValidProjectIdForThisWebsiteAndValidateUserMembership($app, "");
        } catch (UserUnauthorizedException $e) {
            if (SilexSessionHelper::getUserId($app)) {
                // User tried to access project they're not a member of, so show them projects view so they can pick a different one
                // This can happen if the user was removed from the project by a manager between their last login and now
                return $app->redirect("/app/projects");
            }
            // Session somehow persisted despite user being logged out, so go to logout route to clear the session
            return $app->redirect("/auth/logout");
        } catch (\Exception $e) {
            // Don't know what went wrong, so go to logout route to clear the session
            return $app->redirect("/auth/logout");
        }
        if ($projectId) {
            try {
                $project = new ProjectModel($projectId);
                if ($project && $project->appName) {
                    // Most recent project is still valid, so go straight there
                    return $app->redirect("/app/$project->appName/$projectId");
                }
            } catch (\Exception $e) {
                // Project ID no longer valid, probably because it was deleted. Let user pick a different one
                return $app->redirect("/app/projects");
            }
        }
        // No recently-used project on record, so check if the user has only one project, or none
        if ($this->_user && $this->_user->projects) {
            if (count($this->_user->projects->refs) == 1) {
                $projectRef = $this->_user->projects->refs[0];
                try {
                    $projectId = $projectRef->id;
                    $project = new ProjectModel($projectId);
                    if ($project && $project->appName) {
                        // User is member of only one project, so go straight there
                        $projectId = $project->id->asString();
                        return $app->redirect("/app/$project->appName/$projectId");
                    } else {
                        // User's only project was invalid (maybe deleted?), so let them join one or start a new one
                        return $app->redirect("/app/lexicon/new-project");
                    }
                } catch (\Exception $e) {
                    // Don't know what went wrong, so default to /app/projects as the most flexible choice
                    return $app->redirect("/app/projects");
                }
            } elseif (count($this->_user->projects->refs) == 0) {
                // User is not a member of any projects, so let them join one or start a new one
                return $app->redirect("/app/lexicon/new-project");
            }
        }
        // If we get here, user had 2 or more projects and didn't have a most recent one, so let them choose their next project
        return $app->redirect("/app/projects");
    }
}
