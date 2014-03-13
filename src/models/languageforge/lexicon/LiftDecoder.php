<?php

namespace models\languageforge\lexicon;

class LiftDecoder {
	
	/**
	 * 
	 * @param SimpleXMLElement $sxeNode
	 * @param LexEntryModel $entry
	 * @param boolean $importWins
	 */
	public static function decode($sxeNode, $entry, $importWins = true) {
		$decoder = new LiftDecoder();
		$decoder->_decode($sxeNode, $entry, $importWins);
	}
	
	/**
	 * 
	 * @param SimpleXMLElement $sxeNode
	 * @param LexEntryModel $entry
	 * @param boolean $importWins
	 */
	protected function _decode($sxeNode, $entry, $importWins = true) {
		$lexicalForms = $sxeNode->{'lexical-unit'};
		if ($lexicalForms) {
			if ($importWins) {
				$entry->guid = (string)$sxeNode['guid'];
				$entry->authorInfo->createdDate = new \DateTime((string)$sxeNode['dateCreated']);
				$entry->authorInfo->modifiedDate = new \DateTime((string)$sxeNode['dateModified']);
				$entry->lexeme = $this->readMultiText($lexicalForms);
			}
			if(isset($sxeNode->{'sense'})) {
				foreach ($sxeNode->{'sense'} as $senseNode) {
					$entry->senses[] = $this->readSense($senseNode);
				}
			}
		}
	}

	/**
	 * Reads a Sense from the XmlNode $sxeNode
	 * @param SimpleXMLElement $sxeNode
	 * @return Sense
	 */
	public function readSense($sxeNode) {
		$sense = new Sense();
		// Definition
		$definition = $sxeNode->{'definition'};
		$sense->definition = $this->readMultiText($definition);
		
		//id
		$sense->liftId = '';
		if(isset($sxeNode->{'id'})) {
			$sense->liftId = $sxeNode->{'id'};
		}
		
		// Part Of Speech
		if(isset($sxeNode->{'grammatical-info'})) {
			$partOfSpeech = (string)$sxeNode->{'grammatical-info'}->attributes()->value;
			$sense->partOfSpeech->value($partOfSpeech);
		}
	
		// Semantic Domain
		if(isset($sxeNode->{'trait'})) {
			foreach ($sxeNode->{'trait'} as $traitNode) {
				$semanticDomainName = (string)$traitNode->attributes()->name;
				$semanticDomainValue = (string)$traitNode->attributes()->value;
				$sense->semanticDomain->value($semanticDomainValue);
			}
		}
	
		// Examples
		$examples = $sxeNode->{'example'};
		if ($examples) {
			foreach ($examples as $example) {
				$sense->examples[] = $this->readExample($example);
			}
		}
		return $sense;
	}
	
	/**
	 * Reads an Example from the XmlNode $sxeNode
	 * @param SimpleXMLElement $sxeNode
	 * @return Example
	 */
	public function readExample($sxeNode) {
		$example = new Example();
	
		// id
		$example->liftId = '';
		if(isset($sxeNode->{'id'})) {
			$example->liftId = $sxeNode->{'id'};
		}
		
		// Sentence multitext
		$exampleXml = $sxeNode;
		$example->sentence = $this->readMultiText($exampleXml);
		// Translation multitext
		$translationXml = $sxeNode->{'translation'};
		if(!empty($translationXml)) {
			$example->translation = $this->readMultiText($translationXml);
		}
		return $example;
	}
	
	/**
	 * Reads a MultiText from the XmlNode $sxeNode
	 * @param SimpleXMLElement $sxeNode
	 * @return MultiText
	 */
	public function readMultiText($sxeNode) {
		$multiText = new MultiText();
		foreach ($sxeNode->{'form'} as $form) {
			$multiText->form((string)$form['lang'], (string)$form->{'text'});
		}
		return $multiText;
	}
		
}

?>
