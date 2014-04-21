<?php
namespace libraries\shared\scripts\migration;

use models\ProjectListModel;

use models\ProjectModel;

use models\UserModel;

use models\UserListModel;

class FixProjectUserRefs {
	
	public function run($mode = 'test') {
		$testMode = ($mode == 'test');
		$message = "";
		$userlist = new UserListModel();
		$userlist->read();
		$userIds = array_map(function($e) { return $e['id'];}, $userlist->entries);
		
		$projectlist = new ProjectListModel();
		$projectlist->read();
		$projectIds = array_map(function($e) { return $e['id'];}, $projectlist->entries);
		
		$deadProjectLinks = 0;
		foreach ($userlist->entries as $userParams) { // foreach existing user
			$userId = $userParams['id'];
			$user = new UserModel($userId);
			$userProjectRefs = $user->projects->refs;
			foreach ($userProjectRefs as $ref) { // foreach project the user belongs to
				if (!in_array($ref, $projectIds)) {
					$user->removeProject($ref); // remove dead project link
					$deadProjectLinks++;
					$message .= "Removed dead project link $ref from user $userId\n";
				}
			}
			if (!$testMode) {
				$user->write();
			}
		}
		if ($deadProjectLinks > 0) {
			$message .= "\n\nRemoved $deadProjectLinks dead project links from the users collection\n\n";
		} else {
			$message .= "\n\nNo dead project links were found\n\n";
		}
		
		$deadUserLinks = 0;
		foreach ($projectlist->entries as $projectParams) { // foreach existing project
			$projectId = $projectParams['id'];
			$project = new ProjectModel($projectId);
			$projectUserRefs = array_keys($project->users);
			foreach ($projectUserRefs as $ref) { // foreach user that is a member of this project
				if (!in_array($ref, $userIds)) {
					$project->removeUser($ref); // remove dead user link
					$deadUserLinks++;
					$message .= "Removed dead user link $ref for project $projectId\n";
				}
			}
			if (!$testMode) {
				$project->write();
			}
		}
		if ($deadUserLinks > 0) {
			$message .= "\n\nRemoved $deadUserLinks dead user links from the projects collection\n\n";
		} else {
			$message .= "\n\nNo dead user links were found\n\n";
		}
		return $message;
	}
}
