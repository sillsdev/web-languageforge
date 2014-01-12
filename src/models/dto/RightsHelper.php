<?php

namespace models\dto;

use models\rights\Operation;

use models\rights\Domain;

use models\ProjectModel;
use models\UserModel;
use models\rights\Realm;
use models\rights\Roles;

class RightsHelper
{

	/**
	 * @param UserModel $userModel
	 * @param ProjectModel $projectModel
	 */
	public static function encode($userModel, $projectModel) {
		if ($userModel->role == Roles::SYSTEM_ADMIN) {
			return Roles::getRightsArray(Realm::PROJECT, Roles::PROJECT_ADMIN); 
		} else {
			return $projectModel->getRightsArray($userModel->id->asString());
		}
	}
	
	public static function userHasSiteRight($userId, $right) {
		$user = new UserModel($userId);
		return Roles::hasRight(Realm::SITE, $user->role, $right);
	}
	
	public static function userHasProjectRightForAnyProject($userId, $right) {
		$user = new UserModel($userId);
		foreach ($user->projects->refs as $id) {
			if (self::userHasProjectRight($id->asString(), $userId, $right)) {
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
	private static function userHasProjectRight($projectId, $userId, $right) {
		$project = new ProjectModel($projectId);
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
				return self::userHasProjectRight($params[0], $userId, Domain::PROJECTS + Operation::VIEW);
			case 'answer_vote_up':
			case 'answer_vote_down':
				return self::userHasProjectRight($params[0], $userId, Domain::ANSWERS + Operation::VIEW);

			case 'text_list_dto':
				return self::userHasProjectRight($params[0], $userId, Domain::TEXTS + Operation::VIEW);
				
			case 'question_update_answer':
				return self::userHasProjectRight($params[0], $userId, Domain::ANSWERS + Operation::EDIT_OWN);
				
			case 'question_remove_answer':
				return self::userHasProjectRight($params[0], $userId, Domain::ANSWERS + Operation::DELETE_OWN);
				
			case 'question_update_comment':
				return self::userHasProjectRight($params[0], $userId, Domain::COMMENTS + Operation::EDIT_OWN);
				
			case 'question_remove_comment':
				return self::userHasProjectRight($params[0], $userId, Domain::COMMENTS + Operation::DELETE_OWN);
				
			case 'question_comment_dto':
				return self::userHasProjectRight($params[0], $userId, Domain::ANSWERS + Operation::VIEW);
				
			case 'question_list_dto':
				return self::userHasProjectRight($params[0], $userId, Domain::QUESTIONS + Operation::VIEW);

			// Project Manager Role (Project Context)
			case 'user_createSimple':
				return self::userHasProjectRight($params[0], $userId, Domain::USERS + Operation::CREATE);
				
			case 'user_typeahead':
				return self::userHasProjectRightForAnyProject($userId, Domain::USERS + Operation::VIEW);
				
			case 'message_send':
			case 'project_update':
			case 'project_read':
			case 'project_settings':
			case 'project_updateSettings':
			case 'project_readSettings':
				return self::userHasProjectRight($params[0], $userId, Domain::PROJECTS + Operation::EDIT);

			case 'project_updateUserRole':
				return self::userHasProjectRight($params[0], $userId, Domain::USERS + Operation::EDIT);

			case 'project_removeUsers':
				return self::userHasProjectRight($params[0], $userId, Domain::USERS + Operation::DELETE);

			case 'text_update':
			case 'text_read':
			case 'text_settings_dto':
				return self::userHasProjectRight($params[0], $userId, Domain::TEXTS + Operation::EDIT);

			case 'text_delete':
				return self::userHasProjectRight($params[0], $userId, Domain::TEXTS + Operation::DELETE);

			case 'question_update':
			case 'question_read':
				return self::userHasProjectRight($params[0], $userId, Domain::QUESTIONS + Operation::EDIT);

			case 'question_delete':
				return self::userHasProjectRight($params[0], $userId, Domain::QUESTIONS + Operation::DELETE);


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
			
			case 'project_update':
				return self::userHasSiteRight($userId, Domain::PROJECTS + Operation::EDIT);

			case 'questionTemplate_update':
			case 'questionTemplate_read':
				return self::userHasSiteRight($userId, Domain::TEMPLATES + Operation::EDIT);

			case 'questionTemplate_delete':
				return self::userHasSiteRight($userId, Domain::TEMPLATES + Operation::DELETE);
				
			case 'questionTemplate_list':
				return self::userHasSiteRight($userId, Domain::TEMPLATES + Operation::VIEW);


			// User (site context)
			case 'user_readProfile':
				return self::userHasSiteRight($userId, Domain::USERS + Operation::VIEW_OWN);
				
			case 'user_updateProfile':
			case 'change_password': // change_password requires additional protection in the method itself
				return self::userHasSiteRight($userId, Domain::USERS + Operation::EDIT_OWN);
			case 'project_list_dto':
			case 'activity_list_dto':
				return self::userHasSiteRight($userId, Domain::PROJECTS + Operation::VIEW_OWN);
			default:
				throw new \Exception("API method '$methodName' has no security policy defined in RightsHelper::userCanAccessMethod()");
		}
	}
}

?>