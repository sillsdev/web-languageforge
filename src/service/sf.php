<?php

use libraries\scriptureforge\sfchecks\Email;
use libraries\scriptureforge\sfchecks\Communicate;
use libraries\scriptureforge\sfchecks\ParatextExport;
use libraries\shared\palaso\exceptions\UserNotAuthenticatedException;
use libraries\shared\palaso\exceptions\UserUnauthorizedException;
use libraries\shared\palaso\CodeGuard;
use libraries\shared\palaso\JsonRpcServer;
use libraries\shared\Website;
use models\languageforge\lexicon\commands\LexCommentCommands;
use models\languageforge\lexicon\commands\LexEntryCommands;
use models\languageforge\lexicon\commands\LexProjectCommands;
use models\languageforge\lexicon\dto\LexBaseViewDto;
use models\languageforge\lexicon\dto\LexDbeDto;
use models\languageforge\lexicon\dto\LexManageUsersDto;
use models\languageforge\lexicon\dto\LexProjectDto;
use models\scriptureforge\sfchecks\commands\SfchecksProjectCommands;
use models\scriptureforge\dto\ProjectSettingsDto;
use models\shared\dto\ActivityListDto;
use models\shared\dto\ProjectListDto;
use models\shared\dto\RightsHelper;
use models\shared\dto\UserProfileDto;
use models\shared\rights\Domain;
use models\shared\rights\Operation;
use models\shared\rights\ProjectRoles;
use models\commands\ActivityCommands;
use models\commands\MessageCommands;
use models\commands\ProjectCommands;
use models\commands\SessionCommands;
use models\commands\QuestionCommands;
use models\commands\QuestionTemplateCommands;
use models\commands\TextCommands;
use models\commands\UserCommands;
use models\mapper\Id;
use models\mapper\JsonDecoder;
use models\mapper\JsonEncoder;
use models\mapper\MongoStore;
use models\sms\SmsSettings;
use models\AnswerModel;
use models\ProjectModel;
use models\ProjectSettingsModel;
use models\QuestionModel;
use models\UnreadMessageModel;
use models\UserModel;
use models\UserProfileModel;

require_once(APPPATH . 'vendor/autoload.php');
require_once(APPPATH . 'config/sf_config.php');
require_once(APPPATH . 'models/ProjectModel.php');
require_once(APPPATH . 'models/QuestionModel.php');
require_once(APPPATH . 'models/TextModel.php');
require_once(APPPATH . 'models/UserModel.php');

class Sf
{
	/**
	 * @var string
	 */
	private $_userId;
	private $_projectId;
	
	private $_controller;
	
	private $_website;
	
	public function __construct($controller) {
		$this->_userId = (string)$controller->session->userdata('user_id');
		$this->_projectId = (string)$controller->session->userdata('projectId');
		$this->_controller = $controller;
		$this->_website = Website::get();

		// "Kick" session every time we use an API call, so it won't time out
		$this->update_last_activity();

		// TODO put in the LanguageForge style error handler for logging / jsonrpc return formatting etc. CP 2013-07
		ini_set('display_errors', 0);
		
	}
	
	//---------------------------------------------------------------
	// IMPORTANT NOTE TO THE DEVELOPERS 
	//---------------------------------------------------------------
	// When adding a new api method, also add your method name and appropriate RightsHelper statement as required by 
	// the method's context (project context or site context) to the RightsHelper::userCanAccessMethod() method 
	// FYI userCanAccessMethod() is a whitelist.  Anything not explicitly listed is denied access
	//
	// If an api method is ever renamed, remember to update the name in this method as well
	//---------------------------------------------------------------
	

	/*
	 * 
 ____               ___       ___                                   
/\  _`\            /\_ \     /\_ \                                  
\ \ \L\ \     __   \//\ \    \//\ \      ___    __  __  __    ____  
 \ \  _ <'  /'__`\   \ \ \     \ \ \    / __`\ /\ \/\ \/\ \  /',__\ 
  \ \ \L\ \/\  __/    \_\ \_    \_\ \_ /\ \L\ \\ \ \_/ \_/ \/\__, `\
   \ \____/\ \____\   /\____\   /\____\\ \____/ \ \___x___/'\/\____/
    \/___/  \/____/   \/____/   \/____/ \/___/   \/__//__/   \/___/ 
	
	 */
	
