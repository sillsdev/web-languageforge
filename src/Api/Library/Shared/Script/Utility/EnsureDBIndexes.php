<?php

namespace Api\Library\Shared\Script\Utility;

use Api\Library\Shared\Website;
use Api\Model\Languageforge\Lexicon\LexEntryModel;
use Api\Model\Languageforge\Lexicon\LexOptionListModel;
use Api\Model\Mapper\MongoStore;
use Api\Model\ProjectListModel;
use Api\Model\ProjectModel;
use Api\Model\ProjectModelMongoMapper;

define('SF_TEST_DATABASE', 'scriptureforge_test');

class EnsureDBIndexes
{
    public function run(
        /** @noinspection PhpUnusedParameterInspection */
        $userId, $mode = 'test'
    ) {
        $testMode = ($mode != 'run');
        $message = "Ensure DB Indexes\n";
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

        if ($onDevMachine || $onLocalMachine) {
            $message .= "\n-------------  Test Database:\n";
            $mainIndexesToCreate = MongoStore::getIndexesNotSetInCollection(SF_TEST_DATABASE, $mainCollectionName, $mainIndexes);
            $numberOfIndexesCreated += count($mainIndexesToCreate);
            $message .= count($mainIndexesToCreate) . " test indexes created.\n";
        }

        if (!$testMode) {
            MongoStore::ensureIndexesInCollection(SF_DATABASE, $mainCollectionName, $mainIndexes);
            if ($onDevMachine || $onLocalMachine) {
                MongoStore::ensureIndexesInCollection(SF_TEST_DATABASE, $mainCollectionName, $mainIndexes);
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
