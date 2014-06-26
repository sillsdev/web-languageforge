<?php
namespace libraries\shared\scripts\migration;

use models\GlobalQuestionTemplateModel;

use models\scriptureforge\sfchecks\QuestionTemplateModel;

use models\GlobalQuestionTemplateListModel;

use models\shared\rights\ProjectRoleModel;

use models\scriptureforge\SfchecksProjectModel;
use models\ProjectListModel;
use models\ProjectModel;
use models\UserListModel;
use models\UserModel;

require_once 'models/GlobalQuestionTemplateModel.php';

class MigrateQuestionTemplates {
	
	public function run($mode = 'test') {
		$testMode = ($mode != 'run');
		$message = "";
		
		$templateList = new GlobalQuestionTemplateListModel();
		$templateList->read();
		
		if (count($templateList->entries) > 0) {
			
		} else {
			$message .= "There are no global templates to migrate\n\n";
			
		}

		$templatesMoved = 0;

		$projectlist = new ProjectListModel();
		$projectlist->read();
		

		$project = null;
		foreach ($projectlist->entries as $projectParams) { // foreach existing project
			$projectId = $projectParams['id'];
			$p = new SfchecksProjectModel($projectId);
			if ($p->databaseName() == 'sf_jamaican_psalms') {
				$project = $p;
			}
		}
		if (!is_null($project)) {
			
			$message .= "Migrating global templates to the '" . $project->projectName . "' project\n\n";
			
			foreach ($templateList->entries as $globalTemplate) {
				$template = new QuestionTemplateModel($project);
				$template->title = $globalTemplate['title'];
				$template->description = $globalTemplate['description'];
				$message .= "Moving '" . $template->title . "'\n";
				if (!$testMode) {
					$template->write();
					$gt = new GlobalQuestionTemplateModel($globalTemplate['id']);
					$gt->remove();
				}
				$templatesMoved++;
			}
			$message .= "\n\nMoved $templatesMoved global templates to the specified project\n\n";
			
		} else {
			$message .= "Error: cound not find the Jamaican Psalms project on this server\n\n";
		}

		return $message;
	}
}
