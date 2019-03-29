<?php

namespace Api\Library\Shared\Script\Migration;

use Api\Model\Languageforge\Lexicon\LexProjectModel;
use Api\Model\Shared\ProjectListModel;
use MongoDB\Client;

(php_sapi_name() == 'cli') or exit('this script must be run on the command-line');

require_once '../scriptConfig.php';

class FixMultiParagraphAddMissingParagraphsField
{
    public static function run($mode = 'test')
    {
        $testMode = ($mode != 'run');
        print("Fix MultiParagraph data structure.\n");

        $projectList = new ProjectListModel();
        $projectList->read();
        $totalProjectCount = $projectList->count;

        $skippedProjects = 0;
        $projectCount = 0;
        $updatedCount = 0;
        foreach ($projectList->entries as $projectParams) {
            $projectId = $projectParams['id'];
            $project = new LexProjectModel($projectId);
            if ($project->appName == 'lexicon') {
                list($needsWork, $entryMultiParaFields, $senseMultiParaFields, $exampleMultiParaFields) = self::findProjectMultiParagraphs($project, $testMode);
                if ($needsWork) {
                    print("\n-------------  $project->projectName.\n");
                    $projectCount++;
                    $updated = self::fixProject($project, $entryMultiParaFields, $senseMultiParaFields, $exampleMultiParaFields, $testMode);
                    if ($updated) {
                        $updatedCount++;
                    }
                } else {
                    $skippedProjects++;
                }
            } else {
                $skippedProjects++;
            }

            unset($project);
        }
        if ($projectCount >= 1) {
            print("\nProcessed $projectCount projects out of $totalProjectCount total projects\n");
        }
        if ($updatedCount > 0) {
            print("Updated entries in $updatedCount projects\n");
        }
        if ($skippedProjects > 0) {
            print("Skipped $skippedProjects projects\n");
        }
    }

    private static function findProjectMultiParagraphs($project, $testMode)
    {
        $result = false;

        $entryConfig = $project->config->entry;
        $senseConfig = $entryConfig->fields['senses'];
        $exampleConfig = $senseConfig->fields['examples'];
        $entryFields = [];
        $senseFields = [];
        $exampleFields = [];
        foreach ($entryConfig->fields as $fieldName => $entryFieldConfig) {
            if ($entryFieldConfig->type == "multiparagraph") {
                $entryFields[] = $fieldName;
                $result = true;
            }
        }
        foreach ($senseConfig->fields as $fieldName => $senseFieldConfig) {
            if ($senseFieldConfig->type == "multiparagraph") {
                $senseFields[] = $fieldName;
                $result = true;
            }
        }
        foreach ($exampleConfig->fields as $fieldName => $exampleFieldConfig) {
            if ($exampleFieldConfig->type == "multiparagraph") {
                $exampleFields[] = $fieldName;
                $result = true;
            }
        }
        return [$result, $entryFields, $senseFields, $exampleFields];
    }

    /**
     * Analyze a lexicon project and migrate MultiParagraph data structure and config
     * @param LexProjectModel $project
     * @param string[] $entryFields
     * @param string[] $senseFields
     * @param string[] $exampleFields
     * @param string $testMode
     */

