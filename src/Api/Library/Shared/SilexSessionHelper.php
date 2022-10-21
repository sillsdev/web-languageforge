<?php

namespace Api\Library\Shared;

use Api\Library\Shared\Palaso\Exception\UserUnauthorizedException;
use Api\Model\Shared\UserModel;
use Silex\Application;
use Site\Model\UserWithId;
use Api\Model\Shared\ProjectModel;
use Api\Model\Shared\Rights\SystemRoles;
use Api\Model\Shared\Rights\ProjectRoles;

class SilexSessionHelper
{
    public static function getUserId(Application $app)
    {
        $userId = "";
        $silexUser = $app["security.token_storage"]->getToken()->getUser();
        if (is_object($silexUser) && get_class($silexUser) == "Site\Model\UserWithId") {
            /** @var UserWithId $silexUser */
            $userId = $silexUser->getUserId();
        }
        return $userId;
    }

    public static function getProjectId(Application $app, Website $website, $projectId = "")
    {
        if ($projectId == "") {
            $projectId = $app["session"]->get("projectId");
        }
        if (!$projectId) {
            $userId = self::getUserId($app);
            $user = new UserModel($userId);
            $projectId = $user->getCurrentProjectId($website);
        }
        return $projectId;
    }

    public static function requireValidProjectIdForThisWebsite(Application $app, Website $website, $projectId)
    {
        $projectId = self::getProjectId($app, $website, $projectId);
        if ($projectId != "" && ProjectModel::projectExistsOnWebsite($projectId, $website)) {
            // ensure project is not archived
            $projectModel = ProjectModel::getById($projectId);
            if ($projectModel->isArchived) {
                // if project is archived, only system admins can access the project
                $userId = self::getUserId($app);
                if ($userId) {
                    $user = new UserModel($userId);
                    if ($user->role != SystemRoles::SYSTEM_ADMIN) {
                        $user->lastUsedProjectId = "";
                        $user->write();
                        $app["session"]->set("projectId", "");
                        throw new UserUnauthorizedException("Archived Project.  Access Denied.");
                    }
                }
            }
        } else {
            $app["session"]->set("projectId", "");
            throw new UserUnauthorizedException("Project does not exist on this site.");
        }
        return $projectId;
    }

    public static function requireValidProjectIdForThisWebsiteAndValidateUserMembership(
        Application $app,
        Website $website,
        $projectId
    ) {
        $projectId = self::requireValidProjectIdForThisWebsite($app, $website, $projectId);
        $userId = self::getUserId($app);
        if ($userId) {
            $project = ProjectModel::getById($projectId);
            $user = new UserModel($userId);
            // Add an admin to the project if they are not already a member
            if ($user->role == SystemRoles::SYSTEM_ADMIN) {
                if (!$project->userIsMember($userId)) {
                    $project->addUser($userId, ProjectRoles::TECH_SUPPORT);
                    $projectId = $project->write();
                    $user->addProject($projectId); // $user->write() occurs in the following if-block
                }
            }

            if ($project->userIsMember($userId)) {
                $user->lastUsedProjectId = $projectId;
                $user->write();
            } else {
                $user->lastUsedProjectId = "";
                $user->write();
                $app["session"]->set("projectId", "");
                throw new UserUnauthorizedException("User is not a member of this project.  Access Denied.");
            }
        } else {
            $app["session"]->set("projectId", "");
            throw new UserUnauthorizedException("Login required to access this project.");
        }
        return $projectId;
    }
}
