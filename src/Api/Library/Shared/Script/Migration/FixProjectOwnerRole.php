<?php

namespace Api\Library\Shared\Script\Migration;

use Api\Model\ProjectModel;
use Api\Model\ProjectListModel;
use Api\Model\Shared\Rights\ProjectRoles;

(php_sapi_name() == 'cli') or die('this script must be run on the command-line');

require_once('../scriptConfig.php');

class FixProjectOwnerRole
{
    public static function run($mode = 'test')
    {
        $testMode = ($mode != 'run');
        print("Fix project_owner role\n");

        $projectList = new ProjectListModel();
        $projectList->read();
        $totalProjectCount = $projectList->count;

        $ownerRoleUpdated = 0;
        $projectCount = 0;
        $skippedProjects = 0;
        foreach ($projectList->entries as $projectParams) {
            $projectId = $projectParams['id'];
            $project = new ProjectModelForUseWithProjectOwnerRoleMigration($projectId);
            if ($project->ownerRef->id == "") {
                print("Project owner for $project->projectName undefined.  Skipping\n");
                $skippedProjects++;
            } else if (!$project->hasHadProjectOwnerRoleMigrated) {
                print("-------------  $project->projectName.\n");
                self::analyzeProject($project, $projectId, $testMode);
                $projectCount++;
                $ownerRoleUpdated++;
            } else {
                print("\nSkipping $project->projectName: already migrated\n");
                $skippedProjects++;
            }

            unset($project);
            if ($projectCount >= $totalProjectCount) {
                print("\nProcessed projects " . ($skippedProjects + 1) . " - " .
                    ($skippedProjects + $projectCount) . " of $totalProjectCount projects\n");
                break;
            }
        }
        if ($skippedProjects > 0) {
            print("Skipped $skippedProjects projects\n");
        }
        print("$ownerRoleUpdated projects had project_owner role migrated\n");
    }

    /**
     * Analyze a project: assign project owner role.
     * @param ProjectModelForUseWithProjectOwnerRoleMigration $project
     * @param string $projectId
     * @param string $testMode
     */
    private static function analyzeProject($project, $projectId, $testMode)
    {
        $ownerId = $project->ownerRef->id;
        $usersArray = $project->users->getArrayCopy();
        if ($project->userIsMember($ownerId) && ($usersArray[$ownerId]->role != ProjectRoles::OWNER)) {
            $project->addUser($ownerId, ProjectRoles::OWNER);
        }

        if (!$testMode) {
            $project->hasHadProjectOwnerRoleMigrated = true;
            $project->write();
        }
    }
}

/**
 * Class ProjectModelForUseWithProjectOwnerRoleMigration
 * Has a flag to store in Mongo about whether the project owner role has been migrated
 * @package Api\Library\Shared\Script\Migration
 */
class ProjectModelForUseWithProjectOwnerRoleMigration extends ProjectModel {
    public $hasHadProjectOwnerRoleMigrated;
}

FixProjectOwnerRole::run('run');