	//---------------------------------------------------------------
	// USER API
	//---------------------------------------------------------------
	
	/**
	 * Read a user from the given $id
	 * @param string $id
	 * @return array
	 */
	public function user_read($id) {
		return UserCommands::readUser($id);
	}
	
	/**
	 * Read the user profile from $id
	 * @return UserProfileDto
	 */
	public function user_readProfile() {
		return UserProfileDto::encode($this->_userId, $this->_website);
	}
	
	/**
	 * Create/Update a User
	 * @param UserModel $json
	 * @return string Id of written object
	 */
	public function user_update($params) {
		return UserCommands::updateUser($params);
	}

	/**
	 * Create/Update a User Profile
	 * @param UserProfileModel $json
	 * @return string Id of written object
	 */
	public function user_updateProfile($params) {
		return UserCommands::updateUserProfile($params, $this->_userId);
	}

	/**
	 * Delete users
	 * @param array<string> $userIds
	 * @return int Count of deleted users
	 */
	public function user_delete($userIds) {
		return UserCommands::deleteUsers($userIds);
	}
	
	/**
	 * @param string $userName
	 * @return CreateSimpleDto
	 */
	public function user_createSimple($userName) {
		return UserCommands::createSimple($userName, $this->_projectId, $this->_userId, $this->_website);
	}
	
	// TODO Pretty sure this is going to want some paging params
	/**
	 * @return \models\UserListModel
	 */
	public function user_list() {
		return UserCommands::listUsers();
	}
	
	public function user_typeahead($term, $projectIdToExclude = '') {
		return UserCommands::userTypeaheadList($term, $projectIdToExclude);
	}

	public function user_typeaheadExclusive($term, $projectIdToExclude = '') {
		$projectIdToExclude = empty($projectIdToExclude) ? $this->_projectId : $projectIdToExclude;
		return UserCommands::userTypeaheadList($term, $projectIdToExclude);
	}

	public function change_password($userId, $newPassword) {
		return UserCommands::changePassword($userId, $newPassword, $this->_userId);
	}
	
	public function identity_check($username, $email) {
		// intentionally we have no security here: people can see what users exist by trial and error
		$identityCheck = UserCommands::checkIdentity($username, $email, $this->_website);
		return JsonEncoder::encode($identityCheck);
	}
	
	public function user_activate($username, $password, $email) {
		return UserCommands::activate($username, $password, $email, $this->_website, $this->_controller);
	}
	
	/**
	 * Register a new user with password and optionally add them to a project if allowed by permissions
	 * @param array $params
	 * @return string Id of written object
	 */
	public function user_register($params) {
		return UserCommands::register($params, $this->_controller->session->userdata('captcha_info'), $this->_website);
	}
	
	public function user_create($params) {
		return UserCommands::createUser($params, $this->_website);
	}
	
	public function get_captcha_src() {
		return UserCommands::getCaptchaSrc($this->_controller);
	}
	
	public function user_readForRegistration($validationKey) {
		return UserCommands::readForRegistration($validationKey);
	}
	
	public function user_updateFromRegistration($validationKey, $params) {
		return UserCommands::updateFromRegistration($validationKey, $params, $this->_website);
	}
	
	public function user_sendInvite($toEmail) {
		return UserCommands::sendInvite($this->_projectId, $this->_userId, $this->_website, $toEmail);
	}
	
	
	
	
	//---------------------------------------------------------------
	// GENERAL PROJECT API
	//---------------------------------------------------------------
	
	/**
	 * 
	 * @param string $projectName
	 * @param string $projectCode
	 * @param string $appName
	 * @return string - projectId
	 */
	public function project_create($projectName, $projectCode, $appName) {
		return ProjectCommands::createProject($projectName, $projectCode, $appName, $this->_userId, $this->_website);
	}
	
	/**
	 * Archive projects
	 * @param array<string> $projectIds
	 * @return int Count of archived projects
	 */
	public function project_archive($projectIds) {
		return ProjectCommands::archiveProjects($projectIds);
	}
	
