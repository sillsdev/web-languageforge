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
	
	public static function userHasProjectRight($userId, $right) {
		$user = new UserModel($userId);
		return Roles::hasRight(Realm::SITE, $user->role, $right);
	}
	
	public static function userCanAccessMethod($methodName, $userId) {
		switch ($methodName) {

			// Site Admin
			case 'user_read':
			case 'user_list':
				return RightsHelper::userHasSiteRight($userId, Domain::USERS + Operation::VIEW);

			case 'user_update':
			case 'user_create':
				return RightsHelper::userHasSiteRight($userId, Domain::USERS + Operation::EDIT);
				
			case 'user_delete':
				return RightsHelper::userHasSiteRight($userId, Domain::USERS + Operation::DELETE);
				
			case 'project_delete':
				return RightsHelper::userHasSiteRight($userId, Domain::PROJECTS + Operation::DELETE);
				
			case 'project_list':
				return RightsHelper::userHasSiteRight($userId, Domain::PROJECTS + Operation::VIEW);

			// User
			case 'user_readProfile':
				return RightsHelper::userHasSiteRight($userId, Domain::USERS + Operation::VIEW_OWN);
				
			case 'user_updateProfile':
			case 'change_password': // change_password requires additional protection in the method itself
				return RightsHelper::userHasSiteRight($userId, Domain::USERS + Operation::EDIT_OWN);

			case 'user_sendInvite':
			case 'message_markRead':
			case 'project_list_dto':
			case 'project_pageDto':
			case 'activity_list_dto':
			case 'answer_vote_up':
			case 'answer_vote_down':
				return RightsHelper::userHasProjectRight($userId, Domain::ANSWERS + Operation::VIEW);

			case 'text_list_dto':
				return RightsHelper::userHasProjectRight($userId, Domain::TEXTS + Operation::VIEW);
				
			case 'question_update_answer':
				return RightsHelper::userHasProjectRight($userId, Domain::ANSWERS + Operation::EDIT_OWN);
				
			case 'question_remove_answer':
				return RightsHelper::userHasProjectRight($userId, Domain::ANSWERS + Operation::DELETE_OWN);
				
			case 'question_update_comment':
				return RightsHelper::userHasProjectRight($userId, Domain::COMMENTS + Operation::EDIT_OWN);
				
			case 'question_remove_comment':
				return RightsHelper::userHasProjectRight($userId, Domain::COMMENTS + Operation::DELETE_OWN);
				
			case 'question_comment_dto':
				return RightsHelper::userHasProjectRight($userId, Domain::ANSWERS + Operation::VIEW);
				
			case 'question_list_dto':
				return RightsHelper::userHasProjectRight($userId, Domain::QUESTIONS + Operation::VIEW);

			// Project Manager
			case 'user_createSimple':
				return RightsHelper::userHasProjectRight($userId, Domain::USERS + Operation::CREATE);
				
			case 'user_typeahead':
				return RightsHelper::userHasProjectRight($userId, Domain::USERS + Operation::VIEW);
				
			case 'message_send':
			case 'project_update':
			case 'project_read':
			case 'project_settings':
			case 'project_updateSettings':
			case 'project_readSettings':
				return RightsHelper::userHasProjectRight($userId, Domain::PROJECTS + Operation::EDIT);

			case 'project_updateUserRole':
				return RightsHelper::userHasProjectRight($userId, Domain::USERS + Operation::EDIT);

			case 'project_removeUsers':
				return RightsHelper::userHasProjectRight($userId, Domain::USERS + Operation::DELETE);

			case 'text_update':
			case 'text_read':
			case 'text_settings_dto':
				return RightsHelper::userHasProjectRight($userId, Domain::TEXTS + Operation::EDIT);

			case 'text_delete':
				return RightsHelper::userHasProjectRight($userId, Domain::TEXTS + Operation::DELETE);

			case 'question_update':
			case 'question_read':
				return RightsHelper::userHasProjectRight($userId, Domain::QUESTIONS + Operation::EDIT);

			case 'question_delete':
				return RightsHelper::userHasProjectRight($userId, Domain::QUESTIONS + Operation::DELETE);

			case 'questionTemplate_update':
			case 'questionTemplate_read':
				return RightsHelper::userHasProjectRight($userId, Domain::TEMPLATES + Operation::EDIT);

			case 'questionTemplate_delete':
				return RightsHelper::userHasProjectRight($userId, Domain::TEMPLATES + Operation::DELETE);
				
			case 'questionTemplate_list':
				return RightsHelper::userHasProjectRight($userId, Domain::TEMPLATES + Operation::VIEW);
				
			default:
				return false;
		}
	}
}

?>