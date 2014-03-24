<?php

namespace models\languageforge\lexicon\commands;

use models\languageforge\lexicon\LexEntryWithCommentsEncoder;

use models\ProjectModel;

use models\languageforge\lexicon\settings\LexiconConfigObj;

use models\languageforge\lexicon\LexEntryListModel;

use models\languageforge\lexicon\LexiconProjectModel;

use models\languageforge\lexicon\LexEntryModel;

use libraries\shared\palaso\CodeGuard;
use models\mapper\JsonEncoder;
use models\mapper\JsonDecoder;
use models\languageforge\lexicon\LexComment;

class LexEntryCommands {
	
	public static function readEntry($projectId, $entryId) {
		$project = new LexiconProjectModel($projectId);
		$entry = new LexEntryModel($project, $entryId);
		return LexEntryWithCommentsEncoder::encode($entry);
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
		// TODO: we need to do checking of rights for updating comments, parts of the entry, etc - cjh
		CodeGuard::checkTypeAndThrow($params, 'array');
		$project = new LexiconProjectModel($projectId);
		if (array_key_exists('id', $params) && $params['id'] != '') {
			$entry = new LexEntryModel($project, $params['id']);
		} else {
			$entry = new LexEntryModel($project);
			$entry->authorInfo->createdByIdRef = $userId;
			$entry->authorInfo->createdDate = new \DateTime();
		}
		
		// set authorInfo
		$entry->authorInfo->modifiedDate = new \DateTime();
		$entry->authorInfo->modifiedByIdRef = $userId;

		// comments should not be updated via this method
		$params = self::removeComments($params);

		JsonDecoder::decode($entry, $params);
		$entry->write();
		return LexEntryWithCommentsEncoder::encode($entry);
	}
	
	/**
	 * 
	 * @param array $entry - an array representation of an entry
	 * @return array - the entry array with comments removed
	 */
	private static function removeComments($entry) {
		foreach ($entry[LexiconConfigObj::LEXEME] as $form => $lexeme) {
			unset($entry[LexiconConfigObj::LEXEME][$form][LexiconConfigObj::COMMENTS_LIST]);
		}
		foreach ($entry[LexiconConfigObj::SENSES_LIST] as $senseKey => $sense) {
			foreach ($sense[LexiconConfigObj::DEFINITION] as $form => $definition) {
				unset($entry[LexiconConfigObj::SENSES_LIST][$senseKey][LexiconConfigObj::DEFINITION][$form][LexiconConfigObj::COMMENTS_LIST]);
			}
			unset($entry[LexiconConfigObj::SENSES_LIST][$senseKey][LexiconConfigObj::POS][LexiconConfigObj::COMMENTS_LIST]);
			unset($entry[LexiconConfigObj::SENSES_LIST][$senseKey][LexiconConfigObj::SEMDOM][LexiconConfigObj::COMMENTS_LIST]);
			foreach ($sense[LexiconConfigObj::EXAMPLES_LIST] as $exampleKey => $example) {
				foreach ($example[LexiconConfigObj::EXAMPLE_SENTENCE] as $form => $sentence) {
					unset($entry[LexiconConfigObj::SENSES_LIST][$senseKey][LexiconConfigObj::EXAMPLES_LIST][$exampleKey][LexiconConfigObj::EXAMPLE_SENTENCE][$form][LexiconConfigObj::COMMENTS_LIST]);
				}
				foreach ($example[LexiconConfigObj::EXAMPLE_TRANSLATION] as $form => $sentence) {
					unset($entry[LexiconConfigObj::SENSES_LIST][$senseKey][LexiconConfigObj::EXAMPLES_LIST][$exampleKey][LexiconConfigObj::EXAMPLE_TRANSLATION][$form][LexiconConfigObj::COMMENTS_LIST]);
				}
			}
		}
		return $entry;
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
		return LexEntryModel::remove($project, $entryId);
	}
}

?>