	public function project_archivedList() {
		return ProjectListDto::encode($this->_userId, $this->_website, true);
	}
	
	/**
	 * Publish projects
	 * @param array<string> $projectIds
	 * @return int Count of published projects
	 */
	public function project_publish($projectIds) {
		return ProjectCommands::publishProjects($projectIds);
	}
	
	// TODO Pretty sure this is going to want some paging params
	public function project_list() {
		return ProjectCommands::listProjects();
	}
	
	public function project_list_dto() {
		return ProjectListDto::encode($this->_userId, $this->_website);
	}
	
	public function project_joinProject($projectId, $role) {
		return ProjectCommands::updateUserRole($projectId, $this->_userId, $role);
	}
	
	
	public function project_usersDto() {
		return ProjectCommands::usersDto($this->_projectId);
	}


	//---------------------------------------------------------------
	// SESSION API
	//---------------------------------------------------------------

	public function session_getSessionData() {
		return SessionCommands::getSessionData($this->_projectId, $this->_userId, $this->_website);
	}
	
	
	public function projectcode_exists($code) {
		return ProjectCommands::projectCodeExists($code);
	}
	
	
	//---------------------------------------------------------------
	// Activity Log
	//---------------------------------------------------------------

	public function activity_list_dto() {
		return \models\shared\dto\ActivityListDto::getActivityForUser($this->_website->domain, $this->_userId);
	}
	
	
	
	/*
	 *  ____   ___  ____  __  ____  ____  _  _  ____  ____    ____  __  ____   ___  ____ 
	 * / ___) / __)(  _ \(  )(  _ \(_  _)/ )( \(  _ \(  __)  (  __)/  \(  _ \ / __)(  __)
	 * \___ \( (__  )   / )(  ) __/  )(  ) \/ ( )   / ) _)    ) _)(  O ))   /( (_ \ ) _) 
	 * (____/ \___)(__\_)(__)(__)   (__) \____/(__\_)(____)  (__)  \__/(__\_) \___/(____)
	 * 
	 */
	
	//---------------------------------------------------------------
	// SCRIPTUREFORGE PROJECT API
	//---------------------------------------------------------------

	/**
	 * Create/Update a Project
	 * @param array $object
	 * @return string Id of written object
	 */
	public function project_update($settings) {
		return SfchecksProjectCommands::updateProject($this->_projectId, $this->_userId, $settings);
	}

	public function project_updateUserRole($userId, $role) {
		return ProjectCommands::updateUserRole($this->_projectId, $userId, $role);
	}

	
	// REVIEW: should this be part of the general project API ?
	public function project_removeUsers($userIds) {
		return ProjectCommands::removeUsers($this->_projectId, $userIds);
	}
	
	

	/**
	 * Read a project from the given $id
	 * @param string $id
	 */
	public function project_read($id) {
		return ProjectCommands::readProject($id);
	}
	
	public function project_settings() {
		return ProjectSettingsDto::encode($this->_projectId, $this->_userId);
	}
	
	public function project_updateSettings($smsSettingsArray, $emailSettingsArray) {
		return ProjectCommands::updateProjectSettings($this->_projectId, $smsSettingsArray, $emailSettingsArray);
	}
	
	public function project_readSettings() {
		return ProjectCommands::readProjectSettings($this->_projectId);
	}
	
	public function project_pageDto() {
		return \models\scriptureforge\dto\ProjectPageDto::encode($this->_projectId, $this->_userId);
	}

	
	//---------------------------------------------------------------
	// MESSAGE API
	//---------------------------------------------------------------
	public function message_markRead($messageId) {
		return MessageCommands::markMessageRead($this->_projectId, $messageId, $this->_userId);
	}
	
	public function message_send($userIds, $subject, $emailTemplate, $smsTemplate) {
		return MessageCommands::sendMessage($this->_projectId, $userIds, $subject, $emailTemplate, $smsTemplate);
	}
	
	
	//---------------------------------------------------------------
	// TEXT API
	//---------------------------------------------------------------
	
	public function text_update($object) {
		return TextCommands::updateText($this->_projectId, $object);
	}
	
	public function text_read($textId) {
		return TextCommands::readText($this->_projectId, $textId);
	}
	
