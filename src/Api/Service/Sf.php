<?php

namespace Api\Service;

use Api\Library\Shared\Palaso\Exception\UserNotAuthenticatedException;
use Api\Library\Shared\Palaso\Exception\UserUnauthorizedException;
use Api\Library\Shared\SilexSessionHelper;
use Api\Model\Languageforge\Lexicon\Command\LexCommentCommands;
use Api\Model\Languageforge\Lexicon\Command\LexEntryCommands;
use Api\Model\Languageforge\Lexicon\Command\LexOptionListCommands;
use Api\Model\Languageforge\Lexicon\Command\LexProjectCommands;
use Api\Model\Languageforge\Lexicon\Command\LexUploadCommands;
use Api\Model\Languageforge\Lexicon\Command\SendReceiveCommands;
use Api\Model\Languageforge\Lexicon\Dto\LexBaseViewDto;
use Api\Model\Languageforge\Lexicon\Dto\LexDbeDto;
use Api\Model\Languageforge\Lexicon\Dto\LexProjectDto;
use Api\Model\Shared\Command\MessageCommands;
use Api\Model\Shared\Command\ProjectCommands;
use Api\Model\Shared\Command\SessionCommands;
use Api\Model\Shared\Command\UserCommands;
use Api\Model\Shared\Command\LdapiCommands;
use Api\Model\Shared\Communicate\EmailSettings;
use Api\Model\Shared\Communicate\SmsSettings;
use Api\Model\Shared\Dto\ActivityListDto;
use Api\Model\Shared\Dto\ProjectInsightsDto;
use Api\Model\Shared\Dto\ProjectListDto;
use Api\Model\Shared\Dto\ProjectManagementDto;
use Api\Model\Shared\Dto\RightsHelper;
use Api\Model\Shared\Dto\UserProfileDto;
use Api\Model\Shared\Mapper\JsonEncoder;
use Api\Model\Shared\ProjectModel;
use Api\Model\Shared\UserListModel;
use Api\Model\Shared\UserModel;
use Silex\Application;
use Site\Controller\Auth;

require_once APPPATH . "vendor/autoload.php";

class Sf
{
    public function __construct(Application $app)
    {
        $this->app = $app;
        $this->userId = SilexSessionHelper::getUserId($app);
        $this->projectId = SilexSessionHelper::getProjectId($app);

        // "Kick" session every time we use an API call, so it won't time out
        $this->update_last_activity();

        // TODO put in the LanguageForge style error handler for logging / jsonrpc return formatting etc. CP 2013-07
        ini_set("display_errors", 0);
    }

    /** @var Application */
    private $app;

    /** @var string */
    private $userId;

    /** @var string */
    private $projectId;

    // ---------------------------------------------------------------
    // IMPORTANT NOTE TO THE DEVELOPERS
    // ---------------------------------------------------------------
    // When adding a new api method, also add your method name and appropriate RightsHelper statement as required by
    // the method's context (project context or site context) to the RightsHelper::userCanAccessMethod() method
    // FYI userCanAccessMethod() is a whitelist. Anything not explicitly listed is denied access
    //
    // If an api method is ever renamed, remember to update the name in this method as well
    // ---------------------------------------------------------------

    /*
     * --------------------------------------------------------------- BELLOWS ---------------------------------------------------------------
     */

    // ---------------------------------------------------------------
    // USER API
    // ---------------------------------------------------------------

    /**
     * Read a user from the given $id
     *
     * @param string $id
     * @return array
     */
    public function user_read($id)
    {
        return UserCommands::readUser($id);
    }

    /**
     * Read the user profile from $id
     *
     * @return array
     */
    public function user_readProfile()
    {
        return UserProfileDto::encode($this->userId);
    }

    /**
     * Ban a User from the given $id
     *
     * @params string $id
     * @return string Id of banned user
     */
    public function user_ban($id)
    {
        return UserCommands::banUser($id);
    }

    /**
     * Create/Update a User
     *
     * @param array $params (encoded UserModel)
     * @return string Id of written object
     */
    public function user_update($params)
    {
        return UserCommands::updateUser($params);
    }