    private static function fixProject($project, $entryFields, $senseFields, $exampleFields, $testMode)
    {
        $entryModifiedCount = 0;
        $multiParagraphFixedCount = 0;
        $senseModifiedCount = 0;
        $exampleModifiedCount = 0;
        $dbName = $project->databaseName();
        // Have to work with Mongo queries directly here since building a LexEntryModel will fail on precisely the entries that we need to modify
//        $entryList = LexEntryCommands::listEntries($project->id->asString());
        list($entryCount, $entryCursor) = self::getItems($dbName, "lexicon");
        foreach ($entryCursor as $entry) {
            $entryUpdate = [];
            $fieldsToUpdate = self::fixMultiParagraphs($entry, $entryFields, $multiParagraphFixedCount, $entryModified);
            foreach ($fieldsToUpdate as $field => $value) {
                $entryUpdate["customFields.$field"] = $value;
            }
            if (! empty($entry['senses'])) {
                $senseNum = 0;
                foreach ($entry['senses'] as $sense) {
                    $senseUpdate = self::fixMultiParagraphs($sense, $senseFields, $multiParagraphFixedCount, $senseModified);
                    if (! empty($sense['examples'])) {
                        $exampleNum = 0;
                        foreach ($sense['examples'] as $example) {
                            self::fixMultiParagraphs($example, $exampleFields, $multiParagraphFixedCount, $exampleModified);
                            if (!empty($exampleUpdate)) {
                                foreach ($exampleUpdate as $field => $value) {
                                    $entryUpdate["customFields.senses.$senseNum.examples.$exampleNum.$field"] = $value;
                                }
                                $exampleModifiedCount++;
                            }
                            $exampleNum++;
                        }
                    }
                    if (!empty($senseUpdate)) {
                        foreach ($senseUpdate as $field => $value) {
                            $entryUpdate["customFields.senses.$senseNum.$field"] = $value;
                        }
                        $senseModifiedCount++;
                    }
                    $senseNum++;
                }
            }
            if (!empty($entryUpdate)) {
                $mongoUpdate = ['$set' => $entryUpdate];
                $entryModifiedCount++;
                self::applyUpdate($dbName, "lexicon", $entry['_id'], $mongoUpdate, $testMode);
            }
        }

        print("$multiParagraphFixedCount multi paragraphs fixed.\n");
        print("$senseModifiedCount senses and $exampleModifiedCount examples modified.\n");
        print("$entryModifiedCount of $entryCount entries modified.\n");
        return ($entryModifiedCount > 0);
    }

    /**
     * @param array $mongoData
     * @param string[] $fieldNames
     * @param int $multiParagraphFixedCount
     * @param boolean $modelModified
     */
    private static function fixMultiParagraphs($mongoData, $fieldNames, &$multiParagraphFixedCount, &$modelModified)
    {
        $update = [];
        if (isset($mongoData['customFields'])) {
            foreach ($fieldNames as $fieldName) {
                if (isset($mongoData['customFields'][$fieldName])) {
                    if (! isset($mongoData['customFields'][$fieldName]['paragraphs'])) {
                        $modelModified = true;
                        $update[$fieldName] = ['paragraphs' => []];
                        $multiParagraphFixedCount++;
                    }
                }
            }
        }
        return $update;
    }

    private static function getItems($databaseName, $collectionName, $query = null, $options = null) {

        $_mongoClient = new Client(MONGODB_CONN, [], ['typeMap' => ['root' => 'array', 'document' => 'array', 'array' => 'array']]);
        $_db = $_mongoClient->selectDatabase($databaseName);
        $_collection = $_db->selectCollection($collectionName);

        if (is_null($query)) $query = [];
        if (is_null($options)) $options = [];
        $cursor = $_collection->find($query, $options);

        $totalCount = $_collection->count($query);

        return [$totalCount, $cursor];
    }

    private static function applyUpdate($databaseName, $collectionName, $id, $update, $testMode) {

        $_mongoClient = new Client(MONGODB_CONN, [], ['typeMap' => ['root' => 'array', 'document' => 'array', 'array' => 'array']]);
        $_db = $_mongoClient->selectDatabase($databaseName);
        $_collection = $_db->selectCollection($collectionName);

        $filter = array('_id' => $id);

        if ($testMode) {
            print("Would apply update " . print_r($update, true) . " with filter " . print_r($filter, true) . "\n");
        } else {
            return $_collection ->updateOne($filter, $update); //  ->update($data, $id, self::ID_IN_KEY, '', '');
        }
    }
}

$mode = 'test';
if (isset($argv[1])) {
    $mode = $argv[1];
}
print "Running in $mode mode\n";
FixMultiParagraphAddMissingParagraphsField::run($mode);
