<?php

namespace models\languageforge\lexicon\commands;

use libraries\shared\palaso\CodeGuard;
use models\languageforge\lexicon\config\LexiconConfigObj;
use models\languageforge\lexicon\LexEntryModel;
use models\languageforge\lexicon\LexEntryListModel;
use models\languageforge\lexicon\LexCommentModel;
use models\languageforge\lexicon\LexiconProjectModel;
use models\mapper\JsonDecoder;
use models\mapper\JsonEncoder;
use models\ProjectModel;

class LexEntryCommands {

    // Note: this is not actually used anymore...but we'll keep it around just in case - cjh 2014-07
	public static function readEntry($projectId, $entryId) {
		$project = new LexiconProjectModel($projectId);
		$entry = new LexEntryModel($project, $entryId);
		return JsonEncoder::encode($entry);
	}

	/*
	public static function addEntry($projectId, $params) {
		CodeGuard::checkTypeAndThrow($params, 'array');
		$project = new LexiconProjectModel($projectId);
		$entry = new LexEntryModel($project);
		JsonDecoder::decode($entry, $params);
		return $entry->write();
	}
	*/
	
	public static function updateEntry($projectId, $params, $userId) {
		CodeGuard::checkTypeAndThrow($params, 'array');
		$project = new LexiconProjectModel($projectId);
		if (array_key_exists('id', $params) && $params['id'] != '') {
			$entry = new LexEntryModel($project, $params['id']);
		} else {
			$entry = new LexEntryModel($project);
			$entry->authorInfo->createdByUserRef->id = $userId;
			$entry->authorInfo->createdDate = new \DateTime();
		}
		
		// set authorInfo
		$entry->authorInfo->modifiedDate = new \DateTime();
		$entry->authorInfo->modifiedByUserRef->id = $userId;

        $params = self::recursiveRemoveEmptyFieldValues($params);
        $params = self::recursiveAlignCustomFieldsWithModel($params);
		JsonDecoder::decode($entry, $params);

		$entry->write();
		return JsonEncoder::encode($entry);
	}

    /**
     * @param array $arr
     * @return array
     */
    public static function recursiveRemoveEmptyFieldValues($arr) {
        foreach ($arr as $key => $item) {
            if ($key != 'id') {
                if (is_string($item)) {
                    if (trim($item) === '') {
                        unset($arr[$key]);
                    }
                } elseif (is_array($item)) {
                    $arr[$key] = self::recursiveRemoveEmptyFieldValues($item);
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
	 * 								if matches one of LexiconConfigObj constants (e.g. POS, DEFINITION, etc), then return a subset of entries that have one or more senses missing the specified field
	 */
	public static function listEntries($projectId, $missingInfo = '') {
		$project = new LexiconProjectModel($projectId);
		$lexEntries = new LexEntryListModel($project);
		$lexEntries->readForDto($missingInfo);
		return $lexEntries;
	}
	
	public static function removeEntry($projectId, $entryId) {
		$project = new ProjectModel($projectId);
        $entry = new LexEntryModel($project, $entryId);
        $entry->isDeleted = true;
        $entry->write();
	}

    private static function recursiveAlignCustomFieldsWithModel($params) {
        if (!array_key_exists('customFields', $params)) {
            $params['customFields'] = array();
        }
        foreach ($params as $key => $value) {
            if (preg_match('/^customField_/', $key)) {
                $params['customFields'][$key] = $value;
                unset($params[$key]);
            } elseif ($key == 'senses' || $key == 'examples') {
                $params[$key] = self::recursiveAlignCustomFieldsWithModel($params[$key]);
            }
        }
        return $params;
    }
}

?>