    /**
     * Update a User Profile
     * Changing username will notify client to signout
     *
     * @param array $params (encoded UserModel)
     * @return  bool|string False if update failed; $userId on update; 'login' on
     *  username change to notify client to signout
     */
    public function user_updateProfile($params)
    {
        $result = UserCommands::updateUserProfile($params, $this->userId);
        if ($result == "login") {
            // Username changed
            $this->app["session"]->getFlashBag()->add("infoMessage", "Username changed. Please login.");
        }
        return $result;
    }

    /**
     * Delete users
     *
     * @param array<string> $userIds
     * @return int Count of deleted users
     */
    public function user_delete($userIds)
    {
        return UserCommands::deleteUsers($userIds);
    }

    /**
     * @param string $username
     * @return array CreateSimpleDto
     */
    public function user_createSimple($username)
    {
        return UserCommands::createSimple($username, $this->projectId, $this->userId);
    }

    // TODO Pretty sure this is going to want some paging params
    /**
     * @return UserListModel
     */
    public function user_list()
    {
        return UserCommands::listUsers();
    }

    public function user_typeahead($term, $projectIdToExclude = "")
    {
        return UserCommands::userTypeaheadList($term, $projectIdToExclude);
    }

    public function user_typeaheadExclusive($term, $projectIdToExclude = "")
    {
        $projectIdToExclude = empty($projectIdToExclude) ? $this->projectId : $projectIdToExclude;
        return UserCommands::userTypeaheadList($term, $projectIdToExclude);
    }

    public function change_password($userId, $newPassword)
    {
        return UserCommands::changePassword($userId, $newPassword, $this->userId);
    }

    public function reset_password($resetPasswordKey, $newPassword)
    {
        return Auth::resetPassword($this->app, $resetPasswordKey, $newPassword);
    }

    public function check_unique_identity($userId, $updatedUsername, $updatedEmail)
    {
        if ($userId) {
            $user = new UserModel($userId);
        } else {
            $user = new UserModel();
        }
        return UserCommands::checkUniqueIdentity($user, $updatedUsername, $updatedEmail);
    }

    /**
     * Register a new user with password and optionally add them to a project if allowed by permissions
     *
     * @param array $params
     * @return string Id of written object
     */
    public function user_register($params)
    {
        $result = UserCommands::register($params, $this->app["session"]->get("captcha_info"));
        if ($result == "login") {
            Auth::login($this->app, UserCommands::sanitizeInput($params["email"]), $params["password"]);
        }
        return $result;
    }

    public function user_register_oauth($params)
    {
        $result = UserCommands::registerOAuthUser($params);
        if ($result == "login") {
            Auth::loginWithoutPassword($this->app, UserCommands::sanitizeInput($params["username"]));
        }
        return $result;
    }

    public function user_calculate_username($usernameBase)
    {
        return UserCommands::calculateUniqueUsernameFromString($usernameBase);
    }

    public function user_create($params)
    {
        return UserCommands::createUser($params);
    }

    public function get_captcha_data()
    {
        return UserCommands::getCaptchaData($this->app["session"]);
    }

    public function user_sendInvite($toEmail, $lexRoleKey)
    {
        return UserCommands::sendInvite($this->projectId, $this->userId, $toEmail, null, $lexRoleKey);
    }

    public function project_insights_csv()
    {
        return ProjectInsightsDto::csvInsights();
    }

    // ---------------------------------------------------------------
    // GENERAL PROJECT API
    // ---------------------------------------------------------------

    public function project_sendJoinRequest($projectID)
    {
        return UserCommands::sendJoinRequest($projectID, $this->userId);
    }

    /**
     * @param string $projectName
     * @param string $projectCode
     * @param string $appName
     * @param array $srProject send receive project data
     * @return string | boolean - $projectId on success, false if project code is not unique
     */
    public function project_create($projectName, $projectCode, $appName, $srProject = null)
    {
        return ProjectCommands::createProject($projectName, $projectCode, $appName, $this->userId, $srProject);
    }

    /**
     * Creates project and switches the session to the new project
     *
     * @param string $projectName
     * @param string $projectCode
     * @param string $appName
     * @param array $srProject
     * @return string|bool $projectId on success, false if project code is not unique
     */
    public function project_create_switchSession($projectName, $projectCode, $appName, $srProject)
    {
        $projectId = $this->project_create($projectName, $projectCode, $appName, $srProject);
        $this->app["session"]->set("projectId", $projectId);
        return $projectId;
    }

