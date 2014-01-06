<?php

use models\commands\MessageCommands;

use libraries\palaso\exceptions\UserNotAuthenticatedException;
use libraries\palaso\exceptions\UserUnauthorizedException;
use libraries\palaso\CodeGuard;
use libraries\palaso\JsonRpcServer;
use libraries\sfchecks\Communicate;
use libraries\sfchecks\Email;
use models\commands\ActivityCommands;
use models\commands\ProjectCommands;
use models\commands\QuestionCommands;
use models\commands\QuestionTemplateCommands;
use models\commands\TextCommands;
use models\commands\UserCommands;
use models\dto\ActivityListDto;
use models\dto\ProjectSettingsDto;
use models\dto\RightsHelper;
use models\mapper\Id;
use models\mapper\JsonEncoder;
use models\mapper\JsonDecoder;
use models\mapper\MongoStore;
use models\rights\Domain;
use models\rights\Operation;
use models\rights\Roles;
use models\sms\SmsSettings;
use models\AnswerModel;
use models\ProjectModel;
use models\ProjectSettingsModel;
use models\QuestionModel;
use models\UnreadMessageModel;
use models\UserModel;
use models\UserProfileModel;
use models\dto\UserProfileDto;

require_once(APPPATH . 'vendor/autoload.php');

require_once(APPPATH . 'config/sf_config.php');
require_once(APPPATH . 'models/ProjectModel.php');
require_once(APPPATH . 'models/QuestionModel.php');
require_once(APPPATH . 'models/QuestionTemplateModel.php');
require_once(APPPATH . 'models/TextModel.php');
require_once(APPPATH . 'models/UserModel.php');

class Sf
{
	/**
	 * @var string
	 */
	private $_userId;
	
	private $_controller;
	
	public function __construct($controller) {
		$this->_userId = (string)$controller->session->userdata('user_id');
		$this->_controller = $controller;

		// "Kick" session every time we use an API call, so it won't time out
		$this->update_last_activity();

		// TODO put in the LanguageForge style error handler for logging / jsonrpc return formatting etc. CP 2013-07
 		ini_set('display_errors', 0);
	}
	
	//---------------------------------------------------------------
	// USER API
	//---------------------------------------------------------------
	
	/**
	 * Read a user from the given $id
	 * @param string $id
	 * @return array
	 */
	public function user_read($id) {
		return UserCommands::readUser($id, $this->_userId);
	}
	
	/**
	 * Read the user profile from $id
	 * @param string $id
	 * @return UserProfileDto
	 */
	public function user_readProfile() {
		return UserProfileDto::encode($this->_userId);
	}
	
	/**
	 * Create/Update a User
	 * @param UserModel $json
	 * @return string Id of written object
	 */
	public function user_update($params) {
		return UserCommands::updateUser($params, $this->_userId);
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
 		return UserCommands::deleteUsers($userIds, $this->_userId);
 	}

 	/**
 	 * @param string $userName
 	 * @param string $projectId
 	 * @return CreateSimpleDto
 	 */
 	public function user_createSimple($userName, $projectId) {
 		return UserCommands::createSimple($userName, $projectId, $this->_userId);
 	}
 	
 	// TODO Pretty sure this is going to want some paging params
	/**
	 * @return \models\UserListModel
	 */
	public function user_list() {
		return UserCommands::listUsers($this->_userId);
	}
	
	public function user_typeahead($term) {
		return UserCommands::userTypeaheadList($term, $this->_userId);
	}
	
	public function change_password($userId, $newPassword) {
		return UserCommands::changePassword($userId, $newPassword, $this->_userId);
	}
	
	public function username_exists($username) {
		// intentionally we have no security here: people can see what users exist by trial and error
		return UserModel::userNameExists($username);
	}
	
	/**
	 * Register a new user with password
	 * @param UserModel $json
	 * @return string Id of written object
	 */
	public function user_register($params) {
		return UserCommands::register($params, $this->_controller->session->userdata('captcha_info'), $_SERVER['HTTP_HOST']);
	}
	
