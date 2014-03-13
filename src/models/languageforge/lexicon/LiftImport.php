<?php

namespace models\languageforge\lexicon;

class LiftImport {
	
	private static $_existingEntry = null;

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
				$dateModified = $reader->getAttribute('dateModified');
				$importWins = true;
				if (self::existsIn($guid, $entries)) {
					$entry = new LexEntryModel($projectModel, self::$_existingEntry['id']);
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
	 * If the guid exists in entries return true and store entry
	 * @param string $guid
	 * @param array $entries
	 * @return boolean
	 */
	private static function existsIn($guid, $entries) {
		foreach ($entries as $entry) {
			if ($entry['guid'] == $guid) {
				self::$_existingEntry = $entry;
				return true;
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
