<?php

namespace models\shared\dto;

use models\scriptureforge\RapumaProjectModel;

use models\languageforge\lexicon\LexiconProjectModel;

use models\scriptureforge\SfchecksProjectModel;

use models\shared\rights\SiteRoles;

use models\shared\rights\Operation;

use models\shared\rights\Domain;

use models\ProjectModel;
use models\UserModel;

use models\shared\rights\ProjectRoles;

class RightsHelper
{
	/**
	 * 
	 * @var string
	 */
	private $_userId;
	
	/**
	 * 
	 * @var ProjectModel
	 */
	private $_projectModel;
	
	
	/**
	 * 
	 * @param UserModel $userModel
	 * @param ProjectModel $projectModel
	 * @return multitype:
	 */
	public static function encode($userModel, $projectModel) {
		return $projectModel->getRightsArray($userModel->id->asString());
	}
	
	/**
	 * 
	 * @param unknown $userId
	 * @param unknown $right
	 * @return boolean
	 */
	// Note: there is a bug/annoyance in PHP5 whereby you cannot have an object method and a static method named the same
	// I named this static function slightly different from the userHasSiteRight to avoid this naming conflict
	// @see http://stackoverflow.com/questions/11331616/php-is-it-possible-to-declare-a-method-static-and-nonstatic
	// @see https://bugs.php.net/bug.php?id=40837
	public static function hasSiteRight($userId, $right) {
		$userModel = new UserModel($userId);
		return SiteRoles::hasRight($userModel->role, $right);
	}
	
	/**
	 * 
	 * @param string $userId
	 * @param ProjectModel $projectModel
	 */
	public function __construct($userId, $projectModel) {
		$this->_userId = $userId;
		$this->_projectModel = $projectModel;
	}

	public function userHasSiteRight($right) {
		$userModel = new UserModel($this->_userId);
		return SiteRoles::hasRight($userModel->role, $right);
	}
	
	/**
	 * 
	 * @param int $right
	 * @return bool
	 */
	public function userHasProjectRight($right) {
		return $this->_projectModel->hasRight($this->_userId, $right);
	}
	