	public function text_archive($textIds) {
		return TextCommands::archiveTexts($this->_projectId, $textIds);
	}
	
	public function text_publish($textIds) {
		return TextCommands::publishTexts($this->_projectId, $textIds);
	}
	
	public function text_list_dto() {
		return \models\scriptureforge\dto\TextListDto::encode($this->_projectId, $this->_userId);
	}

	public function text_settings_dto($textId) {
		return \models\scriptureforge\dto\TextSettingsDto::encode($this->_projectId, $textId, $this->_userId);
	}
	
	public function text_exportComments($params) {
		return ParatextExport::exportCommentsForText($this->_projectId, $params['textId'], $params);
	}
	
	//---------------------------------------------------------------
	// Question / Answer / Comment API
	//---------------------------------------------------------------
	
	public function question_update($object) {
		return QuestionCommands::updateQuestion($this->_projectId, $object);
	}
	
	public function question_read($questionId) {
		return QuestionCommands::readQuestion($this->_projectId, $questionId);
	}
	
	public function question_archive($questionIds) {
		return QuestionCommands::archiveQuestions($this->_projectId, $questionIds);
	}
	
	public function question_publish($questionIds) {
		return QuestionCommands::publishQuestions($this->_projectId, $questionIds);
	}
	
	public function question_update_answer($questionId, $answer) {
		return QuestionCommands::updateAnswer($this->_projectId, $questionId, $answer, $this->_userId);
	}
	
	public function question_update_answerExportFlag($questionId, $answerId, $isToBeExported) {
		return QuestionCommands::updateAnswerExportFlag($this->_projectId, $questionId, $answerId, $isToBeExported);
	}
	
	public function question_update_answerTags($questionId, $answerId, $tags) {
		return QuestionCommands::updateAnswerTags($this->_projectId, $questionId, $answerId, $tags);
	}
	
	public function question_remove_answer($questionId, $answerId) {
		return QuestionCommands::removeAnswer($this->_projectId, $questionId, $answerId);
	}
	
	public function question_update_comment($questionId, $answerId, $comment) {
		return QuestionCommands::updateComment($this->_projectId, $questionId, $answerId, $comment, $this->_userId);
	}
	
	public function question_remove_comment($questionId, $answerId, $commentId) {
		return QuestionCommands::removeComment($this->_projectId, $questionId, $answerId, $commentId);
	}
	
	public function question_comment_dto($questionId) {
		return \models\scriptureforge\dto\QuestionCommentDto::encode($this->_projectId, $questionId, $this->_userId);
	}
	
	public function question_list_dto($textId) {
		return \models\scriptureforge\dto\QuestionListDto::encode($this->_projectId, $textId, $this->_userId);
	}
	
	public function answer_vote_up($questionId, $answerId) {
		return QuestionCommands::voteUp($this->_userId, $this->_projectId, $questionId, $answerId);
	}
	
	public function answer_vote_down($questionId, $answerId) {
		return QuestionCommands::voteDown($this->_userId, $this->_projectId, $questionId, $answerId);
	}

	//---------------------------------------------------------------
	// QuestionTemplates API
	//---------------------------------------------------------------

	public function questionTemplate_update($model) {
		return QuestionTemplateCommands::updateTemplate($this->_projectId, $model);
	}

	public function questionTemplate_read($id) {
		return QuestionTemplateCommands::readTemplate($this->_projectId, $id);
	}

	public function questionTemplate_delete($questionTemplateIds) {
		return QuestionTemplateCommands::deleteQuestionTemplates($this->_projectId, $questionTemplateIds);
	}

	public function questionTemplate_list() {
		return QuestionTemplateCommands::listTemplates($this->_projectId);
	}
	
	
	
	
	
	/*
	 * .____                                                        ___________                         
	 * |    |   _____    ____    ____  __ _______     ____   ____   \_   _____/__________  ____   ____  
	 * |    |   \__  \  /    \  / ___\|  |  \__  \   / ___\_/ __ \   |    __)/  _ \_  __ \/ ___\_/ __ \ 
	 * |    |___ / __ \|   |  \/ /_/  >  |  // __ \_/ /_/  >  ___/   |     \(  <_> )  | \/ /_/  >  ___/ 
	 * |_______ (____  /___|  /\___  /|____/(____  /\___  / \___  >  \___  / \____/|__|  \___  / \___  >
	 *         \/    \/     \//_____/            \//_____/      \/       \/             /_____/      \/ 
	 * 
	 */
	
