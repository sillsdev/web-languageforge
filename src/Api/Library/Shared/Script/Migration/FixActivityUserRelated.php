<?php

namespace Api\Library\Shared\Script\Migration;

use Api\Model\Shared\ActivityModel;
use Api\Model\Shared\Mapper\MongoMapper;
use Api\Model\Shared\ProjectListModel;
use Api\Model\Shared\ProjectModel;

(php_sapi_name() == 'cli') or die('this script must be run on the command-line');

require_once('../scriptConfig.php');

/**
 * Migration script to swap 'user' and 'user2' on type ActivityModel::UPDATE_LEX_REPLY or ActivityModel::ADD_LEX_REPLY
 * and rename 'user2' to 'userRelated'
 * @package Api\Library\Shared\Script\Migration
 */
class FixActivityUserRelated
{
    /**
     * @param string $mode
     * @throws \Exception
     */
    public static function run($mode = 'test')
    {
        $testMode = ($mode != 'run');
        print("Swap 'user' and 'user2' on ActivityModel type UPDATE_LEX_REPLY or ADD_LEX_REPLY. Rename 'user2' to 'userRelated'.\n");

        $projectList = new ProjectListModel();
        $projectList->read();
        $renameCount = 0;
        $swapCount = 0;

        foreach ($projectList->entries as $projectParams) { // foreach existing project
            $projectId = $projectParams['id'];
            $project = new ProjectModel($projectId);
            print("\n-------------  $project->projectName.\n");
            $activityEntries = ActivityListDto_lf_v1_5::getActivityForProject($project);
            foreach ($activityEntries as $activityEntry) {
                $activityId = $activityEntry['id'];
                $activityOld = new ActivityModel_lf_v1_5($project);
                $properties = [
                    '_id' => MongoMapper::mongoID($activityId),
                    'userRef2' => ['$exists' => true]
                ];
                if ($activityOld->readByProperties($properties)) {
                    if (($activityOld->action == ActivityModel_lf_v1_5::UPDATE_LEX_REPLY ||
                        $activityOld->action == ActivityModel_lf_v1_5::ADD_LEX_REPLY)
                    ) {
                        $swapCount++;
                        $userRef2 = $activityOld->userRef;
                        $activityOld->userRef = $activityOld->userRef2;
                        $activityOld->userRef2 = $userRef2;

                        $user = null;
                        if (array_key_exists(ActivityModel_lf_v1_5::USER, $activityOld->actionContent)) {
                            $user = $activityOld->actionContent[ActivityModel_lf_v1_5::USER];
                        }
                        $user2 = null;
                        if (array_key_exists(ActivityModel_lf_v1_5::USER2, $activityOld->actionContent)) {
                            $user2 = $activityOld->actionContent[ActivityModel_lf_v1_5::USER2];
                        }
                        $activityOld->actionContent[ActivityModel_lf_v1_5::USER] = $user2;
                        $activityOld->actionContent[ActivityModel_lf_v1_5::USER2] = $user;
                    }

                    $renameCount++;
                    $activity = new ActivityModel($project, $activityId);
                    $activity->userRef = $activityOld->userRef;
                    $activity->userRefRelated = $activityOld->userRef2;
                    $activityOld->userRef2 = null;
                    if (array_key_exists(ActivityModel_lf_v1_5::USER, $activityOld->actionContent)) {
                        unset($activity->actionContent[ActivityModel_lf_v1_5::USER]);
                        if ($activityOld->actionContent[ActivityModel_lf_v1_5::USER] != null) {
                            $activity->actionContent[ActivityModel::USER] = $activityOld->actionContent[ActivityModel_lf_v1_5::USER];
                        }
                    }
                    if (array_key_exists(ActivityModel_lf_v1_5::USER2, $activityOld->actionContent)) {
                        unset($activity->actionContent[ActivityModel_lf_v1_5::USER2]);
                        if ($activityOld->actionContent[ActivityModel_lf_v1_5::USER2] != null) {
                            $activity->actionContent[ActivityModel::USER_RELATED] = $activityOld->actionContent[ActivityModel_lf_v1_5::USER2];
                        }
                    }

                    if (!$testMode) {
                        $activityOld->write();
                        $activity->write();
                    }
                }
            }
        }

        if ($renameCount > 0) {
            print("\n-------------  $mode mode results:\n");
            print "$renameCount activities needed fields renamed.\n";
            print "$swapCount activities needed fields to be swapped.\n";
        } else {
            print "\nNo projects needed fixing\n";
        }
    }
}

$mode = 'test';
if (isset($argv[1])) {
    $mode = $argv[1];
}
print "Running in $mode mode\n";
try {
    FixActivityUserRelated::run($mode);
} catch (\Exception $e) {
    $message = $e->getMessage();
    print('Exception ' . $message);
}