	/**
	 * 
	 * @param string $methodName
	 * @param array $params - parameters passed to the method
	 * @return boolean
	 */
	public function userCanAccessMethod($methodName, $params) {
		switch ($methodName) {
			
			// User Role (Project Context)
			case 'user_sendInvite':
			case 'message_markRead':
			case 'project_pageDto':
			case 'lex_projectDto':
				return $this->userHasProjectRight(Domain::PROJECTS + Operation::VIEW);

			case 'answer_vote_up':
			case 'answer_vote_down':
				return $this->userHasProjectRight(Domain::ANSWERS + Operation::VIEW);

			case 'text_list_dto':
				return $this->userHasProjectRight(Domain::TEXTS + Operation::VIEW);
				
			case 'question_update_answer':
				return $this->userHasProjectRight(Domain::ANSWERS + Operation::EDIT_OWN);
				
			case 'question_remove_answer':
				return $this->userHasProjectRight(Domain::ANSWERS + Operation::DELETE_OWN);
				
			case 'question_update_comment':
				return $this->userHasProjectRight(Domain::COMMENTS + Operation::EDIT_OWN);
				
			case 'question_remove_comment':
				return $this->userHasProjectRight(Domain::COMMENTS + Operation::DELETE_OWN);
				
			case 'question_comment_dto':
				return $this->userHasProjectRight(Domain::ANSWERS + Operation::VIEW);
				
			case 'question_list_dto':
				return $this->userHasProjectRight(Domain::QUESTIONS + Operation::VIEW);

			// Project Manager Role (Project Context)
			case 'lex_manageUsersDto':
			case 'user_createSimple':
				return $this->userHasProjectRight(Domain::USERS + Operation::CREATE);
				
			case 'user_typeahead':
			case 'user_typeaheadExclusive':
				return $this->userHasProjectRight(Domain::USERS + Operation::VIEW);
				
			case 'message_send':
			case 'project_read':
			case 'project_settings':
			case 'project_updateSettings':
			case 'project_readSettings':
				return $this->userHasProjectRight(Domain::PROJECTS + Operation::EDIT);

			case 'project_update':
			case 'lex_project_update':
				return $this->userHasProjectRight(Domain::PROJECTS + Operation::EDIT);
				
			case 'project_updateUserRole':
				return $this->userHasProjectRight(Domain::PROJECTS + Operation::EDIT);
				
			case 'project_joinProject':
				return $this->userHasSiteRight(Domain::PROJECTS + Operation::EDIT);

			case 'project_usersDto':
				return $this->userHasProjectRight(Domain::USERS + Operation::VIEW);

			case 'project_removeUsers':
				return $this->userHasProjectRight(Domain::USERS + Operation::DELETE);

			case 'text_update':
			case 'text_read':
			case 'text_settings_dto':
			case 'text_exportComments':
				return $this->userHasProjectRight(Domain::TEXTS + Operation::EDIT);

			case 'text_archive':
			case 'text_publish':
				return $this->userHasProjectRight(Domain::TEXTS + Operation::ARCHIVE);

			case 'question_update':
			case 'question_read':
				return $this->userHasProjectRight(Domain::QUESTIONS + Operation::EDIT);

			case 'question_update_answerExportFlag':
				return $this->userHasProjectRight(Domain::TEXTS + Operation::EDIT);
				
			case 'question_update_answerTags':
				return $this->userHasProjectRight(Domain::TAGS + Operation::EDIT);
				
			case 'question_archive':
			case 'question_publish':
				return $this->userHasProjectRight(Domain::QUESTIONS + Operation::ARCHIVE);


			// Admin (site context)
			case 'user_read':
			case 'user_list':
				return $this->userHasSiteRight(Domain::USERS + Operation::VIEW);

			case 'user_update':
			case 'user_create':
				return $this->userHasSiteRight(Domain::USERS + Operation::EDIT);
				
			case 'user_delete':
				return $this->userHasSiteRight(Domain::USERS + Operation::DELETE);
				
			case 'project_archive':
			case 'project_archivedList':
			case 'project_publish':
				return $this->userHasSiteRight(Domain::PROJECTS + Operation::ARCHIVE);
				
			case 'project_list':
				return $this->userHasSiteRight(Domain::PROJECTS + Operation::VIEW);
			
			case 'project_create':
				return $this->userHasSiteRight(Domain::PROJECTS + Operation::EDIT);
			
			case 'questionTemplate_update':
				return $this->userHasProjectRight(Domain::TEMPLATES + Operation::EDIT);
				
			case 'questionTemplate_read':
				return $this->userHasProjectRight(Domain::TEMPLATES + Operation::VIEW);

			case 'questionTemplate_delete':
				return $this->userHasProjectRight(Domain::TEMPLATES + Operation::DELETE);
				
			case 'questionTemplate_list':
				return $this->userHasProjectRight(Domain::TEMPLATES + Operation::VIEW);


			// User (site context)
			case 'user_readProfile':
				return $this->userHasSiteRight(Domain::USERS + Operation::VIEW_OWN);
				
			case 'user_updateProfile':
			case 'change_password': // change_password requires additional protection in the method itself
				return $this->userHasSiteRight(Domain::USERS + Operation::EDIT_OWN);
			case 'project_list_dto':
			case 'activity_list_dto':
				return $this->userHasSiteRight(Domain::PROJECTS + Operation::VIEW_OWN);

			case 'session_getSessionData':
				// Are there any circumstances where this should be denied? Should this just be "return true;"?
				return $this->userHasSiteRight(Domain::USERS + Operation::VIEW_OWN);
				
				
			// LanguageForge (lexicon)
			case 'lex_configuration_update':
			case 'lex_import_lift':
				return $this->userHasProjectRight(Domain::PROJECTS + Operation::EDIT);
				
			// grant general permission until a better, app-specific rightsHelper can be developed
			case 'lex_baseViewDto':
			case 'lex_dbeDto':
			case 'lex_entry_read':
			case 'lex_entry_update':
			case 'lex_entry_remove':
			case 'lex_entry_updateComment':
				return $this->userHasProjectRight(Domain::PROJECTS + Operation::VIEW);
				
				
				
			default:
				throw new \Exception("API method '$methodName' has no security policy defined in RightsHelper::userCanAccessMethod()");
		}
	}
}

?>