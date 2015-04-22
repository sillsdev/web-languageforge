<?php
namespace libraries\shared\scripts\migration;

use models\languageforge\lexicon\LexiconProjectModel;
use models\shared\rights\ProjectRoleModel;
use models\ProjectListModel;
use models\ProjectModel;

class FixLexViewSettings
{
    public function run($userId, $mode = 'test')
    {
        $testMode = ($mode != 'run');
        $message = "Fix Lexicon View Settings to default to visible\n\n";

        $projectlist = new ProjectListModel();
        $projectlist->read();

        foreach ($projectlist->entries as $projectParams) { // foreach existing project
            $projectId = $projectParams['id'];
            $project = new ProjectModel($projectId);
            if ($project->appName == 'lexicon') {
                $project = new LexiconProjectModel($projectId);
                $message .= "Inspecting project $project->projectName.\n";

                $showFieldUpdated = 0;
                $roleShowFieldUpdated = 0;
                foreach ($project->config->roleViews as $role => $roleView) {
                    foreach ($roleView->fields as $fieldName => $field) {
                        if (! $field->show) {
                            $field->show = true;
                            $showFieldUpdated++;
                            $roleShowFieldUpdated++;
                        }
                    }
                }

                $userShowFieldUpdated = 0;
                foreach ($project->config->userViews as $userId => $userView) {
                    foreach ($userView->fields as $fieldName => $field) {
                        if (! $field->show) {
                            $field->show = true;
                            $showFieldUpdated++;
                            $userShowFieldUpdated++;
                        }
                    }
                }

                if ($showFieldUpdated > 0) {
                    $message .= "  Changed $showFieldUpdated View Settings fields to be visible. This comprised: \n";
                    $message .= "   - Changed $roleShowFieldUpdated role-based View Settings fields to be visible.\n";
                    $message .= "   - Changed $userShowFieldUpdated user-based View Settings fields to be visible.\n\n";

                    if (!$testMode) {
                        $message .= "  Saving changes to project $project->projectName.\n\n";
                        $project->write();
                    }
                } else {
                    $message .= "  No invisible View Settings fields found/changed.\n\n";
                }
            }
        }

        return $message;
    }
}
