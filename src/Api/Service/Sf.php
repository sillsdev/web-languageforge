<?php

namespace Api\Service;

use Api\Library\Shared\Palaso\Exception\UserNotAuthenticatedException;
use Api\Library\Shared\Palaso\Exception\UserUnauthorizedException;
use Api\Library\Shared\SilexSessionHelper;
use Api\Library\Shared\Website;
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

require_once APPPATH . 'vendor/autoload.php';

class Sf
{
    public function __construct(Application $app)
    {
        $this->app = $app;
        $this->website = Website::get();
        $this->userId = SilexSessionHelper::getUserId($app);
        $this->projectId = SilexSessionHelper::getProjectId($app, $this->website);

        // "Kick" session every time we use an API call, so it won't time out
        $this->update_last_activity();

        // TODO put in the LanguageForge style error handler for logging / jsonrpc return formatting etc. CP 2013-07
        ini_set('display_errors', 0);
    }

    /** @var Application */
    private $app;

    /** @var Website */
    private $website;

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
        return UserProfileDto::encode($this->userId, $this->website);
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
        return UserCommands::updateUser($params, $this->website);
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
        $result = UserCommands::updateUserProfile($params, $this->userId, $this->website);
        if ($result == 'login') {
            // Username changed
            $this->app['session']->getFlashBag()->add('infoMessage', 'Username changed. Please login.');
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
        return UserCommands::createSimple($username, $this->projectId, $this->userId, $this->website);
    }

    // TODO Pretty sure this is going to want some paging params
    /**
     * @return UserListModel
     */
    public function user_list()
    {
        return UserCommands::listUsers();
    }

    public function user_typeahead($term, $projectIdToExclude = '')
    {
        return UserCommands::userTypeaheadList($term, $projectIdToExclude, $this->website);
    }

    public function user_typeaheadExclusive($term, $projectIdToExclude = '')
    {
        $projectIdToExclude = empty($projectIdToExclude) ? $this->projectId : $projectIdToExclude;
        return UserCommands::userTypeaheadList($term, $projectIdToExclude, $this->website);
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
        $result = UserCommands::register($params, $this->website, $this->app['session']->get('captcha_info'));
        if ($result == 'login') {
            Auth::login($this->app, UserCommands::sanitizeInput($params['email']), $params['password']);
        }
        return $result;
    }

    public function user_register_oauth($params)
    {
        $result = UserCommands::registerOAuthUser($params, $this->website);
        if ($result == 'login') {
            Auth::loginWithoutPassword($this->app, UserCommands::sanitizeInput($params['username']));
        }
        return $result;
    }

    public function user_calculate_username($usernameBase)
    {
        return UserCommands::calculateUniqueUsernameFromString($usernameBase);
    }

    public function user_create($params)
    {
        return UserCommands::createUser($params, $this->website);
    }

    public function get_captcha_data() {
        return UserCommands::getCaptchaData($this->app['session']);
    }

    public function user_sendInvite($toEmail, $lexRoleKey)
    {
        return UserCommands::sendInvite($this->projectId, $this->userId, $this->website, $toEmail, null, $lexRoleKey);
    }

    public function project_insights_csv()
    {
        return ProjectInsightsDto::csvInsights($this->website);
    }

    // ---------------------------------------------------------------
    // GENERAL PROJECT API
    // ---------------------------------------------------------------

    public function project_sendJoinRequest($projectID)
    {
        return UserCommands::sendJoinRequest($projectID, $this->userId, $this->website);
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
        return ProjectCommands::createProject($projectName, $projectCode, $appName, $this->userId, $this->website, $srProject);
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
        $this->app['session']->set('projectId', $projectId);
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
        if (!$projectId) return false;

        ProjectCommands::updateUserRole($projectId, $this->userId, $role);
        $this->app['session']->set('projectId', $projectId);
        return $projectId;
    }

    /**
     * Clear out the session projectId and archive project
     *
     * @return string
     */

    public function project_archive()
    {
        $this->app['session']->set('projectId', "");
        return ProjectCommands::archiveProject($this->projectId, $this->userId);
    }

    public function project_archivedList()
    {
        return ProjectListDto::encode($this->userId, $this->website, true);
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
        return ProjectListDto::encode($this->userId, $this->website);
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
        $this->app['session']->set('projectId', "");
        return ProjectCommands::deleteProjects($projectIds, $this->userId);
    }

    // ---------------------------------------------------------------
    // SESSION API
    // ---------------------------------------------------------------
    public function session_getSessionData()
    {
        return SessionCommands::getSessionData($this->projectId, $this->userId, $this->website);
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
        return ActivityListDto::getActivityTypes($this->website);
    }

