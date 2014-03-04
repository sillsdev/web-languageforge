<?php

namespace models\languageforge\lexicon\commands;

use models\languageforge\lexicon\LexiconProjectModel;

use models\languageforge\lexicon\LexEntryModel;

use libraries\shared\palaso\CodeGuard;
use models\mapper\JsonEncoder;
use models\mapper\JsonDecoder;

class LexEntryCommands {
	
	public static function readEntry($projectId, $entryId) {
		$project = new LexiconProjectModel($projectId);
		$entry = new LexEntryModel($project);
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
}

?>
