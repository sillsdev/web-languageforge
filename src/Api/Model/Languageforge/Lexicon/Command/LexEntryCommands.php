<?php

namespace Api\Model\Languageforge\Lexicon\Command;

use Api\Model\Command\ActivityCommands;
use Api\Model\Command\ProjectCommands;
use Api\Model\Languageforge\Lexicon\Config\LexiconConfigObj;
use Api\Model\Languageforge\Lexicon\Guid;
use Api\Model\Languageforge\Lexicon\LexEntryModel;
use Api\Model\Languageforge\Lexicon\LexEntryListModel;
use Api\Model\Languageforge\Lexicon\LexiconProjectModel;
use Api\Model\Mapper\JsonEncoder;
use Api\Model\ProjectModel;
use Palaso\Utilities\CodeGuard;

class LexEntryCommands
{
    // Note: this is not actually used anymore...but we'll keep it around just in case - cjh 2014-07
    public static function readEntry($projectId, $entryId)
    {
        $project = new LexiconProjectModel($projectId);
        $entry = new LexEntryModel($project, $entryId);

        return JsonEncoder::encode($entry);
    }

    /*
    public static function addEntry($projectId, $params)
    {
        CodeGuard::checkTypeAndThrow($params, 'array');
        $project = new LexiconProjectModel($projectId);
        $entry = new LexEntryModel($project);
        JsonDecoder::decode($entry, $params);
        return $entry->write();
    }
    */

    /**
     * Updates the given LexEntry in $projectId
     * @param string $projectId
     * @param array $params
     * @param string $userId
     * @param string $mergeQueuePath
     * @param string $pidFilePath
     * @param string $command
     * @return bool|array<encoded LexEntryModel> if the project is syncing (or on hold) return false (no save)FixSe
     */
    public static function updateEntry($projectId, $params, $userId, $mergeQueuePath = null, $pidFilePath = null, $command = null)
    {
        CodeGuard::checkTypeAndThrow($params, 'array');
        $project = new LexiconProjectModel($projectId);
        ProjectCommands::checkIfArchivedAndThrow($project);
        if (array_key_exists('id', $params) && $params['id'] != '') {
            $entry = new LexEntryModel($project, $params['id']);
            $action = 'update';
        } else {
            $entry = new LexEntryModel($project);
            $entry->authorInfo->createdByUserRef->id = $userId;
            $entry->authorInfo->createdDate = new \DateTime();
            $entry->guid = Guid::create();
            $action = 'create';
            // TODO: Consider adding more specific activity entry: which fields were modified? 2014-09-03 RM
            // E.g., "User _____ updated entry _____ by adding a new sense with definition ______"
        }

        $entry->authorInfo->modifiedDate = new \DateTime();
        $entry->authorInfo->modifiedByUserRef->id = $userId;

        if ($project->hasSendReceive()) {
//            $entry->dirtySR++;
            $entry->dirtySR = 0;
            $status = SendReceiveCommands::getProjectStatus($projectId);
            if ($status && $status['SRState'] != 'IDLE') return false;
        }

        $params = self::recursiveRemoveEmptyFieldValues($params);
        LexEntryDecoder::decode($entry, $params);

        $entry->write();
        ActivityCommands::writeEntry($project, $userId, $entry, $action);

//        SendReceiveCommands::queueProjectForUpdate($project, $mergeQueuePath);
//        SendReceiveCommands::startLFMergeIfRequired($projectId, 'merge', $pidFilePath, $command);

        return JsonEncoder::encode($entry);
    }

    /**
     * @param  array $arr
     * @return array
     */
    public static function recursiveRemoveEmptyFieldValues($arr)
    {
        foreach ($arr as $key => $item) {
            if ($key != 'id') {
                if (is_string($item)) {
                    if (trim($item) === '') {
                        unset($arr[$key]);
                    }
                } elseif (is_array($item)) {
                    $arr[$key] = self::recursiveRemoveEmptyFieldValues($item);
                    if (count($arr[$key]) == 0) {
                        unset($arr[$key]);
                    }
                } else {
                    // don't do anything for other types (e.g. boolean)
                }
            }
        }

        return $arr;
    }

    /**
     *
     * @param string $projectId
     * @param string $missingInfo - if empty, returns all entries.
     *                                 if matches one of LexiconConfigObj constants (e.g. POS, DEFINITION, etc), then return a subset of entries that have one or more senses missing the specified field
     * @return LexEntryListModel
     */
    public static function listEntries($projectId, $missingInfo = '')
    {
        $project = new LexiconProjectModel($projectId);
        $lexEntries = new LexEntryListModel($project);
        $lexEntries->readForDto($missingInfo);

        return $lexEntries;
    }

    public static function removeEntry($projectId, $entryId, $userId)
    {
        $project = new ProjectModel($projectId);
        $entry = new LexEntryModel($project, $entryId);
        $entry->isDeleted = true;
        $entry->write();
        ActivityCommands::deleteEntry($project, $userId, $entryId);
        return true;
    }

    /**
     * @param string $projectId
     * @param string $entryId
     * @return string
     */
    public static function getEntryLexeme($projectId, $entryId) {
        $project = new LexiconProjectModel($projectId);
        $entry = new LexEntryModel($project, $entryId);
        $inputSystems = $project->config->entry->fields[LexiconConfigObj::LEXEME]->inputSystems;
        foreach ($inputSystems as $inputSystem) {
            if (array_key_exists($inputSystem, $entry->lexeme) && !empty($entry->lexeme[$inputSystem])) {
                return $entry->lexeme[$inputSystem]->value;
            }
        }
        return ''; // TODO: Decide what to return for "not found", if empty string is not suitable.
    }

}