    public function activity_list_dto($filterParams = [])
    {
        return ActivityListDto::getActivityForUser($this->website->domain, $this->userId, $filterParams);
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

    public function lex_dbeDtoFull($browserId, $offset)
    {
        $sessionLabel = 'lexDbeFetch_' . $browserId;
        $this->app['session']->set($sessionLabel, time());

        return LexDbeDto::encode($this->projectId, $this->userId, null, $offset);
    }

    public function lex_dbeDtoUpdatesOnly($browserId, $lastFetchTime = null)
    {
        $sessionLabel = 'lexDbeFetch_' . $browserId;
        if ($lastFetchTime == null) {
            $lastFetchTime = $this->app['session']->get($sessionLabel);
        }
        $this->app['session']->set($sessionLabel, time());
        if ($lastFetchTime) {
            $lastFetchTime = $lastFetchTime - 5; // 5 second buffer

            return LexDbeDto::encode($this->projectId, $this->userId, $lastFetchTime);
        } else {
            return LexDbeDto::encode($this->projectId, $this->userId);
        }
    }

    public function lex_configuration_update($config, $optionlists)
    {
        if (!LexProjectCommands::updateConfig($this->projectId, $config)) return false;
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
        return LexCommentCommands::updateComment($this->projectId, $this->userId, $this->website, $data);
    }

    public function lex_commentReply_update($commentId, $data)
    {
        return LexCommentCommands::updateReply($this->projectId, $this->userId, $this->website, $commentId, $data);
    }

    public function lex_comment_delete($commentId)
    {
        return LexCommentCommands::deleteComment($this->projectId, $this->userId, $this->website, $commentId);
    }

    public function lex_commentReply_delete($commentId, $replyId)
    {
        return LexCommentCommands::deleteReply($this->projectId, $this->userId, $this->website, $commentId, $replyId);
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

    public function lex_uploadAudioFile($mediaType, $tmpFilePath)
    {
        $response = LexUploadCommands::uploadAudioFile($this->projectId, $mediaType, $tmpFilePath);
        return JsonEncoder::encode($response);
    }

    public function lex_uploadImageFile($mediaType, $tmpFilePath)
    {
        $response = LexUploadCommands::uploadImageFile($this->projectId, $mediaType, $tmpFilePath);
        return JsonEncoder::encode($response);
    }

    public function lex_upload_importProjectZip($mediaType, $tmpFilePath)
    {
        $response = LexUploadCommands::importProjectZip($this->projectId, $mediaType, $tmpFilePath);
        return JsonEncoder::encode($response);
    }

    public function lex_upload_importLift($mediaType, $tmpFilePath)
    {
        $response = LexUploadCommands::importLiftFile($this->projectId, $mediaType, $tmpFilePath);
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
        return SendReceiveCommands::startLFMergeIfRequired($this->projectId);
    }

    public function sendReceive_commitProject()
    {
        return SendReceiveCommands::startLFMergeIfRequired($this->projectId);
    }

    public function sendReceive_getProjectStatus()
    {
        return SendReceiveCommands::getProjectStatus($this->projectId);
    }

    public function sendReceive_notification_receiveRequest($projectCode)
    {
        return SendReceiveCommands::notificationReceiveRequest($projectCode);
    }

    public function sendReceive_notification_sendRequest($projectCode)
    {
        return SendReceiveCommands::notificationSendRequest($projectCode);
    }


    // -------------------------------- Project Management App Api ----------------------------------
    public function project_management_dto() {
        return ProjectManagementDto::encode($this->projectId);
    }

    public function project_management_report_sfchecks_userEngagementReport() {
        return SfchecksReports::UserEngagementReport($this->projectId);
    }

    public function project_management_report_sfchecks_topContributorsWithTextReport() {
        return SfchecksReports::TopContributorsWithTextReport($this->projectId);
    }

    public function project_management_report_sfchecks_responsesOverTimeReport() {
        return SfchecksReports::ResponsesOverTimeReport($this->projectId);
    }

    // ---------------------------------------------------------------
    // Private Utility Functions
    // ---------------------------------------------------------------
    private static function isAnonymousMethod($methodName)
    {
        $methods = [
            'get_captcha_data',
            'reset_password',
            'sendReceive_getUserProjects',
            'sendReceive_notification_receiveRequest',
            'sendReceive_notification_sendRequest',
            'user_register',
            'user_register_oauth',
            'user_calculate_username',
            'check_unique_identity',
            'session_getSessionData'
        ];
        return in_array($methodName, $methods);
    }

    public function checkPermissions($methodName)
    {
        if (! self::isAnonymousMethod($methodName)) {
            if (! $this->userId) {
                throw new UserNotAuthenticatedException("Your session has timed out.  Please login again.");
            }
            try {
                $projectModel = ProjectModel::getById($this->projectId);
            } catch (\Exception $e) {
                $projectModel = null;
            }
            $rightsHelper = new RightsHelper($this->userId, $projectModel, $this->website);
            if (! $rightsHelper->userCanAccessMethod($methodName)) {
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
        $this->app['session']->set('last_activity', $newtime);
    }
}
