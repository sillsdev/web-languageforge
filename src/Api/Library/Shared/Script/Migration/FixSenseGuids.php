<?php

namespace Api\Library\Shared\Script\Migration;

use Api\Model\Languageforge\Lexicon\Command\LexEntryCommands;
use Api\Model\Languageforge\Lexicon\Example;
use Api\Model\Languageforge\Lexicon\GuidHelper;
use Api\Model\Languageforge\Lexicon\LexEntryModel;
use Api\Model\Languageforge\Lexicon\LexiconProjectModel;
use Api\Model\Languageforge\Lexicon\Picture;
use Api\Model\Languageforge\Lexicon\Sense;
use Api\Model\ProjectListModel;
use Api\Model\ProjectModel;

class FixSenseGuids
{
    public function run($userId, $mode = 'test')
    {
        ini_set('max_execution_time', 300); // Sufficient time to update for every project
        $testMode = ($mode == 'test');
        $message = "Fix Sense, Example and Picture guids.\n";

        $projectList = new ProjectListModel();
        $projectList->read();

        $lfProjectCount = 0;
        foreach ($projectList->entries as $projectParams) {
            $projectId = $projectParams['id'];
            $project = new ProjectModel($projectId);
            if ($project->appName == 'lexicon') {
                $project = new LexiconProjectModel($projectId);
                $message .= "\n-------------  $project->projectName.\n";
                $lfProjectCount++;
                if (!$project->hasSendReceive()) {
                    $this->analyzeProject($project, $projectId, $testMode, $message);
                } else {
                    $message .= "S/R project skipped.\n";
                }
            }
        }
        $message .= "\nProcessed $lfProjectCount projects.\n";

        return $message;
    }

    /**
     * Analyze a lexicon project and create Sense, Example and Picture guids. Remove id from Sense and Example
     * @param LexiconProjectModel $project
     * @param string $projectId
     * @param string $testMode
     * @param string $message
     */
    private function analyzeProject($project, $projectId, $testMode, &$message)
    {
        $entryModifiedCount = 0;
        $exampleModifiedCount = 0;
        $pictureModifiedCount = 0;
        $entryList = LexEntryCommands::listEntries($projectId);
        foreach ($entryList->entries as $entryListItem) {
            $entry = new LexEntryModel($project, $entryListItem['id']);
            $entryModified = false;
            if ($entry->hasSenses()) {
                /** @var Sense $sense */
                foreach ($entry->senses as $sense) {
                    $this->createSenseGuids($sense, $entryModified, $exampleModifiedCount, $pictureModifiedCount);
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
            $project->write();
        }
        $message .= "$exampleModifiedCount example and $pictureModifiedCount picture guids created.\n";
        $message .= "$entryModifiedCount of $entryList->count entries had sense guids created.\n";
    }

    /**
     * @param Sense $sense
     * @param bool $entryModified
     * @param int $exampleModifiedCount
     * @param int $pictureModifiedCount
     */
    private function createSenseGuids($sense, &$entryModified, &$exampleModifiedCount = 0, &$pictureModifiedCount = 0)
    {
        $senseModified = false;
        unset($sense->id);
        if (!$sense->guid || !GuidHelper::isValid($sense->guid)) {
            if (GuidHelper::isValid($sense->liftId)) {
                $sense->guid = $sense->liftId;
            } else {
                $sense->guid = GuidHelper::create();
            }
            $senseModified = true;
        }

        if (isset($sense->examples)) {
            /** @var Example $example */
            foreach ($sense->examples as $example) {
                unset($example->id);
                if (!$example->guid || !GuidHelper::isValid($example->guid)) {
                    if (GuidHelper::isValid($example->liftId)) {
                        $example->guid = $example->liftId;
                    } else {
                        $example->guid = GuidHelper::create();
                    }
                    $exampleModifiedCount++;
                    $senseModified = true;
                }
            }
        }

        if (isset($sense->pictures)) {
            /** @var Picture $example */
            foreach ($sense->pictures as $picture) {
                if (!$picture->guid || !GuidHelper::isValid($picture->guid)) {
                    $picture->guid = GuidHelper::create();
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
