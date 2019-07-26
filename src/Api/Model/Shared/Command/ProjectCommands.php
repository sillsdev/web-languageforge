<?php

namespace Api\Model\Shared\Command;

use Api\Library\Shared\Palaso\Exception\ResourceNotAvailableException;
use Api\Library\Shared\Palaso\Exception\UserUnauthorizedException;
use Api\Library\Shared\Website;
use Api\Model\Languageforge\Lexicon\Command\SendReceiveCommands;
use Api\Model\Shared\Communicate\EmailSettings;
use Api\Model\Shared\Communicate\SmsSettings;
use Api\Model\Shared\Dto\ManageUsersDto;
use Api\Model\Shared\Mapper\JsonDecoder;
use Api\Model\Shared\Mapper\JsonEncoder;
use Api\Model\Shared\ProjectListModel;
use Api\Model\Shared\ProjectModel;
use Api\Model\Shared\ProjectSettingsModel;
use Api\Model\Shared\Rights\ProjectRoles;
use Api\Model\Shared\Rights\SystemRoles;
use Api\Model\Shared\UserModel;
use Palaso\Utilities\CodeGuard;

class ProjectCommands
{
    /**
     * Create a project, checking permissions as necessary
     * @param string $projectName
     * @param string $projectCode
     * @param string $appName
     * @param string $userId
     * @param Website $website
     * @param array $srProject send receive project data
     * @return string - projectId
     */
    public static function createProject($projectName, $projectCode, $appName, $userId, $website, $srProject = null)
    {
        // Check for unique project code
        if (ProjectCommands::projectCodeExists($projectCode)) {
            return false;
        }
        $project = new ProjectModel();
        $project->projectName = $projectName;
        $project->projectCode = $projectCode;
        $project->appName = $appName;
        $project->siteName = $website->domain;
        $project->ownerRef->id = $userId;
        $project->addUser($userId, ProjectRoles::MANAGER);
        $projectId = $project->write();
        if ($srProject) {
            SendReceiveCommands::updateSRProject($projectId, $srProject);
        }
        $user = new UserModel($userId);
        $user->addProject($projectId);
        $user->write();

        $project = ProjectModel::getById($projectId);
        $project->initializeNewProject();
        ActivityCommands::addUserToProject($project, $userId);

        return $projectId;
    }

    /**
     * @param string $id
     * @return array
     */
    public static function readProject($id)
    {
        $project = ProjectModel::getById($id);

        return JsonEncoder::encode($project);
    }

    /**
     * Delete a list of projects.  User needs to be site admin or project owner
     * @param array<string> $projectIds
     * @param string $userId
     * @return int Total number of projects removed.
     * @throws UserUnauthorizedException
     */
    public static function deleteProjects($projectIds, $userId)
    {
        CodeGuard::checkTypeAndThrow($projectIds, 'array');
        CodeGuard::checkTypeAndThrow($userId, 'string');

        $user = new UserModel($userId);
        $count = 0;
        foreach ($projectIds as $projectId) {
            CodeGuard::checkTypeAndThrow($projectId, 'string');
            $project = ProjectModel::getById($projectId);
            if ($userId != $project->ownerRef->asString() && $user->role != SystemRoles::SYSTEM_ADMIN) {
                throw new UserUnauthorizedException(
                    "This $project->appName project '$project->projectName'\n" .
                    "can only be deleted by project owner or\n " .
                    "a system administrator\n");
            }
            if ($user->lastUsedProjectId == $projectId) {
                $user->lastUsedProjectId = '';
                $user->write();
            }
            $project->remove();
            $count++;
        }
        return $count;
    }

    /**
     * @param string $projectId
     * @param string $userId
     * @return string projectId of the project archived.
     * @throws UserUnauthorizedException
     */
    public static function archiveProject($projectId, $userId)
    {
        CodeGuard::checkTypeAndThrow($projectId, 'string');
        CodeGuard::checkTypeAndThrow($userId, 'string');

        $project = new ProjectModel($projectId);
        $user = new UserModel($userId);
        if ($userId != $project->ownerRef->asString() && $user->role != SystemRoles::SYSTEM_ADMIN) {
            throw new UserUnauthorizedException(
                "This $project->appName project '$project->projectName'\n" .
                "can only be archived by project owner or\n " .
                "a system administrator\n");
        }

        $user->lastUsedProjectId = '';
        $user->write();

        $project->isArchived = true;
        return $project->write();
    }

    /**
     * @param array $projectIds
     * @return int Total number of projects published.
     */
    public static function publishProjects($projectIds)
    {
        CodeGuard::checkTypeAndThrow($projectIds, 'array');
        $count = 0;
        foreach ($projectIds as $projectId) {
            CodeGuard::checkTypeAndThrow($projectId, 'string');
            $project = new ProjectModel($projectId);
            $project->isArchived = false;
            $project->write();
            $count++;
        }

        return $count;
    }

    /**
     * @return ProjectListModel
     */
    public static function listProjects()
    {
        $list = new ProjectListModel();
        $list->read();

        return $list;
    }

