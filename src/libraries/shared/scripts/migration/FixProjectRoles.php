<?php
namespace libraries\shared\scripts\migration;

use models\shared\rights\ProjectRoleModel;

use models\scriptureforge\SfchecksProjectModel;
use models\ProjectListModel;
use models\ProjectModel;
use models\UserListModel;
use models\UserModel;

class FixProjectRoles {
	
	public function run($mode = 'test') {
		$testMode = ($mode != 'run');
		$message = "";

		$projectlist = new ProjectListModel();
		$projectlist->read();
		
		$contribRoleUpdated = 0;
		$managerRoleUpdated = 0;
		foreach ($projectlist->entries as $projectParams) { // foreach existing project
			$projectId = $projectParams['id'];
			$project = new SfchecksProjectModel($projectId);
			$users = $project->users;
			foreach ($users as $userId => $rm) {
				$role = $rm->role;
				if ($role == 'user') {
					$roleModel = new ProjectRoleModel();
					$roleModel->role = 'contributor';
					$project->users[$userId] = $roleModel;
					$contribRoleUpdated++;
					$message .= "Updated user role for user $userId\n";
				} else if ($role == 'project_admin') {
					$roleModel = new ProjectRoleModel();
					$roleModel->role = 'project_manager';
					$project->users[$userId] = $roleModel;
					$message .= "Updated manager role for user $userId\n";
					$managerRoleUpdated++;
				}
			}
			if (!$testMode) {
				$message .= "saving project $projectId\n";
				$project->write();
			}
		}
		if ($contribRoleUpdated > 0 || $managerRoleUpdated) {
			$message .= "\n\nChanged $contribRoleUpdated user roles to be 'contributor' and $managerRoleUpdated project_admin roles to be 'project_manager'\n\n";
		} else {
			$message .= "\n\nNo old roles were found/changed \n\n";
		}
		return $message;
	}
}