    /**
     * Join user to project and switches the session to the new project
     *
     * @param string $srIdentifier
     * @param string $role
     * @return string|bool $projectId on success, false if project code doesn't exist
     * @throws \Exception
     */
    public function project_join_switchSession($srIdentifier, $role)
    {
        $projectId = SendReceiveCommands::getProjectIdFromSendReceive($srIdentifier);
        if (!$projectId) {
            return false;
        }

        ProjectCommands::updateUserRole($projectId, $this->userId, $role);
        $this->app["session"]->set("projectId", $projectId);
        return $projectId;
    }

    /**
     * Clear out the session projectId and archive project
     *
     * @return string
     */

    public function project_archive()
    {
        $this->app["session"]->set("projectId", "");
        return ProjectCommands::archiveProject($this->projectId, $this->userId);
    }

    public function project_archivedList()
    {
        return ProjectListDto::encode($this->userId, true);
    }

    /**
     * Publish selected list of archived projects
     *
     * @param array<string> $projectIds
     * @return int Count of published projects
     */
    public function project_publish($projectIds)
    {
        return ProjectCommands::publishProjects($projectIds);
    }

    // TODO Pretty sure this is going to want some paging params
    public function project_list()
    {
        return ProjectCommands::listProjects();
    }

    public function project_list_dto()
    {
        return ProjectListDto::encode($this->userId);
    }

    public function project_joinProject($projectId, $role)
    {
        return ProjectCommands::updateUserRole($projectId, $this->userId, $role);
    }

    public function project_usersDto()
    {
        return ProjectCommands::usersDto($this->projectId);
    }

    public function project_getJoinRequests()
    {
        return ProjectCommands::getJoinRequests($this->projectId);
    }

    public function project_createInviteLink($defaultRole)
    {
        return ProjectCommands::createInviteLink($this->projectId, $defaultRole);
    }

    public function project_getInviteLink()
    {
        return ProjectCommands::getInviteLink($this->projectId);
    }

    public function project_disableInviteToken()
    {
        ProjectCommands::disableInviteToken($this->projectId);
    }

    public function project_updateInviteTokenRole($newRole)
    {
        ProjectCommands::updateInviteTokenRole($this->projectId, $newRole);
    }

    /**
     * Clear out the session projectId and permanently delete selected list of projects.
     *
     * @param array<string> $projectIds Default to current projectId
     * @return int Total number of projects removed.
     */
    public function project_delete($projectIds)
    {
        if (empty($projectIds)) {
            $projectIds = [$this->projectId];
        }
        $this->app["session"]->set("projectId", "");
        return ProjectCommands::deleteProjects($projectIds, $this->userId);
    }

    // ---------------------------------------------------------------
    // SESSION API
    // ---------------------------------------------------------------
    public function session_getSessionData()
    {
        return SessionCommands::getSessionData($this->projectId, $this->userId);
    }

    public function projectcode_exists($code)
    {
        return ProjectCommands::projectCodeExists($code);
    }

    // ---------------------------------------------------------------
    // Activity Log
    // ---------------------------------------------------------------
    public function valid_activity_types_dto()
    {
        return ActivityListDto::getActivityTypes();
    }

    public function activity_list_dto($filterParams = [])
    {
        return ActivityListDto::getActivityForUser($this->userId, $filterParams);
    }

    public function activity_list_dto_for_current_project($filterParams = [])
    {
        $projectModel = ProjectModel::getById($this->projectId);
        return ActivityListDto::getActivityForOneProject($projectModel, $this->userId, $filterParams);
    }

    public function activity_list_dto_for_lexical_entry($entryId, $filterParams = [])
    {
        $projectModel = ProjectModel::getById($this->projectId);
        return ActivityListDto::getActivityForOneLexEntry($projectModel, $entryId, $filterParams);
    }

    // ---------------------------------------------------------------
    // PROJECT API
    // ---------------------------------------------------------------

    public function project_updateUserRole($userId, $role)
    {
        return ProjectCommands::updateUserRole($this->projectId, $userId, $role);
    }

