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
	
	public static function addEntry($projectId, $params) {
		CodeGuard::checkTypeAndThrow($params, 'array');
		$project = new LexiconProjectModel($projectId);
		$entry = new LexEntryModel($project);
		JsonDecoder::decode($entry, $params);
		return $entry->write();
	}
	
	public static function updateEntry($projectId, $entryId, $params) {
		// TODO: we need to do checking of rights for updating comments, parts of the entry, etc - cjh
		CodeGuard::checkTypeAndThrow($params, 'array');
		$project = new LexiconProjectModel($projectId);
		$entry = new LexEntryModel($project, $entryId);
		JsonDecoder::decode($entry, $params);
		return $entry->write();
		// question (from cjh) when doing an updateEntry, is there a way for us to only update comments using the standard JsonDecoder?  Or only update parts of the model that should be updated? Need to write a test for this
		
	}
	
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