    /**
     * If the project is archived, throws an exception because the project should not be modified
     * @param ProjectModel $project
     * @throws ResourceNotAvailableException
     */
    public static function checkIfArchivedAndThrow($project) {
        CodeGuard::checkNullAndThrow($project, 'project');
        CodeGuard::checkTypeAndThrow($project, '\Api\Model\Shared\ProjectModel');
        if ($project->isArchived) {
            throw new ResourceNotAvailableException(
                "This $project->appName project '$project->projectName'\n" .
                "is archived and cannot be modified. Please\n" .
                "contact a system administrator to re-publish\n" .
                "this project if you want to make further updates.");
        }
    }

    /**
     * List users in the project
     * @param string $projectId
     * @return array - the DTO array
     */
    public static function usersDto($projectId)
    {
        CodeGuard::checkTypeAndThrow($projectId, 'string');
        CodeGuard::checkNotFalseAndThrow($projectId, '$projectId');

        $usersDto = ManageUsersDto::encode($projectId);

        return $usersDto;
    }

    /**
     * Gets list of user requests
     * @param string $projectId
     * @return array of users join requests
     */
    public static function getJoinRequests($projectId)
    {
        $projectModel = ProjectModel::getById($projectId);
        $list = $projectModel->listRequests();
        return $list;
    }

    /**
     * Update the user project role in the project
     * @param string $projectId
     * @param string $userId
     * @param string $projectRole
     * @throws \Exception
     * @return string $userId
     */
    public static function updateUserRole($projectId, $userId, $projectRole = ProjectRoles::CONTRIBUTOR)
    {
        CodeGuard::checkNotFalseAndThrow($projectId, '$projectId');
        CodeGuard::checkNotFalseAndThrow($userId, 'userId');
        //CodeGuard::assertInArrayOrThrow($role, array(ProjectRoles::CONTRIBUTOR, ProjectRoles::MANAGER));

        // Add the user to the project
        $user = new UserModel($userId);
        $project = ProjectModel::getById($projectId);
        if ($project->userIsMember($userId) && $projectRole == $project->users[$userId]->role) {
            return $userId;
        }

        if ($userId == $project->ownerRef->asString()) {
            throw new \Exception("Cannot update role for project owner");
        }

        if ($projectRole == ProjectRoles::TECH_SUPPORT && $user->role != SystemRoles::SYSTEM_ADMIN) {
            throw new UserUnauthorizedException("Attempted to add non-admin as Tech Support");
        }

        ProjectCommands::usersDto($projectId);
        if (!$project->userIsMember($userId)) {
            ActivityCommands::addUserToProject($project, $userId);
        }

        $project->addUser($userId, $projectRole);
        $user->addProject($projectId);
        $project->write();
        $user->write();

        return $userId;
    }

    /**
     * Removes users from the project (two-way unlink)
     * @param string $projectId
     * @param array<string> $userIds
     * @return string $projectId
     * @throws \Exception
     */
    public static function removeUsers($projectId, $userIds)
    {
        $project = new ProjectModel($projectId);
        foreach ($userIds as $userId) {
            // Guard against removing project owner
            if ($userId != $project->ownerRef->id) {
                $user = new UserModel($userId);
                $project->removeUser($user->id->asString());
                $user->removeProject($project->id->asString());
                $project->write();
                $user->write();
            } else {
                throw new \Exception("Cannot remove project owner");
            }
        }

        return $projectId;
    }

    /**
     * Removes users from the project (two-way unlink)
     * @param string $projectId
     * @param string $joinRequestId
     * @return string $projectId
     */
    public static function removeJoinRequest($projectId, $joinRequestId)
    {
        $project = new ProjectModel($projectId);
        $project->removeUserJoinRequest($joinRequestId);
        return $project->write();
    }

    public static function grantAccessForUserRequest($projectId, $userId, $projectRole) {
        // check if userId exists in request queue on project model
        self::updateUserRole($projectId, $userId, $projectRole);
        // remove userId from request queue
        // send email notifying of acceptance
    }

    public static function requestAccessForProject($projectId, $userId) {
        // add userId to request queue
        // send email to project owner and all managers
    }

    public static function renameProject($projectId, $oldName, $newName)
    {
        // TODO: Write this. (Move renaming logic over from sf->project_update). RM 2013-08
    }

    /**
     * Updates the ProjectSettingsModel which are settings accessible only to site administrators
     * @param string $projectId
     * @param array<SmsSettings> $smsSettingsArray
     * @param array<EmailSettings> $emailSettingsArray
     * @return string $result id to the projectSettingsModel
     */
    public static function updateProjectSettings($projectId, $smsSettingsArray, $emailSettingsArray)
    {
        $projectSettings = new ProjectSettingsModel($projectId);
        ProjectCommands::checkIfArchivedAndThrow($projectSettings);
        $smsSettings = new SmsSettings();
        $emailSettings = new EmailSettings();
        JsonDecoder::decode($smsSettings, $smsSettingsArray);
        JsonDecoder::decode($emailSettings, $emailSettingsArray);
        $projectSettings->smsSettings = $smsSettings;
        $projectSettings->emailSettings = $emailSettings;
        $result = $projectSettings->write();

        return $result;
    }

    public static function readProjectSettings($projectId)
    {
        $project = new ProjectSettingsModel($projectId);

        return array(
            'sms' => JsonEncoder::encode($project->smsSettings),
            'email' => JsonEncoder::encode($project->emailSettings)
        );
    }

    /**
     * @param string $code
     * @return bool
     */
    public static function projectCodeExists($code)
    {
        $project = new ProjectModel();

        return $project->readByProperties(array('projectCode' => $code));
    }
}
