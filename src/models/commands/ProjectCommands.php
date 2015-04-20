<?php

namespace models\commands;

use libraries\shared\Website;

use Palaso\Utilities\CodeGuard;
use libraries\scriptureforge\sfchecks\Email;
use models\ProjectModel;
use models\ProjectSettingsModel;
use models\UserModel;
use models\shared\dto\ManageUsersDto;
use models\mapper\Id;
use models\mapper\JsonDecoder;
use models\mapper\JsonEncoder;
use models\shared\rights\Domain;
use models\shared\dto\RightsHelper;
use models\shared\rights\Operation;
use libraries\shared\palaso\exceptions\UserUnauthorizedException;

use models\shared\rights\ProjectRoles;
use models\sms\SmsSettings;

class ProjectCommands
{
    /**
     * Create a project, checking permissions as necessary
     * @param string $projectName
     * @param string $projectCode
     * @param string $appName
     * @param string $userId
     * @param Website $website
     * @return string - projectId
     */
    public static function createProject($projectName, $projectCode, $appName, $userId, $website)
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
        $user = new UserModel($userId);
        $user->addProject($projectId);
        $user->write();

        $project = ProjectModel::getById($projectId);
        $project->initializeNewProject();
        ActivityCommands::addUserToProject($project, $userId);

        return $projectId;
    }

    /**
     *
     * @param string $id
     */
    public static function readProject($id)
    {
        $project = new \models\ProjectModel($id);

        return JsonEncoder::encode($project);
    }

    /**
     * @param array $projectIds
     * @return int Total number of projects removed.
     */
    public static function deleteProjects($projectIds)
    {
        CodeGuard::checkTypeAndThrow($projectIds, 'array');
        $count = 0;
        foreach ($projectIds as $projectId) {
            CodeGuard::checkTypeAndThrow($projectId, 'string');
            $project = new \models\ProjectModel($projectId);
            $project->remove();
            $count++;
        }
        // TODO BUG: this does not remove users from a project before the project is deleted
        // STEP 1: enumerate users in the project
        // STEP 2: remove the user from the project
        // STEP 3: delete the project
        return $count;
    }

    /**
     * @param $projectId
     * @return int Total number of projects archived.
     * @throws UserUnauthorizedException
     */
    public static function archiveProject($projectId)
    {
        CodeGuard::checkTypeAndThrow($projectId, 'string');
        $project = new \models\ProjectModel($projectId);
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
     *
     * @return \models\ProjectListModel
     */
    public static function listProjects()
    {
        $list = new \models\ProjectListModel();
        $list->read();

        return $list;
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
     * Update the user project role in the project
     * @param string $projectId
     * @param string $userId
     * @param string $projectRole
     * @return string - userId
     */
    public static function updateUserRole($projectId, $userId, $projectRole = ProjectRoles::CONTRIBUTOR)
    {
        CodeGuard::checkNotFalseAndThrow($projectId, '$projectId');
        CodeGuard::checkNotFalseAndThrow($userId, 'userId');
        //CodeGuard::assertInArrayOrThrow($role, array(ProjectRoles::CONTRIBUTOR, ProjectRoles::MANAGER));

        // Add the user to the project
        $user = new UserModel($userId);
        $project = ProjectModel::getById($projectId);

        if ($userId == $project->ownerRef->asString()) {
            throw new \Exception("Cannot update role for project owner");
        }

        // TODO: Only trigger activity if this is the first time they have been added to project
        $usersDto = ProjectCommands::usersDto($projectId);
        if (!$project->users->offsetExists($userId)) {
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
     * @param Id $projectId
     * @param array $userIds array<string>
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
    }
    
    public static function listUserRequestsForAccess($projectId) {
        
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

    public static function updateProjectSettings($projectId, $smsSettingsArray, $emailSettingsArray)
    {
        $smsSettings = new \models\sms\SmsSettings();
        $emailSettings = new \models\EmailSettings();
        JsonDecoder::decode($smsSettings, $smsSettingsArray);
        JsonDecoder::decode($emailSettings, $emailSettingsArray);
        $projectSettings = new ProjectSettingsModel($projectId);
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
     *
     * @param Website $website
     * @param string $code
     * @return bool
     */
    public static function projectCodeExists($code)
    {
        $project = new ProjectModel();

        return $project->readByProperties(array('projectCode' => $code));
    }

}
