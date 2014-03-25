<?php

namespace models\languageforge\lexicon;

use models\mapper\ArrayOf;
use models\languageforge\lexicon\settings\LexiconConfigObj;

class LiftImport {
	
	/**
	 * @param string $xml
	 * @param LexiconProjectModel $projectModel
	 * @param LiftMergeRule $mergeRule
	 * @param boolean $skipSameModTime
	 * @throws \Exception
	 */
	public static function merge($xml, $projectModel, $mergeRule = LiftMergeRule::CREATE_DUPLICATES, $skipSameModTime = true, $deleteMatchingEntry = false) {
// 		self::validate($xml);	// TODO Fix. The XML Reader validator doesn't work with <optional> in the RelaxNG schema. IJH 2014-03
		
		$entryList = new LexEntryListModel($projectModel);
		$entryList->read();
		if ($entryList->count <= 0) {
			// clear entry field input systems settings if their are no entries (only use imported input systems)
			$projectModel->settings->entry->fields[LexiconConfigObj::LEXEME]->inputSystems = new ArrayOf();
			$projectModel->settings->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::DEFINITION]->inputSystems = new ArrayOf();
			$projectModel->settings->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::GLOSS]->inputSystems = new ArrayOf();
			$projectModel->settings->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::EXAMPLES_LIST]->fields[LexiconConfigObj::EXAMPLE_SENTENCE]->inputSystems = new ArrayOf();
			$projectModel->settings->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::EXAMPLES_LIST]->fields[LexiconConfigObj::EXAMPLE_TRANSLATION]->inputSystems = new ArrayOf();
		}
				
		$reader = new \XMLReader();
		$reader->XML($xml);
		
		while ($reader->read()) {
			if ($reader->nodeType == \XMLReader::ELEMENT && $reader->localName == 'entry') {   // Reads the LIFT file and searches for the entry node
				$node = $reader->expand();
				$dom = new \DomDocument();
				$n = $dom->importNode($node, true); // expands the node for that particular guid
				$sxeNode = simplexml_import_dom($n);
				
				$guid = $reader->getAttribute('guid');
				$existingEntry = $entryList->searchEntriesFor('guid', $guid);
				if ($existingEntry) {
					$entry = new LexEntryModel($projectModel, $existingEntry['id']);
					$dateModified = $reader->getAttribute('dateModified');
					if (self::differentModTime($dateModified, $entry->authorInfo->modifiedDate) || ! $skipSameModTime) {
						if ($mergeRule == LiftMergeRule::CREATE_DUPLICATES) {
							$entry = new LexEntryModel($projectModel);
							LiftDecoder::decode($projectModel, $sxeNode, $entry, $mergeRule);
							$entry->guid = '';
							$entry->write();
						} else {
							if (isset($sxeNode->{'lexical-unit'})) {
								LiftDecoder::decode($projectModel, $sxeNode, $entry, $mergeRule);
								$entry->write();
							} else if (isset($sxeNode->attributes()->dateDeleted) && $deleteMatchingEntry) {
								LexEntryModel::remove($projectModel, $existingEntry['id']);
							}
						}
					} else {
						// skip because same mod time and skip enabled
						if (! isset($sxeNode->{'lexical-unit'}) && isset($sxeNode->attributes()->dateDeleted) && $deleteMatchingEntry) {
							LexEntryModel::remove($projectModel, $existingEntry['id']);
						}
					}
				} else {
					if (isset($sxeNode->{'lexical-unit'})) {
						$entry = new LexEntryModel($projectModel);
						LiftDecoder::decode($projectModel, $sxeNode, $entry, $mergeRule);
						$entry->write();
					}
				}
			}
		}
	}

	/**
	 * validate the lift data
	 * @param string $xml
	 * @throws \Exception
	 * @return boolean
	 */
	public static function validate($xml) {
		$reader = new \XMLReader();
		$reader->XML($xml);
		
		// validate LIFT
		set_error_handler(function ($errno, $errstr, $errfile, $errline, array $errcontext) {
			// error was suppressed with the @-operator
			if (0 === error_reporting()) {
				return false;
			}

			$validationErrorIndex = strpos($errstr, 'XMLReader::next(): ');
			if ($validationErrorIndex !== false) {
				$errMsg = substr($errstr, $validationErrorIndex + 19);
				throw new \Exception("Sorry, the selected LIFT file is invalid: $errMsg");
			} else {
				return true;	// use the default handler
			}
		});
		$reader->setRelaxNGSchema(APPPATH . "vendor/lift/lift-0.13.rng");
		while ($reader->next()) {}	// read the entire file to validate all
		restore_error_handler();
		
		return true;
	}
	
	/**
	 * @param string $importDateModified
	 * @param DateTime $entryDateModified
	 * @return boolean
	 */
	private static function differentModTime($importDateModified, $entryDateModified) {
		$dateModified = new \DateTime($importDateModified);
		return ($dateModified->getTimestamp() != $entryDateModified->getTimestamp());
	}
	
}

?>
