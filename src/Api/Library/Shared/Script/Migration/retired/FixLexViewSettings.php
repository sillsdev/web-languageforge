<?php

namespace Api\Library\Shared\Script\Migration;

use Api\Model\Languageforge\Lexicon\LexProjectModel;
use Api\Model\ProjectListModel;
use Api\Model\ProjectModel;

class FixLexViewSettings
{
    public function run($userId, $mode = 'test')
    {
        $testMode = ($mode != 'run');
        $message = "Fix Lexicon View Settings (except Environments and ReversalEntries) to default to visible\n\n";
        $fixCount = 0;

        $projectlist = new ProjectListModel();
        $projectlist->read();

        foreach ($projectlist->entries as $projectParams) { // foreach existing project
            $projectId = $projectParams['id'];
            $project = new ProjectModel($projectId);
            if ($project->appName == 'lexicon') {
                $project = new LexProjectModel($projectId);
                //$message .= "\nInspecting project $project->projectName.\n";

                $showFieldUpdated = 0;
                $roleShowFieldUpdated = 0;
                //$hideFieldUpdated = 0;
                $roleHideFieldUpdated = 0;
                $disabledFields = array("environments", "reversalEntries");
                foreach ($project->config->roleViews as $role => $roleView) {
                    foreach ($roleView->fields as $fieldName => $field) {
                        if (in_array($fieldName, $disabledFields)) {
                            if ($field->show) {
                                // Hide disabled fields
                                //$message .= "Hiding role $role view of $fieldName\n";
                                $field->show = false;
                                $showFieldUpdated++;
                                $roleHideFieldUpdated++;

                            }
                        }
                        else if (! $field->show) {
                            // enable all other fields by default
                            $field->show = true;
                            $showFieldUpdated++;
                            $roleShowFieldUpdated++;
                        }
                    }
                }

                $userShowFieldUpdated = 0;
                $userHideFieldUpdated = 0;
                foreach ($project->config->userViews as $userId => $userView) {
                    foreach ($userView->fields as $fieldName => $field) {
                        if (in_array($fieldName, $disabledFields)) {
                            if ($field->show) {
                                // Hide disabled fields
                                //$message .= "Hiding user $userId view of $fieldName\n";
                                $field->show = false;
                                $showFieldUpdated++;
                                $userHideFieldUpdated++;
                            }
                        }
                        else if (! $field->show) {
                            // enable all other fields by default
                            $field->show = true;
                            $showFieldUpdated++;
                            $userShowFieldUpdated++;
                        }
                    }
                }

                if ($showFieldUpdated > 0) {
                    $fixCount++;
                    $message .= "  Toggled $showFieldUpdated View Settings fields. This comprised: \n";
                    if ($roleShowFieldUpdated > 0) {
                        $message .= "   - Changed $roleShowFieldUpdated role-based View Settings fields to be visible.\n";
                    }
                    if  ($userShowFieldUpdated > 0) {
                        $message .= "   - Changed $userShowFieldUpdated user-based View Settings fields to be visible.\n";
                    }
                    if ($roleHideFieldUpdated > 0) {
                        $message .= "   - Changed $roleHideFieldUpdated role-based View Settings fields to be invisible.\n";
                    }
                    if ($userHideFieldUpdated > 0) {
                        $message .= "   - Changed $userHideFieldUpdated user-based View Settings fields to be invisible.\n";
                    }

                    if (!$testMode) {
                        $message .= "  Saving changes to project $project->projectName.\n";
                        $project->write();
                    }
                } else {
                    //$message .= "  No invisible View Settings fields found/changed.\n";
                }
            }
        }
        
        if ($fixCount > 0) {
            $message .= "$fixCount projects were fixed\n";
        } else {
            $message .= "No projects needed fixing\n";
        }

        return $message;
    }
}