	public function user_create($params) {
		return UserCommands::createUser($params, $this->_userId);
	}
	
	public function get_captcha_src() {
		return UserCommands::getCaptchaSrc($this->_controller);
	}
	
	public function user_readForRegistration($validationKey) {
		return UserCommands::readForRegistration($validationKey);
	}
	
	public function user_updateFromRegistration($validationKey, $params) {
		return UserCommands::updateFromRegistration($validationKey, $params);
	}
	
	public function user_sendInvite($toEmail, $projectId) {
		return UserCommands::sendInvite(new UserModel($this->_userId), $toEmail, $projectId, $_SERVER['HTTP_HOST']);
	}
	
	
	
	
	//---------------------------------------------------------------
	// PROJECT API
	//---------------------------------------------------------------
	
	/**
	 * Create/Update a Project
	 * @param array $object
	 * @return string Id of written object
	 */
	public function project_update($object) {
		return ProjectCommands::updateProject($object, $this->_userId);
	}

	/**
	 * Read a project from the given $id
	 * @param string $id
	 */
	public function project_read($id) {
		return ProjectCommands::readProject($id, $this->_userId);
	}
	
	/**
	 * Delete projects
	 * @param array<string> $projectIds
	 * @return int Count of deleted projects
	 */
 	public function project_delete($projectIds) {
 		return ProjectCommands::deleteProjects($projectIds, $this->_userId);
 	}

	// TODO Pretty sure this is going to want some paging params
	public function project_list() {
		return ProjectCommands::listProjects($this->_userId);
	}
	
	public function project_list_dto() {
		return \models\dto\ProjectListDto::encode($this->_userId);
	}
	
	public function project_readUser($projectId, $userId) {
		throw new \Exception("project_readUser NYI");
	}
	
	public function project_updateUserRole($projectId, $params) {
		return ProjectCommands::updateUserRole($projectId, $params, $this->_userId);
	}
	
	public function project_removeUsers($projectId, $userIds) {
		return ProjectCommands::removeUsers($projectId, $userIds, $this->_userId);
	}
	
	public function project_settings($projectId) {
		return ProjectSettingsDto::encode($projectId, $this->_userId);
	}
	
	public function project_updateSettings($projectId, $smsSettingsArray, $emailSettingsArray) {
		return ProjectCommands::updateProjectSettings($projectId, $smsSettingsArray, $emailSettingsArray, $this->_userId);
	}
	
	public function project_readSettings($projectId) {
		return ProjectCommands::readProjectSettings($projectId, $this->_userId);
	}
	
	public function project_pageDto($projectId) {
		return \models\dto\ProjectPageDto::encode($projectId, $this->_userId);
	}
	
	//---------------------------------------------------------------
	// MESSAGE API
	//---------------------------------------------------------------
	public function message_markRead($projectId, $messageId) {
		return MessageCommands::markMessageRead($projectId, $messageId, $this->_userId);
	}
	
	public function message_send($projectId, $userIds, $subject, $emailTemplate, $smsTemplate) {
		return MessageCommands::sendMessage($projectId, $userIds, $subject, $emailTemplate, $smsTemplate, $this->_userId);
	}
	
	
	//---------------------------------------------------------------
	// TEXT API
	//---------------------------------------------------------------
	
	public function text_update($projectId, $object) {
		return TextCommands::updateText($projectId, $object, $this->_userId);
	}
	
	public function text_read($projectId, $textId) {
		return TextCommands::readText($projectId, $textId, $this->_userId);
	}
	
	public function text_delete($projectId, $textIds) {
		return TextCommands::deleteTexts($projectId, $textIds, $this->_userId);
	}
	
	/* i don't think this is used anywhere - cjh
	public function text_list($projectId) {
		return TextCommands::listTexts($projectId, $this->_userId);
	}
	*/
	
	public function text_list_dto($projectId) {
		return \models\dto\TextListDto::encode($projectId, $this->_userId);
	}

	public function text_settings_dto($projectId, $textId) {
		return \models\dto\TextSettingsDto::encode($projectId, $textId, $this->_userId);
	}
	
