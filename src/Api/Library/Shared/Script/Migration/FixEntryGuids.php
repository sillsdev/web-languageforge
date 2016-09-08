<?php

namespace Api\Library\Shared\Script\Migration;

use Api\Model\Languageforge\Lexicon\Command\LexEntryCommands;
use Api\Model\Languageforge\Lexicon\Guid;
use Api\Model\Languageforge\Lexicon\LexEntryModel;
use Api\Model\Languageforge\Lexicon\LexProjectModel;
use Api\Model\ProjectListModel;

(php_sapi_name() == 'cli') or die('this script must be run on the command-line');

require_once('../scriptConfig.php');

class FixEntryGuids
{
    public static function run($mode = 'test')
    {
        ini_set('max_execution_time', 300); // Sufficient time to update for every project
        $testMode = ($mode == 'test');
        print("Fix Entry guids.\n");

        $projectList = new ProjectListModel();
        $projectList->read();
        $totalProjectCount = $projectList->count;

        // Because of the time needed to process projects, we'll limit the
        // migration script to run in batches of this many projects per run.
        $maxNumProjects = 1;

        $skippedProjects = 0;
        $lfProjectCount = 0;
        foreach ($projectList->entries as $projectParams) {
            $projectId = $projectParams['id'];
            $project = new LexProjectModelForEntryGuidMigration($projectId);
            if ($project->appName == 'lexicon' && !$project->hasHadEntryGuidMigrated) {
                if (!$project->hasSendReceive()) {
                    print("\n-------------  $project->projectName.\n");
                    $lfProjectCount++;
                    self::analyzeProject($project, $projectId, $testMode);
                } else {
                    continue;
                }
            } else {
                $skippedProjects++;
            }

            unset($project);
            if ($lfProjectCount >= $maxNumProjects) {
                print("\nProcessed projects " . ($skippedProjects + 1) . " - " .
                    ($skippedProjects + $lfProjectCount) . " of $totalProjectCount projects\n");
                break;
            }
        }
        if ($skippedProjects > 0) {
            print("Skipped $skippedProjects projects\n");
        }
    }

    /**
     * Analyze a lexicon project and create Entry guids.
     * @param LexProjectModelForEntryGuidMigration $project
     * @param string $projectId
     * @param string $testMode
     */
    private static function analyzeProject($project, $projectId, $testMode)
    {
        $entryModifiedCount = 0;
        $entryList = LexEntryCommands::listEntries($projectId);
        foreach ($entryList->entries as $entryListItem) {
            $entry = new LexEntryModel($project, $entryListItem['id']);
            if (!$entry->guid || !Guid::isValid($entry->guid)) {
                $entry->guid = Guid::create();
                $entryModifiedCount++;

                if (!$testMode) {
                    $entry->write();
                }
            }
        }

        if (!$testMode) {
            $project->hasHadEntryGuidMigrated = true;
            $project->write();
        }

        print("$entryModifiedCount of $entryList->count entries had sense guids created.\n");
    }
}

/**
 * Class LexProjectModelForEntryGuidMigration
 * Has a flag to store in Mongo whether the entry guid has been migrated
 * @package Api\Library\Shared\Script\Migration
 */
class LexProjectModelForEntryGuidMigration extends LexProjectModel {
    public $hasHadEntryGuidMigrated;
}

FixEntryGuids::run('test');
