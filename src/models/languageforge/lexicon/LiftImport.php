<?php

namespace models\languageforge\lexicon;

use models\languageforge\lexicon\LexiconProjectModel;
use models\languageforge\lexicon\LexEntryModel;
use models\languageforge\lexicon\LexEntryListModel;
use models\languageforge\lexicon\LiftMergeRule;

class LiftImport {

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
				$guid = $reader->getAttribute('guid');
				$node = simplexml_import_dom($reader->expand()); // expands the node for that particular guid
				
				$importWins = true;
				if (exists_in_entries($guid, $entries)) {
					$entry = existingEntry;
					if (different_mod_time() && $skipSameModTime) {
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
					} else {
						// skip because same mod time
					}
				} else {
					$entry = new LexEntryModel($projectModel);
				}
				
				LiftDecoder::decode($node, $entry, $importWins);
				$entry->write();
				
			}
		}
	}
	
}

?>
