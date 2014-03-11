<?php

namespace models\languageforge\lexicon;

class LiftDecoder {
	
	public static function decode($node, $entry, $importWins = true) {
		$decoder = new LiftDecoder();
		$decoder->_decode($node, $entry, $importWins);
	}
	
	protected function _decode($node, $entry, $importWins = true) {
		$lexicalForms = $node->{'lexical-unit'};
		if ($lexicalForms) {
		
// 			echo "<pre>";
// 			echo "lexicalForms ";
// 			echo var_dump($lexicalForms);
// 			echo "</pre>";
		
			$entry->guid = (string)$node['guid'];
			$entry->lexeme = $this->readMultiText($lexicalForms);
			if(isset($node->{'sense'})) {
				foreach ($node->{'sense'} as $senseNode) {
// 					$entry[] = $this->readSense($senseNode);
				}
			}
		}
	}

	/**
	 * Reads a MultiText from the XmlNode $node
	 * @param XmlNode $node
	 * @return MultiText
	 */
	public function readMultiText($node) {
		$multiText = new MultiText();
		foreach ($node->{'form'} as $form) {
			$multiText->updateForm((string)$form['lang'], (string)$form->{'text'});
		}
		
// 		echo "<pre>";
// 		echo "multiText ";
// 		echo var_dump($multiText);
// 		echo "</pre>";
		
		return $multiText;
	}
		
}

?>
