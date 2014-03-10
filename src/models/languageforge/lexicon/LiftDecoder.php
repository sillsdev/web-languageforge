<?php

namespace models\languageforge\lexicon;

use models\languageforge\lexicon\LexEntryModel;

class LiftDecoder {
	
	public static function decode($node, $entry, $importWins = true) {
		$decoder = new LiftDecoder();
		$decoder->_decode($node, $entry, $importWins);
	}
	
	protected function _decode($node, $entry, $importWins = true) {
		$lexicalForms = $node->{'lexical-unit'};
		if ($lexicalForms) {
			$entry->guid = (string)$node['guid'];
			$entry->lexeme = $this->readMultiText($lexicalForms);
			if(isset($node->{'sense'})) {
				foreach ($node->{'sense'} as $sense) {
					$entry[] = $this->readSense($sense);
				}
			}
		}
	}

}

?>