    public function project_transferOwnership($newOwnerId)
    {
        return ProjectCommands::transferOwnership($this->projectId, $this->userId, $newOwnerId);
    }

    public function project_acceptJoinRequest($userId, $role)
    {
        UserCommands::acceptJoinRequest($this->projectId, $userId, $role);
        ProjectCommands::removeJoinRequest($this->projectId, $userId);
    }

    public function project_denyJoinRequest($userId)
    {
        ProjectCommands::removeJoinRequest($this->projectId, $userId);
    }

    // REVIEW: should this be part of the general project API ?
    public function project_removeUsers($userIds)
    {
        return ProjectCommands::removeUsers($this->projectId, $userIds);
    }

    /**
     * Read a project from the given $id
     *
     * @param string $id
     * @return array
     */
    public function project_read($id)
    {
        return ProjectCommands::readProject($id);
    }

    public function set_project($projectCode)
    {
        $projectModel = ProjectModel::getByProjectCode($projectCode);
        $projectId = $projectModel->id->asString();
        $user = new UserModel($this->userId);

        if ($user->isMemberOfProject($projectId)) {
            $this->app["session"]->set("projectId", $projectId);

            $projectModel->id = $projectId;

            return $projectModel;
        }

        throw new UserUnauthorizedException("User $this->userId is not a member of project $projectCode");
    }

    public function project_settings()
    {
        return ProjectSettingsDto::encode($this->projectId, $this->userId);
    }

    /**
     * Updates the ProjectSettingsModel which are settings accessible only to site administrators
     * @param SmsSettings[] $smsSettingsArray
     * @param EmailSettings[] $emailSettingsArray
     * @return string $result id to the projectSettingsModel
     */
    public function project_updateSettings($smsSettingsArray, $emailSettingsArray)
    {
        return ProjectCommands::updateProjectSettings($this->projectId, $smsSettingsArray, $emailSettingsArray);
    }

    public function project_readSettings()
    {
        return ProjectCommands::readProjectSettings($this->projectId);
    }

    public function project_pageDto()
    {
        return ProjectPageDto::encode($this->projectId, $this->userId);
    }

    /*
     * --------------------------------------------------------------- LANGUAGEFORGE ----------------------------------------------------------------
     */

    // ---------------------------------------------------------------
    // PROJECT API
    // ---------------------------------------------------------------
    /**
     * Update a lexicon Project
     *
     * @param array $settings
     * @return string $projectId of written object
     */
    public function lex_project_update($settings)
    {
        return LexProjectCommands::updateProject($this->projectId, $this->userId, $settings);
    }

    public function lex_baseViewDto()
    {
        return LexBaseViewDto::encode($this->projectId, $this->userId);
    }

    public function lex_projectDto()
    {
        return LexProjectDto::encode($this->projectId);
    }

    public function lex_stats()
    {
        $projectModel = ProjectModel::getById($this->projectId);
        $user = new UserModel($this->userId);

        if ($user->isMemberOfProject($this->projectId)) {
            return LexDbeDto::encode($projectModel->id->asString(), $this->userId, 1);
        }

        throw new UserUnauthorizedException("User $this->userId is not a member of project $projectModel->projectCode");
    }

    public function lex_dbeDtoFull($browserId, $offset)
    {
        $sessionLabel = "lexDbeFetch_" . $browserId;
        $this->app["session"]->set($sessionLabel, time());

        return LexDbeDto::encode($this->projectId, $this->userId, null, $offset);
    }

    public function lex_dbeDtoUpdatesOnly($browserId, $lastFetchTime = null)
    {
        $sessionLabel = "lexDbeFetch_" . $browserId;
        if ($lastFetchTime == null) {
            $lastFetchTime = $this->app["session"]->get($sessionLabel);
        }
        $this->app["session"]->set($sessionLabel, time());
        if ($lastFetchTime) {
            $lastFetchTime = $lastFetchTime - 5; // 5 second buffer

            return LexDbeDto::encode($this->projectId, $this->userId, $lastFetchTime);
        } else {
            return LexDbeDto::encode($this->projectId, $this->userId);
        }
    }