	//---------------------------------------------------------------
	// LANGUAGEFORGE PROJECT API
	//---------------------------------------------------------------
	
	public function lex_baseViewDto() {
		return LexBaseViewDto::encode($this->_projectId, $this->_userId);
	}
	
	public function lex_projectDto() {
		return LexProjectDto::encode($this->_projectId, $this->_userId);
	}

    public function lex_dbeDtoFull($browserId) {
        $sessionLabel = 'lexDbeFetch_' . $browserId;
        $this->_controller->session->set_userdata($sessionLabel, time());
        return LexDbeDto::encode($this->_projectId);
    }
    public function lex_dbeDtoUpdatesOnly($browserId) {
        $sessionLabel = 'lexDbeFetch_' . $browserId;
        $lastFetchTime = $this->_controller->session->userdata($sessionLabel);
        $this->_controller->session->set_userdata($sessionLabel, time());
        if ($lastFetchTime) {
            $lastFetchTime = $lastFetchTime - 5;  // 5 second buffer
            return LexDbeDto::encode($this->_projectId, $lastFetchTime);
        } else {
            return LexDbeDto::encode($this->_projectId);
        }
    }
	
	public function lex_configuration_update($config) {
		return LexProjectCommands::updateConfig($this->_projectId, $config);
	}
	
	public function lex_import_lift($import) {
		return LexProjectCommands::importLift($this->_projectId, $import);
	}
	
	public function lex_project_update($projectJson) {
		return LexProjectCommands::updateProject($this->_projectId, $this->_userId, $projectJson);
	}
	
	public function lex_entry_read($entryId) {
		return LexEntryCommands::readEntry($this->_projectId, $entryId);
	}
	
	public function lex_entry_update($model) {
		return LexEntryCommands::updateEntry($this->_projectId, $model, $this->_userId);
	}
	
	public function lex_entry_remove($entryId) {
		return LexEntryCommands::removeEntry($this->_projectId, $entryId);
	}
	
	public function lex_entry_updateComment($data) {
		return LexCommentCommands::updateComment($this->_projectId, $this->_userId, $data);
	}

    public function lex_entry_updateReply($commentId, $data) {
        return LexCommentCommands::updateReply($this->_projectId, $this->_userId, $commentId, $params);
    }

    public function lex_entry_deleteComment($commentId) {
        return LexCommentCommands::deleteComment($this->_projectId, $this->_userId, $commentId);
    }

    public function lex_entry_deleteReply($commentId, $replyId) {
        return LexCommentCommands::deleteReply($this->_projectId, $this->_userId, $commentId, $replyId);
    }
	
	
		
	
	
	
	
	
	
	
	
	//---------------------------------------------------------------
	// Private Utility Functions
	//---------------------------------------------------------------

	private static function isAnonymousMethod($methodName) {
		$methods = array(
				'identity_check',
				'user_activate',
				'user_register',
				'get_captcha_src',
				'user_readForRegistration',
				'user_updateFromRegistration'
		);
		return in_array($methodName, $methods);
	}
	
	public function checkPermissions($methodName, $params) {

		if (!self::isAnonymousMethod($methodName)) {
			if (!$this->_userId) {
				throw new UserNotAuthenticatedException("Your session has timed out.  Please login again.");
			}
			try {
				$projectModel = ProjectModel::getById($this->_projectId);
			} catch (\Exception $e) {
				$projectModel = null;
			}
			$rightsHelper = new RightsHelper($this->_userId, $projectModel, $this->_website);
			if (!$rightsHelper->userCanAccessMethod($methodName, $params)) {
				throw new UserUnauthorizedException("Insufficient privileges accessing API method '$methodName'");
			}
		}
	}

	public function update_last_activity($newtime = NULL) {
		if (is_null($newtime)) {
			// Default to current time
			$newtime = time();
		}
		$this->_controller->session->set_userdata('last_activity', $newtime);
	}
	
}

?>
