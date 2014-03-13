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
				
				$importWins = true;
				$guid = $reader->getAttribute('guid');
				$existingEntry = self::existsIn($guid, $entries);
				if ($existingEntry) {
					$entry = new LexEntryModel($projectModel, $existingEntry['id']);
					$dateModified = $reader->getAttribute('dateModified');
					if (self::differentModTime($dateModified, $entry->authorInfo->modifiedDate) || ! $skipSameModTime) {
						switch ($mergeRule) {
							case LiftMergeRule::CREATE_DUPLICATES:
								$entry = new LexEntryModel($projectModel);
								break;
							case LiftMergeRule::IMPORT_LOSES:
								$importWins = false;
								break;
							case LiftMergeRule::IMPORT_WINS:
								break;
							default:
								throw new \Exception("unknown LiftMergeRule " . $mergeRule);
						}

						LiftDecoder::decode($sxeNode, $entry, $importWins);
						$entry->write();
					} else {
						// skip because same mod time and skip enabled
					}
				} else {
					$entry = new LexEntryModel($projectModel);
					LiftDecoder::decode($sxeNode, $entry, $importWins);
					$entry->write();
				}
			}
		}

		$entryList->read();
		$entries = $entryList->entries;
		echo "<pre>";
		echo "mergeRule: ". $mergeRule;
		echo "   skipSameModTime: " . var_export($skipSameModTime, true);
		echo "   entries count: " . count($entries);
		echo "</pre>";
	}
	
	/**
	 * If the guid exists in entries return the entry
	 * @param string $guid
	 * @param array $entries
	 * @return array <$entry or false if not found>
	 */
	private static function existsIn($guid, $entries) {
		foreach ($entries as $entry) {
			if ($entry['guid'] == $guid) {
				return $entry;
			}
		}
		return false;
	}
	
	/**
	 * @param string $importDateModified
	 * @param int <Unix timestamp> $entryDateModified
	 * @return boolean
	 */
	private static function differentModTime($importDateModified, $entryDateModified) {
		$dateModified = new \DateTime($importDateModified);
		return ($dateModified->getTimestamp() != $entryDateModified);
	}

}

?>
