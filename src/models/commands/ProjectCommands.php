<?php

namespace models\commands;

use libraries\palaso\CodeGuard;
use models\mapper\JsonDecoder;
use models\rights\Roles;
use models\ProjectModel;
use models\UserModel;

class ProjectCommands
{
	
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
		return $count;
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
	
}

?>
