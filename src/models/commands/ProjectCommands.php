<?php

namespace models\commands;

use libraries\palaso\CodeGuard;
use libraries\palaso\JsonRpcServer;
use libraries\palaso\exceptions\UserNotAuthenticatedException;
use libraries\sfchecks\Communicate;
use libraries\sfchecks\Email;
use models\AnswerModel;
use models\ProjectModel;
use models\ProjectSettingsModel;
use models\QuestionModel;
use models\UnreadMessageModel;
use models\UserModel;
use models\UserProfileModel;
use models\commands\ActivityCommands;
use models\commands\ProjectCommands;
use models\commands\QuestionCommands;
use models\commands\QuestionTemplateCommands;
use models\commands\TextCommands;
use models\commands\UserCommands;
use models\dto\ActivityListDto;
use models\dto\ProjectSettingsDto;
use models\dto\RightsHelper;
use models\dto\UserProfileDto;
use models\mapper\Id;
use models\mapper\JsonDecoder;
use models\mapper\JsonEncoder;
use models\mapper\MongoStore;
use models\rights\Domain;
use models\rights\Operation;
use models\rights\Realm;
use models\rights\Roles;
use models\sms\SmsSettings;


class ProjectCommands
{
	
	/**
	 * 
	 * @param unknown $object
	 * @param string $authUserId - the admin user's id performing the update (for auth purposes)
	 * @throws \Exception
	 * @return string
	 */
	public static function updateProject($object, $authUserId) {
		$project = new \models\ProjectModel();
		$id = $object['id'];
		$isNewProject = ($id == '');
		$oldDBName = '';
		if (!$isNewProject) {
			$project->read($id);
			// This is getting complex; it probably belongs in ProjectCommands. TODO: Rewrite it to put it there. RM 2013-08
			$oldDBName = $project->databaseName();
		}
		JsonDecoder::decode($project, $object);
		$newDBName = $project->databaseName();
		if (($oldDBName != '') && ($oldDBName != $newDBName)) {
			if (MongoStore::hasDB($newDBName)) {
				throw new \Exception("New project name " . $object->projectname . " already exists. Not renaming.");
			}
			MongoStore::renameDB($oldDBName, $newDBName);
		}
		$result = $project->write();
		if ($isNewProject) {
			//ActivityCommands::addProject($project); // TODO: Determine if any other params are needed. RM 2013-08
		}
		return $result;
	}
	
	/**
	 * 
	 * @param string $id
	 * @param string $authUserId - the admin user's id performing the update (for auth purposes)
	 */
	public static function readProject($id, $authUserId) {
		// TODO: validate $authUserId as authorized to perform this action
		$project = new \models\ProjectModel($id);
		return JsonEncoder::encode($project);
	}
	
	/**
	 * @param array $projectIds
	 * @return int Total number of projects removed.
	 */
	public static function deleteProjects($projectIds, $authUserId) {
		// TODO: validate $authUserId as authorized to perform this action
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
	 * 
	 * @param string $authUserId - the admin user's id performing the update (for auth purposes)
	 * @return \models\ProjectListModel
	 */
	public static function listProjects($authUserId) {
		// TODO: validate $authUserId as authorized to perform this action
		$list = new \models\ProjectListModel();
		$list->read();
		return $list;
	}

	/**
	 * Update the user role in the project
	 * @param string $projectId
	 * @param array $params
	 * @param string $authUserId - the admin user's id performing the update (for auth purposes)
	 * @return unknown|string
	 */
	public static function updateUserRole($projectId, $params, $authUserId) {
		CodeGuard::checkNotFalseAndThrow($projectId, '$projectId');
		CodeGuard::checkNotFalseAndThrow($params['id'], 'id');
		// TODO: validate $authUserId as authorized to perform this action
		
		// Add the user to the project
		$role = array_key_exists('role', $params) && $params['role'] != '' ? $params['role'] : Roles::USER;
		$userId = $params['id'];
		$user = new UserModel($userId);
		$project = new ProjectModel($projectId);
		$project->addUser($userId, $role);
		$user->addProject($projectId);
		$project->write();
		$user->write();
		ActivityCommands::addUserToProject($project, $userId);
		
		return $userId;
	}
	
	/**
	 * Removes users from the project (two-way unlink)
	 * @param Id $projectId
	 * @param array $userIds array<string>
	 * @param string $authUserId - the admin user's id performing the update (for auth purposes)
	 */
	public static function removeUsers($projectId, $userIds, $authUserId) {
		// TODO: validate $authUserId as authorized to perform this action
		$project = new ProjectModel($projectId);
		foreach ($userIds as $userId) {
			$user = new UserModel($userId);
			$project->removeUser($user->id->asString());
			$user->removeProject($project->id->asString());
			$project->write();
			$user->write();
		}
	}
	
	public static function renameProject($projectId, $oldName, $newName) {
		// TODO: Write this. (Move renaming logic over from sf->project_update). RM 2013-08
	}
	
	public static function updateProjectSettings($projectId, $smsSettingsArray, $emailSettingsArray, $authUserId) {
		if (RightsHelper::userHasSiteRight($this->_userId, Domain::PROJECTS + Operation::EDIT_OTHER)) {
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
	}
	
	public static function readProjectSettings($projectId, $authUserId) {
		if (RightsHelper::userHasSiteRight($authUserId, Domain::PROJECTS + Operation::EDIT_OTHER)) {
			$project = new ProjectSettingsModel($projectId);
			return array(
				'sms' => JsonEncoder::encode($project->smsSettings),
				'email' => JsonEncoder::encode($project->emailSettings)
			);
		}
	}
	
}

?>
