<?php
namespace libraries\shared\scripts\migration;

use models\scriptureforge\SfchecksProjectModel;

use models\ProjectListModel;

use models\ProjectModel;

use models\UserModel;

use models\UserListModel;

class MakeAllSfchecksProjects {
	
	public function run($mode = 'test') {
		$testMode = ($mode == 'test');
		$message = "";

		$projectlist = new ProjectListModel();
		$projectlist->read();
		$projectIds = array_map(function($e) { return $e['id'];}, $projectlist->entries);
		
		$projectsChanged = 0;
		foreach ($projectlist->entries as $projectParams) { // foreach existing project
			$projectId = $projectParams['id'];
			$project = new SfchecksProjectModel($projectId);
			$project->themeName = "jamaicanpsalms";
			$message .= "Changed the " . $project->projectname . " to be a sfchecks/scriptureforge project with jamaican psalms theme\n";
			if (!$testMode) {
				$project->write();
			}
			$projectsChanged++;
		}
		if ($projectsChanged > 0) {
			$message .= "\n\nChanged $projectsChanged projects to be of sfchecks type under scriptureforge and jamaicanpsalms theme \n\n";
		} else {
			$message .= "\n\nNo projects were found/changed \n\n";
		}
		return $message;
	}
}
