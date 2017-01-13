<?php

namespace Api\Library\Shared\Script\Migration;

use Api\Model\Languageforge\Lexicon\Guid;
use Api\Model\Languageforge\Lexicon\LexEntryModel;
use Api\Model\Languageforge\Lexicon\LexProjectModel;
use Api\Model\Shared\Mapper\ArrayOf;
use Api\Model\Shared\Mapper\MapperListModel;
use Api\Model\Shared\Mapper\MongoMapper;
use Api\Model\Shared\ProjectListModel;
use Api\Model\Shared\ProjectModel;
use MongoDB\BSON\UTCDateTime;

(php_sapi_name() == 'cli') or die('this script must be run on the command-line');

require_once('../scriptConfig.php');

class FixEntryGuids
{
    public static function run($mode = 'test')
    {
        $testMode = ($mode != 'run');
        print("Fix Entry guids.\n");

        $projectList = new ProjectListModel();
        $projectList->read();
        $totalProjectCount = $projectList->count;
        $skippedProjects = 0;
        $projectCount = 0;
        foreach ($projectList->entries as $projectListItem) {
            $project = new LexProjectModelForEntryGuidMigration($projectListItem['id']);
            if ($project->appName == 'lexicon' && !$project->hasHadEntryGuidMigrated && !$project->hasSendReceive()) {
                print("\n-------------  $project->projectName\n");
                $projectCount++;
                self::analyzeProject($project, $testMode);
            } else {
                $skippedProjects++;
            }

            unset($project);
            if ($projectCount >= 1) {
                print("\nProcessed projects " . ($skippedProjects + 1) . " - " .
                    ($skippedProjects + $projectCount) . " of $totalProjectCount projects\n");
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
     * @param string $testMode
     * @internal param string $projectId
     */
    private static function analyzeProject($project, $testMode)
    {
        $entryModifiedCount = 0;
        $entryList = new LexAllEntryListModel($project);
        $entryList->read();
        foreach ($entryList->entries as $entryListItem) {
            $entry = new LexEntryModel($project, $entryListItem['id']);
            if (!isset($entry->guid) || !$entry->guid || !Guid::isValid($entry->guid)) {
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

        print("$entryModifiedCount of $entryList->count entries had guids created.\n");
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

class LexAllEntryListModel extends MapperListModel {
    /**
     * Returns all entries (includes deleted entries)
     *
     * @param ProjectModel $projectModel
     * @param int $newerThanTimestamp
     * @param int $limit
     * @param int $skip
     */
    public function __construct($projectModel, $newerThanTimestamp = null, $limit = 0, $skip = 0)
    {
        // for use with read()
        $this->entries = new ArrayOf(function () use ($projectModel) { return new LexEntryModel($projectModel); });

        if (!is_null($newerThanTimestamp)) {
            $startDate = new UTCDateTime(1000*$newerThanTimestamp);
            parent::__construct(self::mapper($projectModel->databaseName()), array('dateModified'=> array('$gte' => $startDate)), array(), array(), $limit, $skip);
        } else {
            parent::__construct(self::mapper($projectModel->databaseName()), array(), array(), array(), $limit, $skip);
        }
    }

    public static function mapper($databaseName)
    {
        /** @var MongoMapper $instance */
        static $instance = null;
        if (null === $instance || $instance->databaseName() != $databaseName) {
            $instance = new MongoMapper($databaseName, 'lexicon');
        }

        return $instance;
    }
}

FixEntryGuids::run('run');
