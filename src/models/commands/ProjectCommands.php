<?php

namespace models\commands;

use libraries\palaso\CodeGuard;
use libraries\palaso\JsonRpcServer;
use libraries\palaso\exceptions\UserNotAuthenticatedException;
use libraries\palaso\exceptions\UserUnauthorizedException;
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
	 * Create or update project
	 * @param array<projectModel> $object
	 * @param string $userId
	 * @throws UserUnauthorizedException
	 * @throws \Exception
	 * @return string projectId
	 */
	public static function updateProject($object, $userId) {
		$project = new ProjectModel();
		$id = $object['id'];
		$isNewProject = ($id == '');
		$oldDBName = '';
		if ($isNewProject) {
			if (!RightsHelper::userHasSiteRight($userId, Domain::PROJECTS + Operation::EDIT)) {
				throw new UserUnauthorizedException("Insufficient privileges to create new project in method 'updateProject'");
			}
		} else {
			if (!RightsHelper::userHasProjectRight($id, $userId, Domain::USERS + Operation::EDIT)) {
				throw new UserUnauthorizedException("Insufficient privileges to update project in method 'updateProject'");
			}
			$project->read($id);
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
		return $result;
	}
	
	/**
	 * 
	 * @param string $id
	 * @param string $authUserId - the admin user's id performing the update (for auth purposes)
	 */
	public static function readProject($id) {
		$project = new \models\ProjectModel($id);
		return JsonEncoder::encode($project);
	}
	
	/**
	 * @param array $projectIds
	 * @return int Total number of projects removed.
	 */
	public static function deleteProjects($projectIds) {
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
	 * @return \models\ProjectListModel
	 */
	public static function listProjects() {
		$list = new \models\ProjectListModel();
		$list->read();
		return $list;
	}

	/**
	 * Update the user role in the project
	 * @param string $projectId
	 * @param array $params
	 * @return unknown|string
	 */
	public static function updateUserRole($projectId, $params) {
		CodeGuard::checkNotFalseAndThrow($projectId, '$projectId');
		CodeGuard::checkNotFalseAndThrow($params['id'], 'id');
		
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
	 */
	public static function removeUsers($projectId, $userIds) {
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
	
	public static function updateProjectSettings($projectId, $smsSettingsArray, $emailSettingsArray) {
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
	
	public static function readProjectSettings($projectId) {
		$project = new ProjectSettingsModel($projectId);
		return array(
			'sms' => JsonEncoder::encode($project->smsSettings),
			'email' => JsonEncoder::encode($project->emailSettings)
		);
	}
	
}

?>
