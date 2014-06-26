<?php

namespace libraries\shared\scripts\migration;

use models\ProjectListModel;
use models\ProjectModel;
use models\UserModel;
use models\UserListModel;

class FixUserRoles {

	public function run($mode = 'test') {
		$testMode = ($mode == 'test');
		$message = "";

		$userlist = new UserListModel();
		$userlist->read();
		$badUserRoles = 0;
		foreach ($userlist->entries as $userParams) { // foreach existing user
			$userId = $userParams['id'];
			$user = new UserModel($userId);
			if (!$user->role) {
				$user->role = SiteRoles::USER;
				if (!$testMode) {
					$user->write();
				}
				$badUserRoles++;
				$message .= "Fixed role of user $userId\n";
			}
		}
		if ($badUserRoles > 0) {
			$message .= "\n\nFixed $badUserRoles non-existent user roles from the users collection\n\n";
		} else {
			$message .= "\n\nNo non-existent user roles found in the users collection\n\n";
		}

		$projectlist = new ProjectListModel();
		$projectlist->read();
		$badProjectUserRoles = 0;
		foreach ($projectlist->entries as $projectParams) { // foreach existing project
			$projectId = $projectParams['id'];
			$project = new ProjectModel($projectId);
			$projectUserRefs = array_keys($project->users);
			foreach ($projectUserRefs as $ref) { // foreach user that is a member of this project
				if (!isset($project->users[$ref]->role)) {
					$project->users[$ref]->role = ProjectRoles::CONTRIBUTOR;
					$badProjectUserRoles++;
					$message .= "Fixed role of user $ref for project $projectId\n";
				}
			}
			if (!$testMode) {
				$project->write();
			}
		}
		if ($badProjectUserRoles > 0) {
			$message .= "\n\nFixed $badProjectUserRoles non-existent user roles from the projects collection\n\n";
		} else {
			$message .= "\n\nNo non-existent user roles found in the projects collection\n\n";
		}

		return $message;
	}
}

?>
