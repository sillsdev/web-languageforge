<?php

namespace Api\Library\Shared\Script\Migration;

use Api\Model\Languageforge\Lexicon\Command\LexEntryCommands;
use Api\Model\Languageforge\Lexicon\LexExample;
use Api\Model\Languageforge\Lexicon\Guid;
use Api\Model\Languageforge\Lexicon\LexEntryModel;
use Api\Model\Languageforge\Lexicon\LexProjectModel;
use Api\Model\Languageforge\Lexicon\LexPicture;
use Api\Model\Languageforge\Lexicon\LexSense;
use Api\Model\ProjectListModel;

(php_sapi_name() == 'cli') or die('this script must be run on the command-line');

require_once('../scriptConfig.php');

class FixSenseGuids
{
    public static function run($mode = 'test')
    {
        ini_set('max_execution_time', 300); // Sufficient time to update for every project
        $testMode = ($mode == 'test');
        print("Fix Sense, Example and Picture guids.\n");

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
            $project = new LexProjectModelForUseWithSenseGuidMigration($projectId);
            if ($project->appName == 'lexicon' && !$project->hasHadSenseGuidsMigrated) {
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
     * Analyze a lexicon project and create Sense, Example and Picture guids. Remove id from Sense and Example
     * @param LexProjectModelForUseWithSenseGuidMigration $project
     * @param string $projectId
     * @param string $testMode
     */
    private static function analyzeProject($project, $projectId, $testMode)
    {
        $entryModifiedCount = 0;
        $exampleModifiedCount = 0;
        $pictureModifiedCount = 0;
        $entryList = LexEntryCommands::listEntries($projectId);
        foreach ($entryList->entries as $entryListItem) {
            $entry = new LexEntryModel($project, $entryListItem['id']);
            $entryModified = false;
            if ($entry->hasSenses()) {
                /** @var LexSense $sense */
                foreach ($entry->senses as $sense) {
                    self::createSenseGuids($sense, $entryModified, $exampleModifiedCount, $pictureModifiedCount);
                }

                if ($entryModified) {
                    $entryModifiedCount++;
                }
                if (!$testMode) {
                    $entry->write();
                }
            }
        }

        if (!$testMode) {
            $project->hasHadSenseGuidsMigrated = true;
            $project->write();
        }
        print("$exampleModifiedCount example and $pictureModifiedCount picture guids created.\n");
        print("$entryModifiedCount of $entryList->count entries had sense guids created.\n");
    }

    /**
     * @param LexSense $sense
     * @param bool $entryModified
     * @param int $exampleModifiedCount
     * @param int $pictureModifiedCount
     */
    private static function createSenseGuids($sense, &$entryModified, &$exampleModifiedCount = 0, &$pictureModifiedCount = 0)
    {
        $senseModified = false;
        unset($sense->id);
        if (!$sense->guid || !Guid::isValid($sense->guid)) {
            $liftGuid = Guid::extract($sense->liftId);
            if (Guid::isValid($liftGuid)) {
                $sense->guid = $liftGuid;
            } else {
                $sense->guid = Guid::create();
            }
            $senseModified = true;
        }

        if (isset($sense->examples)) {
            /** @var LexExample $example */
            foreach ($sense->examples as $example) {
                unset($example->id);
                if (!$example->guid || !Guid::isValid($example->guid)) {
                    $liftGuid = Guid::extract($example->liftId);
                    if (Guid::isValid($liftGuid)) {
                        $example->guid = $liftGuid;
                    } else {
                        $example->guid = Guid::create();
                    }
                    $exampleModifiedCount++;
                    $senseModified = true;
                }
            }
        }

        if (isset($sense->pictures)) {
            /** @var LexPicture $picture */
            foreach ($sense->pictures as $picture) {
                if (!$picture->guid || !Guid::isValid($picture->guid)) {
                    $picture->guid = Guid::create();
                    $pictureModifiedCount++;
                    $senseModified = true;
                }
            }
        }

        if ($senseModified) {
            $entryModified = true;
        }
    }
}

/**
 * Class LexProjectModelForUseWithSenseGuidMigration
 * Has a flag to store in Mongo about whether the sense guids have been migrated
 * @package Api\Library\Shared\Script\Migration
 */
class LexProjectModelForUseWithSenseGuidMigration extends LexProjectModel {
    public $hasHadSenseGuidsMigrated;
}

FixSenseGuids::run('run');