	//---------------------------------------------------------------
	// Question / Answer / Comment API
	//---------------------------------------------------------------
	
	public function question_update($projectId, $object) {
		return QuestionCommands::updateQuestion($projectId, $object, $this->_userId);
	}
	
	public function question_read($projectId, $questionId) {
		return QuestionCommands::readQuestion($projectId, $questionId, $this->_userId);
	}
	
	public function question_delete($projectId, $questionIds) {
		return QuestionCommands::deleteQuestions($projectId, $questionIds, $this->_userId);
	}
	
	/* not used anywhere - cjh
	public function question_list($projectId, $textId) {
		return QuestionCommands::listQuestions($projectId, $textId, $this->_userId);
	}
	*/
	
	public function question_update_answer($projectId, $questionId, $answer) {
		return QuestionCommands::updateAnswer($projectId, $questionId, $answer, $this->_userId);
	}
	
	/* Note: I think this is never used - cjh (vote up/down is used instead)
	public function question_update_answer_score($projectId, $questionId, $answerId, $score) {
		return QuestionCommands::updateAnswerScore($projectId, $questionId, $answerId, $score, $this->_userId);
	}
	*/
	
	public function question_remove_answer($projectId, $questionId, $answerId) {
		return QuestionCommands::removeAnswer($projectId, $questionId, $answerId, $this->_userId);
	}
	
	public function question_update_comment($projectId, $questionId, $answerId, $comment) {
		return QuestionCommands::updateComment($projectId, $questionId, $answerId, $comment, $this->_userId);
	}
	
	public function question_remove_comment($projectId, $questionId, $answerId, $commentId) {
		return QuestionCommands::removeComment($projectId, $questionId, $answerId, $commentId, $this->_userId);
	}
	
	public function question_comment_dto($projectId, $questionId) {
		return \models\dto\QuestionCommentDto::encode($projectId, $questionId, $this->_userId);
	}
	
	public function question_list_dto($projectId, $textId) {
		return \models\dto\QuestionListDto::encode($projectId, $textId, $this->_userId);
	}
	
	public function answer_vote_up($projectId, $questionId, $answerId) {
		return QuestionCommands::voteUp($this->_userId, $projectId, $questionId, $answerId);
	}
	
	public function answer_vote_down($projectId, $questionId, $answerId) {
		return QuestionCommands::voteDown($this->_userId, $projectId, $questionId, $answerId);
	}

	//---------------------------------------------------------------
	// QuestionTemplates API
	//---------------------------------------------------------------

	public function questionTemplate_update($params) {
		return QuestionTemplateCommands::updateTemplate($params, $this->_userId);
	}

	public function questionTemplate_read($id) {
		return QuestionTemplateCommands::readTemplate($id, $this->_userId);
	}

	public function questionTemplate_delete($questionTemplateIds) {
		return QuestionTemplateCommands::deleteQuestionTemplates($questionTemplateIds, $this->_userId);
	}

	public function questionTemplate_list() {
		return QuestionTemplateCommands::listTemplates($this->_userId);
	}
	
	//---------------------------------------------------------------
	// Activity Log
	//---------------------------------------------------------------

	public function activity_list_dto() {
		return \models\dto\ActivityListDto::getActivityForUser($this->_userId);
	}
	
	
	//---------------------------------------------------------------
	// Private Utility Functions
	//---------------------------------------------------------------

	private function isAnonymousMethod($methodName) {
		$methods = array(
				'username_exists',
				'user_register',
				'get_captcha_src',
				'user_readForRegistration',
				'user_updateFromRegistration'
		);
		return in_array($methodName, $methods);
	}
	
	public function checkPermissions($methodName) {

		if (!$this->isAnonymousMethod($methodName)) {
			if (!$this->_userId) {
				throw new UserNotAuthenticatedException("Your session has timed out.  Please login again.");
			}
			if (!RightsHelper::userCanAccessMethod($methodName, $this->_userId)) {
				//throw new UserUnauthorizedException("You do not have sufficient privileges for API method '$methodName'");
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
