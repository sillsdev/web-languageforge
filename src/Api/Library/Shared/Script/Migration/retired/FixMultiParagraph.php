<?php

namespace Api\Library\Shared\Script\Migration;

use Api\Library\Shared\Palaso\StringUtil;
use Api\Model\Languageforge\Lexicon\Command\LexEntryCommands;
use Api\Model\Languageforge\Lexicon\Config\LexConfigFieldList;
use Api\Model\Languageforge\Lexicon\Config\LexConfigMultiParagraph;
use Api\Model\Languageforge\Lexicon\LexExample;
use Api\Model\Languageforge\Lexicon\LexEntryModel;
use Api\Model\Languageforge\Lexicon\LexProjectModel;
use Api\Model\Languageforge\Lexicon\LexMultiParagraph;
use Api\Model\Languageforge\Lexicon\LexParagraph;
use Api\Model\Languageforge\Lexicon\LexSense;
use Api\Model\Mapper\ObjectForEncoding;
use Api\Model\ProjectListModel;

(php_sapi_name() == 'cli') or exit('this script must be run on the command-line');

require_once '../scriptConfig.php';

class FixMultiParagraph
{
    public static function run($mode = 'test')
    {
        $testMode = ($mode != 'run');
        print("Fix MultiParagraph data structure and config.\n");

        $projectList = new ProjectListModel();
        $projectList->read();
        $totalProjectCount = $projectList->count;

        $skippedProjects = 0;
        $projectCount = 0;
        foreach ($projectList->entries as $projectParams) {
            $projectId = $projectParams['id'];
            $project = new LexProjectModelForUseWithMultiParagraphMigration($projectId);
            if ($project->appName == 'lexicon' && !$project->hasHadMultiParagraphsMigrated) {
                if (!$project->hasSendReceive()) {
                    print("\n-------------  $project->projectName.\n");
                    $projectCount++;
                    self::analyzeProject($project, $testMode);
                } else {
                    $skippedProjects++;
                }
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
     * Analyze a lexicon project and migrate MultiParagraph data structure and config
     * @param LexProjectModelForUseWithMultiParagraphMigration $project
     * @param string $testMode
     */
    private static function analyzeProject($project, $testMode)
    {
        $entryModifiedCount = 0;
        $multiParagraphCount = 0;
        $senseModifiedCount = 0;
        $exampleModifiedCount = 0;
        $entryList = LexEntryCommands::listEntries($project->id->asString());
        foreach ($entryList->entries as $entryListItem) {
            $entryModified = false;
            $entryConfig = $project->config->entry;
            $senseConfig = $entryConfig->fields['senses'];
            $exampleConfig = $senseConfig->fields['examples'];
            $entry = new LexEntryModel($project, $entryListItem['id']);
            self::migrateMultiParagraphs($entry, $entryConfig, $multiParagraphCount, $entryModified);
            if ($entry->hasSenses()) {
                /** @var LexSense $sense */
                foreach ($entry->senses as $sense) {
                    $senseModified = false;
                    self::migrateMultiParagraphs($sense, $senseConfig, $multiParagraphCount, $senseModified);
                    if (isset($sense->examples)) {
                        /** @var LexExample $example */
                        foreach ($sense->examples as $example) {
                            $exampleModified = false;
                            self::migrateMultiParagraphs($example, $exampleConfig, $multiParagraphCount, $exampleModified);
                            if ($exampleModified) {
                                $entryModified = true;
                                $senseModified = true;
                                $exampleModifiedCount++;
                            }
                        }
                    }

                    if ($senseModified) {
                        $entryModified = true;
                        $senseModifiedCount++;
                    }
                }
            }

            if ($entryModified) {
                $entryModifiedCount++;
                if (!$testMode) {
                    $entry->write();
                }
            }
        }

        if (!$testMode) {
            $project->hasHadMultiParagraphsMigrated = true;
            $project->write();
        }
        print("$multiParagraphCount multi paragraphs found.\n");
        print("$senseModifiedCount senses and $exampleModifiedCount examples modified.\n");
        print("$entryModifiedCount of $entryList->count entries had multi paragraphs.\n");
    }

    /**
     * @param ObjectForEncoding $model
     * @param LexConfigFieldList $config
     * @param int $multiParagraphCount
     * @param boolean $modelModified
     */
    private static function migrateMultiParagraphs($model, $config, &$multiParagraphCount, &$modelModified)
    {
        if (isset($model->customFields)) {
            foreach ($model->customFields as $fieldName => $customField) {
                if (is_a($customField, 'Api\Model\Languageforge\Lexicon\LexMultiText')) {
                    $isMultiParagraph = false;
                    $multiParagraph = new LexMultiParagraph();
                    foreach ($customField as $tag => $text) {
                        if (StringUtil::startsWith($text->value, '<p>')) {
                            $isMultiParagraph = true;
                            $multiParagraphCount++;
                            $multiParagraph->inputSystem = $tag;
                            $value = substr($text->value, 3);
                            if (StringUtil::endsWith($value, '</p>')) {
                                $value = substr($value, 0, -4);
                            }
                            foreach (explode('</p><p>', $value) as $content) {
                                $paragraph = new LexParagraph();
                                if ($content) {
                                    $paragraph->content = $content;
                                }
                                $multiParagraph->paragraphs->append($paragraph);
                            }
                        }
                    }
                    if ($isMultiParagraph) {
                        $modelModified = true;
                        $model->customFields[$fieldName] = $multiParagraph;
                        if (!is_a($config->fields[$fieldName],
                            'Api\Model\Languageforge\Lexicon\Config\LexConfigMultiParagraph')
                        ) {
                            $multiParagraphConfig = new LexConfigMultiParagraph();
                            $multiParagraphConfig->label = $config->fields[$fieldName]->label;
                            $multiParagraphConfig->hideIfEmpty = $config->fields[$fieldName]->hideIfEmpty;
                            $config->fields[$fieldName] = $multiParagraphConfig;
                        }
                    }
                }
            }
        }
    }
}

/**
 * Class LexProjectModelForUseWithMultiParagraphMigration
 * Has a flag to store in Mongo whether MultiParagraphs have been migrated
 * @package Api\Library\Shared\Script\Migration
 */
class LexProjectModelForUseWithMultiParagraphMigration extends LexProjectModel {
    public $hasHadMultiParagraphsMigrated;
}

FixMultiParagraph::run('run');