    public function lex_configuration_update($config, $optionlists)
    {
        if (!LexProjectCommands::updateConfig($this->projectId, $config)) {
            return false;
        }
        foreach ($optionlists as $optionlist) {
            LexOptionListCommands::updateList($this->projectId, $optionlist);
        }
        return true;
    }

    public function lex_project_removeMediaFile($mediaType, $fileName)
    {
        return LexUploadCommands::deleteMediaFile($this->projectId, $mediaType, $fileName);
    }

    public function lex_entry_read($entryId)
    {
        return LexEntryCommands::readEntry($this->projectId, $entryId);
    }

    public function lex_entry_update($model)
    {
        return LexEntryCommands::updateEntry($this->projectId, $model, $this->userId);
    }

    public function lex_entry_remove($entryId)
    {
        return LexEntryCommands::removeEntry($this->projectId, $entryId, $this->userId);
    }

    public function lex_comment_update($data)
    {
        return LexCommentCommands::updateComment($this->projectId, $this->userId, $data);
    }

    public function lex_commentReply_update($commentId, $data)
    {
        return LexCommentCommands::updateReply($this->projectId, $this->userId, $commentId, $data);
    }

    public function lex_comment_delete($commentId)
    {
        return LexCommentCommands::deleteComment($this->projectId, $this->userId, $commentId);
    }

    public function lex_commentReply_delete($commentId, $replyId)
    {
        return LexCommentCommands::deleteReply($this->projectId, $this->userId, $commentId, $replyId);
    }

    public function lex_comment_plusOne($commentId)
    {
        return LexCommentCommands::plusOneComment($this->projectId, $this->userId, $commentId);
    }

    public function lex_comment_updateStatus($commentId, $status)
    {
        return LexCommentCommands::updateCommentStatus($this->projectId, $commentId, $status);
    }

    public function lex_optionlists_update($params)
    {
        return LexOptionListCommands::updateList($this->projectId, $params);
    }

    public function lex_uploadAudioFile($tmpFilePath)
    {
        $response = LexUploadCommands::uploadAudioFile($this->projectId, $tmpFilePath);
        return JsonEncoder::encode($response);
    }

    public function lex_uploadImageFile($tmpFilePath)
    {
        $response = LexUploadCommands::uploadImageFile($this->projectId, $tmpFilePath);
        return JsonEncoder::encode($response);
    }

    public function lex_upload_importProjectZip($tmpFilePath)
    {
        $response = LexUploadCommands::importProjectZip($this->projectId, $tmpFilePath);
        return JsonEncoder::encode($response);
    }

    public function lex_upload_importLift($tmpFilePath)
    {
        $response = LexUploadCommands::importLiftFile($this->projectId, $tmpFilePath);
        return JsonEncoder::encode($response);
    }

    // ---------------------------------------------------------------
    // Send and Receive API
    // ---------------------------------------------------------------
    public function sendReceive_getUserProjects($username, $password)
    {
        return SendReceiveCommands::getUserProjects($username, $password);
    }

    public function sendReceive_updateSRProject($srProject)
    {
        return SendReceiveCommands::updateSRProject($this->projectId, $srProject);
    }

    public function sendReceive_receiveProject()
    {
        SendReceiveCommands::queueProjectForSync($this->projectId);
        return true;
    }

    public function sendReceive_getProjectStatus()
    {
        return SendReceiveCommands::getProjectStatus($this->projectId);
    }

    // TODO: Are we ever going to use these two functions? Evaluate, and remove if not needed. 2022-08 RM
    public function sendReceive_notification_receiveRequest($projectCode)
    {
        return SendReceiveCommands::notificationReceiveRequest($projectCode);
    }

    public function sendReceive_notification_sendRequest($projectCode)
    {
        return SendReceiveCommands::notificationSendRequest($projectCode);
    }

    // -------------------------------- Project Management App Api ----------------------------------
    public function project_management_dto()
    {
        return ProjectManagementDto::encode($this->projectId);
    }

