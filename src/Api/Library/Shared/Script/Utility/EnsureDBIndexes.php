<?php

namespace Api\Library\Shared\Script\Utility;

use Api\Library\Shared\Website;
use Api\Model\Languageforge\Lexicon\LexEntryModel;
use Api\Model\Languageforge\Lexicon\LexOptionListModel;
use Api\Model\Shared\Mapper\MongoStore;
use Api\Model\Shared\ProjectListModel;
use Api\Model\Shared\ProjectModel;
use Api\Model\Shared\ProjectModelMongoMapper;
use Api\Model\Shared\UserRelationModelMongoMapper;

define('SF_TEST_DATABASE', 'scriptureforge_test');

class EnsureDBIndexes
{
    /**
     * @param string $userId
     * @param string $mode
     * @return string
     * @throws \Exception
     */
    public function run(
        /** @noinspection PhpUnusedParameterInspection */
        $userId, $mode = 'test'
    ) {
        $testMode = ($mode != 'run');
        $message = "Ensure DB Indexes\n";
        ini_set('max_execution_time', 300);
        $numberOfIndexesCreated = 0;

        $website = Website::get();
        $onDevMachine = strpos($website->domain, 'dev.') !== false;
        $onLocalMachine = strrpos($website->domain, '.local') !== false;

        $message .= "\n-------------  Main Database:\n";
        $mainCollectionName = ProjectModelMongoMapper::instance()->getCollectionName();
        $mainIndexes = ProjectModelMongoMapper::instance()->INDEXES_REQUIRED;
        $mainIndexesToCreate = MongoStore::getIndexesNotSetInCollection(SF_DATABASE, $mainCollectionName, $mainIndexes);
        $numberOfIndexesCreated += count($mainIndexesToCreate);
        $message .= count($mainIndexesToCreate) . " main indexes created.\n";

        $userRelationCollectionName = UserRelationModelMongoMapper::instance()->getCollectionName();
        $userRelationIndexes = UserRelationModelMongoMapper::instance()->INDEXES_REQUIRED;
        $userRelationIndexesToCreate = MongoStore::getIndexesNotSetInCollection(SF_DATABASE, $userRelationCollectionName, $userRelationIndexes);
        $numberOfIndexesCreated += count($userRelationIndexesToCreate);
        $message .= count($userRelationIndexesToCreate) . " user relation indexes created.\n";

        if (($onDevMachine || $onLocalMachine) && MongoStore::hasDB(SF_TEST_DATABASE)) {
            $message .= "\n-------------  Test Database:\n";
            $mainIndexesToCreate = MongoStore::getIndexesNotSetInCollection(SF_TEST_DATABASE, $mainCollectionName, $mainIndexes);
            $numberOfIndexesCreated += count($mainIndexesToCreate);
            $message .= count($mainIndexesToCreate) . " test indexes created for main collection.\n";

            $userRelationIndexesToCreate = MongoStore::getIndexesNotSetInCollection(SF_TEST_DATABASE, $userRelationCollectionName, $userRelationIndexes);
            $numberOfIndexesCreated += count($userRelationIndexesToCreate);
            $message .= count($userRelationIndexesToCreate) . " test indexes created for user relation collection.\n";
        }

        if (!$testMode) {
            MongoStore::ensureIndexesInCollection(SF_DATABASE, $mainCollectionName, $mainIndexes);
            MongoStore::ensureIndexesInCollection(SF_DATABASE, $userRelationCollectionName, $userRelationIndexes);
            if (($onDevMachine || $onLocalMachine) && MongoStore::hasDB(SF_TEST_DATABASE)) {
                MongoStore::ensureIndexesInCollection(SF_TEST_DATABASE, $mainCollectionName, $mainIndexes);
                MongoStore::ensureIndexesInCollection(SF_TEST_DATABASE, $userRelationCollectionName, $userRelationIndexes);
            }
        }

        // loop over every project
        $projectList = new ProjectListModel();
        $projectList->read();
        foreach ($projectList->entries as $projectParams) {
            $project = ProjectModel::getById($projectParams['id']);
            if ($project->appName == 'lexicon') {
                $message .= "\n-------------  $project->projectName project:\n";

                $lexiconCollectionName = LexEntryModel::mapper($project->databaseName())->getCollectionName();
                $lexiconIndexes = LexEntryModel::mapper($project->databaseName())->INDEXES_REQUIRED;
                $lexiconIndexesToCreate = MongoStore::getIndexesNotSetInCollection($project->databaseName(), $lexiconCollectionName, $lexiconIndexes);
                $numberOfIndexesCreated += count($lexiconIndexesToCreate);

                $optionListCollectionName = LexOptionListModel::mapper($project->databaseName())->getCollectionName();
                $optionListIndexes = LexOptionListModel::mapper($project->databaseName())->INDEXES_REQUIRED;
                $optionListIndexesToCreate = MongoStore::getIndexesNotSetInCollection($project->databaseName(), $optionListCollectionName, $optionListIndexes);
                $numberOfIndexesCreated += count($optionListIndexesToCreate);

                if ((count($lexiconIndexesToCreate) + count($optionListIndexesToCreate)) > 0) {
                    $message .= count($lexiconIndexesToCreate) . " lexicon indexes created.\n";
                    $message .= count($optionListIndexesToCreate) . " option list indexes created.\n";
                } else {
                    $message .= "No indexes needed creating.\n";
                }

                if (!$testMode) {
                    MongoStore::ensureIndexesInCollection($project->databaseName(), $lexiconCollectionName, $lexiconIndexes);
                    MongoStore::ensureIndexesInCollection($project->databaseName(), $optionListCollectionName, $optionListIndexes);
                }
            }
        }

        if ($numberOfIndexesCreated > 0) {
            $message .= "\nCreated $numberOfIndexesCreated DB Indexes.\n\n";
        } else {
            $message .= "\nAll indexes were present.\n\n";
        }

        return $message;
    }
}
