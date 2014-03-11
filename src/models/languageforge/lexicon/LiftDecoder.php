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
					$entry->senses[] = $this->readSense($senseNode);
				}
			}
		}
	}

	/**
	 * Reads a Sense from the XmlNode $node
	 * @param XmlNode $node
	 * @return Sense
	 */
	public function readSense($node) {
		$sense = new Sense();
		// Definition
		$definition = $node->{'definition'};
		$sense->definition = $this->readMultiText($definition);
		
		//id
		$sense->liftId = '';
		if(isset($node->{'id'})) {
			$sense->liftId = $node->{'id'};
		}
		
		// Part Of Speech
		if(isset($node->{'grammatical-info'})) {
			$partOfSpeech = (string)$node->{'grammatical-info'}->attributes()->value;
			$sense->partOfSpeech->value($partOfSpeech);
		}
	
		// Semantic Domain
		// TODO Enhance. Add for loop for multiple traits. IJH 2014-03
		if(isset($node->{'trait'})) {
			$semanticDomainName = (string)$node->{'trait'}->attributes()->name;
			$semanticDomainValue = (string)$node->{'trait'}->attributes()->value;
			$sense->semanticDomain->value($semanticDomainValue);
		}
	
		// Examples
		$examples = $node->{'example'};
		if ($examples) {
			foreach ($examples as $example) {
				$sense->examples[] = $this->readExample($example);
			}
		}
		return $sense;
	}
	
	/**
	 * Reads an Example from the XmlNode $node
	 * @param XmlNode $node
	 * @return Example
	 */
	public function readExample($node) {
		$example = new Example();
	
		// id
		$example->liftId = '';
		if(isset($node->{'id'})) {
			$example->liftId = $node->{'id'};
		}
		
		// Sentence multitext
		$exampleXml = $node;
		$example->sentence = $this->readMultiText($exampleXml);
		// Translation multitext
		$translationXml = $node->{'translation'};
		if(!empty($translationXml)) {
			$example->translation = $this->readMultiText($translationXml);
		}
		return $example;
	}
	
	/**
	 * Reads a MultiText from the XmlNode $node
	 * @param XmlNode $node
	 * @return MultiText
	 */
	public function readMultiText($node) {
		$multiText = new MultiText();
		foreach ($node->{'form'} as $form) {
			$multiText->form((string)$form['lang'], (string)$form->{'text'});
		}
		return $multiText;
	}
		
}

?>