    // ----------------------------------- Language Depot Api -------------------------------------
    public function get_ldapi_username()
    {
        if ($this->userId) {
            $user = new UserModel($this->userId);
        } else {
            return "";
        }
        if ($user->languageDepotUsername) {
            return $user->languageDepotUsername;
        }
        if ($user->email) {
            $ldUsers = LdapiCommands::searchUsers("", $user->email);
            if ($ldUsers && count($ldUsers) == 1) {
                $username = $ldUsers[0]["username"];
                if ($username) {
                    $user->languageDepotUsername = $username;
                    $user->write();
                    return $username;
                }
            }
        }
        return "";
    }

    public function ldapi_check_user_password($username, $password)
    {
        return LdapiCommands::checkUserPassword($this->get_ldapi_username(), $username, $password);
    }

    public function ldapi_get_all_users()
    {
        return LdapiCommands::getAllUsers($this->get_ldapi_username());
    }

    public function ldapi_search_users($searchText)
    {
        return LdapiCommands::searchUsers($this->get_ldapi_username(), $searchText);
    }

    public function ldapi_get_user($username)
    {
        return LdapiCommands::getUser($this->get_ldapi_username(), $username);
    }

    public function ldapi_update_user($username, $userdata)
    {
        return LdapiCommands::updateUser($this->get_ldapi_username(), $username, $userdata);
    }

    public function ldapi_get_all_projects()
    {
        return LdapiCommands::getAllProjects($this->get_ldapi_username());
    }

    public function ldapi_get_project($projectCode)
    {
        return LdapiCommands::getProject($this->get_ldapi_username(), $projectCode);
    }

    public function ldapi_get_projects_for_user($username)
    {
        return LdapiCommands::getProjectsForUser($this->get_ldapi_username(), $username);
    }

    public function ldapi_user_is_manager_of_project($username, $projectCode)
    {
        return LdapiCommands::isUserManagerOfProject($this->get_ldapi_username(), $username, $projectCode);
    }

    public function ldapi_project_updateUserRole($projectCode, $username, $role)
    {
        return LdapiCommands::updateUserRoleInProject($this->get_ldapi_username(), $projectCode, $username, $role);
    }

    public function ldapi_project_removeUser($projectCode, $username)
    {
        return LdapiCommands::removeUserFromProject($this->get_ldapi_username(), $projectCode, $username);
    }

    public function ldapi_get_all_roles()
    {
        return LdapiCommands::getAllRoles();
    }

    // ---------------------------------------------------------------
    // Private Utility Functions
    // ---------------------------------------------------------------
    private static function isAnonymousMethod($methodName)
    {
        $methods = [
            "get_captcha_data",
            "reset_password",
            "sendReceive_getUserProjects",
            "user_register",
            "user_register_oauth",
            "user_calculate_username",
            "check_unique_identity",
            "session_getSessionData",
            "set_project",
        ];
        return in_array($methodName, $methods);
    }

    public function checkPermissions($methodName)
    {
        if (!self::isAnonymousMethod($methodName)) {
            if (!$this->userId) {
                throw new UserNotAuthenticatedException("Your session has timed out.  Please login again.");
            }
            try {
                $projectModel = ProjectModel::getById($this->projectId);
            } catch (\Exception $e) {
                $projectModel = null;
            }
            $rightsHelper = new RightsHelper($this->userId, $projectModel);
            if (!$rightsHelper->userCanAccessMethod($methodName)) {
                throw new UserUnauthorizedException("Insufficient privileges accessing API method '$methodName'");
            }
        }
    }

    public function checkPermissionsWithParams($methodName, $params = null)
    {
        if (!self::isAnonymousMethod($methodName)) {
            if (!$this->userId) {
                throw new UserNotAuthenticatedException("Your session has timed out.  Please login again.");
            }
            try {
                $projectModel = ProjectModel::getById($this->projectId);
            } catch (\Exception $e) {
                $projectModel = null;
            }
            $rightsHelper = new RightsHelper($this->userId, $projectModel);
            if (!$rightsHelper->userCanAccessMethodWithParams($methodName, $params)) {
                throw new UserUnauthorizedException("Insufficient privileges accessing API method '$methodName'");
            }
        }
    }

    public function update_last_activity($newtime = null)
    {
        if (is_null($newtime)) {
            // Default to current time
            $newtime = time();
        }
        $this->app["session"]->set("last_activity", $newtime);
    }
}
