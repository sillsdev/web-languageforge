<?php

namespace Api\Model\Languageforge\Lexicon\Command;

use Api\Model\Languageforge\Lexicon\Config\LexConfig;
use Api\Model\Languageforge\Lexicon\Config\LexConfigFieldList;
use Api\Model\Languageforge\Lexicon\Config\LexConfiguration;
use Api\Model\Languageforge\Lexicon\Guid;
use Api\Model\Languageforge\Lexicon\LexEntryModel;
use Api\Model\Languageforge\Lexicon\LexEntryListModel;
use Api\Model\Languageforge\Lexicon\LexProjectModel;
use Api\Model\Shared\ActivityModel;
use Api\Model\Shared\Command\ActivityCommands;
use Api\Model\Shared\Command\ProjectCommands;
use Api\Model\Shared\DeepDiff\DeepDiffDecoder;
use Api\Model\Shared\Mapper\JsonEncoder;
use Api\Model\Shared\ProjectModel;
use Litipk\Jiffy\UniversalTimestamp;
use Palaso\Utilities\CodeGuard;

class LexEntryCommands
{
    // Note: this is not actually used anymore...but we'll keep it around just in case - cjh 2014-07
    public static function readEntry($projectId, $entryId)
    {
        $project = new LexProjectModel($projectId);
        $entry = new LexEntryModel($project, $entryId);

        return JsonEncoder::encode($entry);
    }

    /*
    public static function addEntry($projectId, $params)
    {
        CodeGuard::checkTypeAndThrow($params, 'array');
        $project = new LexProjectModel($projectId);
        $entry = new LexEntryModel($project);
        JsonDecoder::decode($entry, $params);
        return $entry->write();
    }
    */

    private static function lookupFieldLabel(LexConfigFieldList $fieldList, array $parts)
    {
        $currentList = $fieldList;
        // Overwritten at each step of the foreach loop, except when that step isn't a field name (i.e., for language codes)
        // So "newValue.lexeme.en" will set $result for the "lexeme" field but not for "en", since that's not a field
        $result = "";
        foreach ($parts as $part) {
            // Strip away anything after a @ character
            $fieldName = explode("@", $part, 2)[0];
            if ($currentList->fields->offsetExists($fieldName)) {
                /** @var LexConfig $fieldConfig */
                $fieldConfig = $currentList->fields[$fieldName];
                $result = $fieldConfig->label;
                if ($fieldConfig->type === LexConfig::FIELDLIST) {
                    $currentList = $fieldConfig;
                }
            } else {
                // If we can't find a label, use the field name as that's better than nothing
                if (empty($result)) {
                    $result = $fieldName;
                }
            }
        }
        return $result;
    }

    /**
     * @param LexConfiguration $projectConfig
     * @param array $differences
     * @return array
     */
    public static function addFieldLabelsToDifferences(LexConfiguration $projectConfig, array $differences)
    {
        $result = $differences;
        foreach ($differences as $key => $value) {
            // Key will look like "newValue.senses#482f60da-b32a-45b9-9450-ee8f24791557.definition.en"
            $parts = explode(".", $key);
            if (empty($parts)) {
                continue;
            }
            $restOfKeyParts = array_slice($parts, 1);
            $restOfKey = implode(".", $restOfKeyParts);
            if (array_key_exists(ActivityModel::FIELD_LABEL . "." . $restOfKey, $result)) {
                continue; // Only need to look up labels once
            }
            $fieldLabel = static::lookupFieldLabel($projectConfig->entry, $restOfKeyParts);
            $result[ActivityModel::FIELD_LABEL . "." . $restOfKey] = $fieldLabel;
        }
        return $result;
    }

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
    public static function updateEntry(
        $projectId,
        $params,
        $userId,
        $mergeQueuePath = null,
        $pidFilePath = null,
        $command = null
    ) {
        CodeGuard::checkTypeAndThrow($params, "array");
        $project = new LexProjectModel($projectId);
        ProjectCommands::checkIfArchivedAndThrow($project);
        $now = UniversalTimestamp::now();
        $project->lastEntryModifiedDate = $now;
        if (array_key_exists("id", $params) && $params["id"] != "") {
            $entry = new LexEntryModel($project, $params["id"]);
            $oldEntry = new LexEntryModel($project, $params["id"]); // NOT $entry = $oldEntry
            $action = "update";
        } else {
            $entry = new LexEntryModel($project);
            $entry->authorInfo->createdByUserRef->id = $userId;
            $entry->authorInfo->createdDate = $now;
            $entry->guid = Guid::create();
            $action = "create";
            // TODO: Consider adding more specific activity entry: which fields were modified? 2014-09-03 RM
            // E.g., "User _____ updated entry _____ by adding a new sense with definition ______"
        }

        $entry->authorInfo->modifiedDate = $now;
        $entry->authorInfo->modifiedByUserRef->id = $userId;

        if ($project->hasSendReceive()) {
            //            $entry->dirtySR++;
            $entry->dirtySR = 0;
            if (SendReceiveCommands::isInProgress($projectId)) {
                return false;
            }
        }

        if (array_key_exists("_update_deep_diff", $params)) {
            $deepDiff = $params["_update_deep_diff"];
            DeepDiffDecoder::applyDeepDiff($entry, $deepDiff);
        } else {
            LexEntryDecoder::decode($entry, $params);
        }

        if ($action === "update") {
            $differences = $oldEntry->calculateDifferences($entry);
            $differences = static::addFieldLabelsToDifferences($project->config, $differences);
        } else {
            $differences = null; // TODO: Do we want differences even on a brand-new, added, entry?
        }

        $entry->write();
        $project->write();
        ActivityCommands::writeEntry($project, $userId, $entry, $action, $differences);

        //        SendReceiveCommands::queueProjectForUpdate($project, $mergeQueuePath);

        return JsonEncoder::encode($entry);
    }

    /**
     * @param string $projectId
     * @param string $missingInfo - if empty, returns all entries.
     *          if matches one of LexConfig constants (e.g. POS, DEFINITION, etc), then return a subset of entries that have one or more senses missing the specified field
     * @return LexEntryListModel
     */
    public static function listEntries($projectId, $missingInfo = "")
    {
        $project = new LexProjectModel($projectId);
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
    public static function getEntryLexeme($projectId, $entryId)
    {
        $project = new LexProjectModel($projectId);
        $entry = new LexEntryModel($project, $entryId);
        $inputSystems = $project->config->entry->fields[LexConfig::LEXEME]->inputSystems;
        foreach ($inputSystems as $inputSystem) {
            if ($entry->lexeme->offsetExists($inputSystem) && !empty($entry->lexeme[$inputSystem])) {
                return $entry->lexeme[$inputSystem]->value;
            }
        }
        return ""; // TODO: Decide what to return for "not found", if empty string is not suitable.
    }
}
