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
	 * @param UserModel $userModel
	 * @param ProjectModel $projectModel
	 */
	public static function encode($userModel, $projectModel) {
		return $projectModel->getRightsArray($userModel->id->asString());
	}
	
	public static function userHasSiteRight($userId, $right) {
		$user = new UserModel($userId);
		return SiteRoles::hasRight($user->role, $right);
	}
	
	public static function userHasSfchecksProjectRightForAnyProject($userId, $right) {
		$user = new UserModel($userId);
		foreach ($user->projects->refs as $id) {
			if (self::userHasSfchecksProjectRight($id->asString(), $userId, $right)) {
				return true;
			}
		}
		return false;	
	}
	
	/**
	 * 
	 * @param string $projectId
	 * @param string $userId
	 * @param int $right
	 * @return bool
	 */
	public static function userHasSfchecksProjectRight($projectId, $userId, $right) {
		$project = new SfchecksProjectModel($projectId);
		return $project->hasRight($userId, $right);
	}

	/**
	 * 
	 * @param string $projectId
	 * @param string $userId
	 * @param int $right
	 * @return bool
	 */
	public static function userHasLexiconProjectRight($projectId, $userId, $right) {
		$project = new LexiconProjectModel($projectId);
		return $project->hasRight($userId, $right);
	}

	/**
	 * 
	 * @param string $projectId
	 * @param string $userId
	 * @param int $right
	 * @return bool
	 */
	public static function userHasRapumaProjectRight($projectId, $userId, $right) {
		$project = new RapumaProjectModel($projectId);
		return $project->hasRight($userId, $right);
	}
	
	/**
	 * 
	 * @param string $userId
	 * @param string $methodName
	 * @param array $params - parameters passed to the method
	 * @return boolean
	 */
	public static function userCanAccessMethod($userId, $methodName, $params) {
		switch ($methodName) {
			
			// User Role (Project Context)
			case 'user_sendInvite':
			case 'message_markRead':
			case 'project_pageDto':
			case 'lex_projectDto':
				return self::userHasSfchecksProjectRight($params[0], $userId, Domain::PROJECTS + Operation::VIEW);
			case 'answer_vote_up':
			case 'answer_vote_down':
				return self::userHasSfchecksProjectRight($params[0], $userId, Domain::ANSWERS + Operation::VIEW);

			case 'text_list_dto':
				return self::userHasSfchecksProjectRight($params[0], $userId, Domain::TEXTS + Operation::VIEW);
				
			case 'question_update_answer':
				return self::userHasSfchecksProjectRight($params[0], $userId, Domain::ANSWERS + Operation::EDIT_OWN);
				
			case 'question_remove_answer':
				return self::userHasSfchecksProjectRight($params[0], $userId, Domain::ANSWERS + Operation::DELETE_OWN);
				
			case 'question_update_comment':
				return self::userHasSfchecksProjectRight($params[0], $userId, Domain::COMMENTS + Operation::EDIT_OWN);
				
			case 'question_remove_comment':
				return self::userHasSfchecksProjectRight($params[0], $userId, Domain::COMMENTS + Operation::DELETE_OWN);
				
			case 'question_comment_dto':
				return self::userHasSfchecksProjectRight($params[0], $userId, Domain::ANSWERS + Operation::VIEW);
				
			case 'question_list_dto':
				return self::userHasSfchecksProjectRight($params[0], $userId, Domain::QUESTIONS + Operation::VIEW);

			// Project Manager Role (Project Context)
			case 'lex_manageUsersDto':
			case 'user_createSimple':
				return self::userHasSfchecksProjectRight($params[0], $userId, Domain::USERS + Operation::CREATE);
				
			case 'user_typeahead':
				return self::userHasSfchecksProjectRightForAnyProject($userId, Domain::USERS + Operation::VIEW);
				
			case 'message_send':
			case 'project_read':
			case 'project_settings':
			case 'project_updateSettings':
			case 'project_readSettings':
				return self::userHasSfchecksProjectRight($params[0], $userId, Domain::PROJECTS + Operation::EDIT);

			case 'project_update':
			case 'lex_project_update':
				return (self::userHasSfchecksProjectRight($params[0]['id'], $userId, Domain::PROJECTS + Operation::EDIT) ||
						self::userHasSiteRight($userId, Domain::PROJECTS + Operation::EDIT));
				
			case 'project_updateUserRole':
				return (self::userHasSfchecksProjectRight($params[0], $userId, Domain::USERS + Operation::EDIT) ||
						self::userHasSiteRight($userId, Domain::PROJECTS + Operation::EDIT));

			case 'project_removeUsers':
				return self::userHasSfchecksProjectRight($params[0], $userId, Domain::USERS + Operation::DELETE);

			case 'text_update':
			case 'text_read':
			case 'text_settings_dto':
			case 'text_exportComments':
				return self::userHasSfchecksProjectRight($params[0], $userId, Domain::TEXTS + Operation::EDIT);

			case 'text_archive':
			case 'text_publish':
				return self::userHasSfchecksProjectRight($params[0], $userId, Domain::TEXTS + Operation::ARCHIVE);

			case 'question_update':
			case 'question_read':
				return self::userHasSfchecksProjectRight($params[0], $userId, Domain::QUESTIONS + Operation::EDIT);

			case 'question_archive':
			case 'question_publish':
				return self::userHasSfchecksProjectRight($params[0], $userId, Domain::QUESTIONS + Operation::ARCHIVE);


			// Admin (site context)
			case 'user_read':
			case 'user_list':
				return self::userHasSiteRight($userId, Domain::USERS + Operation::VIEW);

			case 'user_update':
			case 'user_create':
				return self::userHasSiteRight($userId, Domain::USERS + Operation::EDIT);
				
			case 'user_delete':
				return self::userHasSiteRight($userId, Domain::USERS + Operation::DELETE);
				
			case 'project_delete':
				return self::userHasSiteRight($userId, Domain::PROJECTS + Operation::DELETE);
				
			case 'project_list':
				return self::userHasSiteRight($userId, Domain::PROJECTS + Operation::VIEW);
			
			case 'project_create':
				return self::userHasSiteRight($userId, Domain::PROJECTS + Operation::EDIT);
			
				// TODO: refactor these permissions once questionTemplates are being properly stored on the project
			case 'questionTemplate_update':
				return true;
				//return self::userHasSfchecksProjectRight($params[0], $userId, Domain::TEMPLATES + Operation::EDIT);
				
			case 'questionTemplate_read':
				return true;
				//return self::userHasSiteRight($userId, Domain::TEMPLATES + Operation::EDIT);

			case 'questionTemplate_delete':
				return true;
				//return self::userHasSiteRight($userId, Domain::TEMPLATES + Operation::DELETE);
				
			case 'questionTemplate_list':
				return true; // temporary until we refactor templates...
				//return self::userHasSfchecksProjectRight($params[0], $userId, Domain::TEMPLATES + Operation::VIEW);


			// User (site context)
			case 'user_readProfile':
				return self::userHasSiteRight($userId, Domain::USERS + Operation::VIEW_OWN);
				
			case 'user_updateProfile':
			case 'change_password': // change_password requires additional protection in the method itself
				return self::userHasSiteRight($userId, Domain::USERS + Operation::EDIT_OWN);
			case 'project_list_dto':
			case 'activity_list_dto':
				return self::userHasSiteRight($userId, Domain::PROJECTS + Operation::VIEW_OWN);
				
				
			// LanguageForge (lexicon)
			case 'lex_configuration_update':
			case 'lex_import_lift':
				return self::userHasLexiconProjectRight($params[0], $userId, Domain::PROJECTS + Operation::EDIT);
				
			// grant general permission until a better, app-specific rightsHelper can be developed
			// TODO: refactor rightshelper to be app specific!
			case 'lex_baseViewDto':
			case 'lex_dbeDto':
			case 'lex_entry_read':
			case 'lex_entry_update':
			case 'lex_entry_remove':
			case 'lex_entry_updateComment':
				return self::userHasLexiconProjectRight($params[0], $userId, Domain::PROJECTS + Operation::VIEW);
				
				
				
			default:
				throw new \Exception("API method '$methodName' has no security policy defined in RightsHelper::userCanAccessMethod()");
		}
	}
}

?>