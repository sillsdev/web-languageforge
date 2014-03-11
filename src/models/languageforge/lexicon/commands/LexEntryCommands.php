<?php

namespace models\languageforge\lexicon\commands;

use models\languageforge\lexicon\settings\LexiconConfigObj;

use models\languageforge\lexicon\LexEntryListModel;

use models\languageforge\lexicon\LexiconProjectModel;

use models\languageforge\lexicon\LexEntryModel;

use libraries\shared\palaso\CodeGuard;
use models\mapper\JsonEncoder;
use models\mapper\JsonDecoder;

class LexEntryCommands {
	
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
	
	public static function updateEntry($projectId, $params) {
		// TODO: we need to do checking of rights for updating comments, parts of the entry, etc - cjh
		CodeGuard::checkTypeAndThrow($params, 'array');
		$project = new LexiconProjectModel($projectId);
		// TODO: sanitize the params coming in - unset comments on each node? - cjh
		if (array_key_exists('id', $params) && $params['id'] != '') {
			$entry = new LexEntryModel($project, $entryId);
		} else {
			$entry = new LexEntryModel($project);
		}
		JsonDecoder::decode($entry, $params);
		return $entry->write();
		// question (from cjh) when doing an updateEntry, is there a way for us to only update comments using the standard JsonDecoder?  Or only update parts of the model that should be updated? Need to write a test for this
		
	}
	
	public static function updateLexemeComment($projectId, $entryId, $params) {}
	public static function updateLexemeReply($projectId, $entryId, $commentId, $params) {}
	
	public static function updateSenseComment($projectId, $entryId, $senseId, $senseNode, $params) {}
	public static function updateSenseReply($projectId, $entryId, $senseId, $senseNode, $commentId, $params) {}
	
	public static function updateExampleComment($projectId, $entryId, $senseId, $exampleId, $exampleNode, $params) {}
	public static function updateExampleReply($projectId, $entryId, $senseId, $exampleId, $exampleNode, $commentId, $params) {}

	public static function removeEntries($projectId, $entryIds) {
		CodeGuard::checkTypeAndThrow($entryIds, 'array');
		$project = new LexiconProjectModel($projectId);
		foreach ($entryIds as $id) {
			LexEntryModel::remove($project, $id);
		}
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
		$lexEntries->read($missingInfo);
		return $lexEntries;
	}
}

?>
