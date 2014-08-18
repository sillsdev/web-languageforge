<?php

namespace models\languageforge\lexicon;

use models\languageforge\lexicon\config\LexiconOptionListItem;
use models\mapper\ArrayOf;
use models\languageforge\lexicon\config\LexiconConfigObj;

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

        $initialImport = $entryList->count == 0;

        // I consider this to be a stopgap to support importing of part of speech until we have a way to import lift ranges - cjh 2014-08
        $partOfSpeechValues = array();

		if ($initialImport) {
            // Do the following on first import (number of entries == 0

			// clear entry field input systems config if their are no entries (only use imported input systems)
			$projectModel->config->entry->fields[LexiconConfigObj::LEXEME]->inputSystems = new ArrayOf();
			$projectModel->config->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::DEFINITION]->inputSystems = new ArrayOf();
			$projectModel->config->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::GLOSS]->inputSystems = new ArrayOf();
			$projectModel->config->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::EXAMPLES_LIST]->fields[LexiconConfigObj::EXAMPLE_SENTENCE]->inputSystems = new ArrayOf();
			$projectModel->config->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::EXAMPLES_LIST]->fields[LexiconConfigObj::EXAMPLE_TRANSLATION]->inputSystems = new ArrayOf();
		}
		
		$reader = new \XMLReader();
		$reader->XML($xml);

		$liftDecoder = new LiftDecoder($projectModel);
		
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
							$liftDecoder->decode($sxeNode, $entry, $mergeRule);
							$entry->guid = '';
							$entry->write();
						} else {
							if (isset($sxeNode->{'lexical-unit'})) {
								$liftDecoder->decode($sxeNode, $entry, $mergeRule);
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
                    self::addPartOfSpeechValuesToList($partOfSpeechValues, $entry);
				} else {
 					if (isset($sxeNode->{'lexical-unit'})) {
 						$entry = new LexEntryModel($projectModel);
						$liftDecoder->decode($sxeNode, $entry, $mergeRule);
 						$entry->write();
                        self::addPartOfSpeechValuesToList($partOfSpeechValues, $entry);
 					}
				}
			}
		}

        if ($initialImport) {
            // replace part of speech option list with values from imported data
            // todo: remove this functionality when we have a way to import lift ranges (option lists) - cjh 2014-08
            if (count($partOfSpeechValues) > 0) {
                $partOfSpeechOptionList = new LexOptionListModel($projectModel);
                $partOfSpeechOptionList->readByProperty('code', 'partOfSpeech');

                // start with an empty list
                $partOfSpeechOptionList->items->exchangeArray(array());

                foreach ($partOfSpeechValues as $value) {
                    $partOfSpeechOptionList->items->append(new LexiconOptionListItem($value));
                }
                $partOfSpeechOptionList->write();
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

    /**
     * @param $arr array - list to append to
     * @param $entryModel LexEntryModel
     */
    private static function addPartOfSpeechValuesToList(&$arr, $entryModel) {
        foreach ($entryModel->senses as $sense) {
            $pos = $sense->partOfSpeech->value;
            if (!in_array($pos, $arr)) {
                array_push($arr, $pos);
            }
        }
    }
}

?>
