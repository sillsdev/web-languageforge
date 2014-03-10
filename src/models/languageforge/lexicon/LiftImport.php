<?php

namespace models\languageforge\lexicon;

class LiftImport {
	
	public static function merge($xml, $projectModel, $mergeRule = LiftMergeRule::CREATE_DUPLICATES, $skipSameModTime = true) {
		$entryList = new LexEntryListModel($projectModel);
		$entryList->read();
		$entries = $entryList->entries;
		$reader = new \XMLReader();
		$reader->XML($xml);
		while ($reader->read()) {
			if ($reader->nodeType == \XMLReader::ELEMENT && $reader->localName == 'entry') {   // Reads the LIFT file and searches for the entry node
				$guid = $reader->getAttribute('guid');
				$node = $reader->expand(); // expands the node for that particular guid
				
				if ($guid exists in entries) {
					$entry = existingEntry;
					if (different mod time && $skipSameModTime) {
						$importWins = true;
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
						LiftDecoder::decode($node, $entry, $importWins);
						$entry->write();
					} else {
						// skip because same mod time
					}
				} else {
					$entry = new LexEntryModel($projectModel);
					LiftDecoder::decode($node, $entry);
					$entry->write();
				}
				
				
				
// 				$dom = new \DomDocument();
// 				$n = $dom->importNode($node,true);
// 				$dom->appendChild($n);
// 				$sxe = simplexml_import_dom($n);
// 				if ($processEntryCallback !== null) {
// 					$processEntryCallback($sxe);
// 				}
			}
		}
	}
	
}

?>
