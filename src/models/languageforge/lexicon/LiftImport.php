<?php

namespace models\languageforge\lexicon;

class LiftImport {
	
	/**
	 * @param string $xml
	 * @param LexiconProjectModel $projectModel
	 * @param LiftMergeRule $mergeRule
	 * @param boolean $skipSameModTime
	 * @throws \Exception
	 */
	public static function merge($xml, $projectModel, $mergeRule = LiftMergeRule::CREATE_DUPLICATES, $skipSameModTime = true) {
		$entryList = new LexEntryListModel($projectModel);
		$entryList->read();
		$entries = $entryList->entries;
				
		$reader = new \XMLReader();
		$reader->XML($xml);
		$reader->setRelaxNGSchema(APPPATH . "vendor/lift/lift-0.13.rng");
		if (! $reader->isValid()) {
			throw new \Exception("Sorry, the LIFT file is invalid.");
		}
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
							LiftDecoder::decode($sxeNode, $entry, $mergeRule);
							$entry->guid = '';
						} else {
							LiftDecoder::decode($sxeNode, $entry, $mergeRule);
						}
						$entry->write();
					} else {
						// skip because same mod time and skip enabled
					}
				} else {
					$entry = new LexEntryModel($projectModel);
					LiftDecoder::decode($sxeNode, $entry, $mergeRule);
					$entry->write();
				}
			}
		}
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
