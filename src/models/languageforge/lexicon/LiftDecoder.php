<?php

namespace models\languageforge\lexicon;

use models\languageforge\lexicon\settings\LexiconConfigObj;
use models\mapper\ArrayOf;

class LiftDecoder {
	
	public function __construct($projectModel) {
		$this->_projectModel = $projectModel;
	}
	
	/**
	 * 
	 * @var LexiconProjectModel
	 */
	private $_projectModel;
	
	/**
	 * @param LexiconProjectModel $projectModel
	 * @param SimpleXMLElement $sxeNode
	 * @param LexEntryModel $entry
	 * @param LiftMergeRule $mergeRule
	 */
	public static function decode($projectModel, $sxeNode, $entry, $mergeRule = LiftMergeRule::CREATE_DUPLICATES) {
		$decoder = new LiftDecoder($projectModel);
		$projectModel = $decoder->_decode($sxeNode, $entry, $mergeRule);
	}
	
	/**
	 * @param SimpleXMLElement $sxeNode
	 * @param LexEntryModel $entry
	 * @param LiftMergeRule $mergeRule
	 * @throws \Exception
	 * @return LexiconProjectModel
	 */
	protected function _decode($sxeNode, $entry, $mergeRule = LiftMergeRule::CREATE_DUPLICATES) {
		$lexicalForms = $sxeNode->{'lexical-unit'};
		if ($lexicalForms) {
			if ($mergeRule != LiftMergeRule::IMPORT_LOSES) {
				$entry->guid = (string) $sxeNode['guid'];
				$entry->authorInfo->createdDate = new \DateTime((string) $sxeNode['dateCreated']);
				$entry->authorInfo->modifiedDate = new \DateTime((string) $sxeNode['dateModified']);
				$entry->lexeme = $this->readMultiText($lexicalForms, $this->_projectModel->settings->entry->fields[LexiconConfigObj::LEXEME]->inputSystems);
			}
			if (isset($sxeNode->sense)) {
				foreach ($sxeNode->sense as $senseNode) {
					$liftId = '';
					if (isset($senseNode['id'])) {
						$liftId = (string) $senseNode['id'];
					}
					$existingSenseIndex = $entry->searchSensesFor('liftId', $liftId);
					if ($existingSenseIndex >= 0) {
						switch ($mergeRule) {
							case LiftMergeRule::CREATE_DUPLICATES:
								$sense = new Sense('');
								$entry->senses[] = $this->readSense($senseNode, $sense);
								break;
							case LiftMergeRule::IMPORT_WINS:
								$sense = $entry->senses[$existingSenseIndex];
								$entry->senses[$existingSenseIndex] = $this->readSense($senseNode, $sense);
								break;
							case LiftMergeRule::IMPORT_LOSES:
								break;
							default:
								throw new \Exception("unknown LiftMergeRule " . $mergeRule);
						}
					} else {
						$sense = new Sense($liftId);
						$entry->senses[] = $this->readSense($senseNode, $sense);
					}
				}
			}
		}
		
		return $this->_projectModel;
	}

	/**
	 * Reads a Sense from the XmlNode $sxeNode
	 * @param SimpleXMLElement $sxeNode
	 * @param Sense $sense
	 * @return Sense
	 */
	public function readSense($sxeNode, $sense) {
		// Definition
		if (isset($sxeNode->definition)) {
			$definition = $sxeNode->definition;
			$sense->definition = $this->readMultiText($definition, $this->_projectModel->settings->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::DEFINITION]->inputSystems);
		}
		
		// Gloss
		if (isset($sxeNode->gloss)) {
			$multiText = new MultiText();
			$glossInputSystems = $this->_projectModel->settings->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::GLOSS]->inputSystems;
			foreach ($sxeNode->gloss as $glossNode) {
				$inputSystemTag = (string) $glossNode->attributes()->lang;
				$multiText->form($inputSystemTag, (string) $glossNode->text);
				
				$this->_projectModel->addInputSystem($inputSystemTag);
				$glossInputSystems->value($inputSystemTag);
			}
			$sense->gloss = $multiText; 
		}
		
		// Part Of Speech
		if (isset($sxeNode->{'grammatical-info'})) {
			$partOfSpeech = (string) $sxeNode->{'grammatical-info'}->attributes()->value;
			$sense->partOfSpeech->value = $partOfSpeech;
		}
	
		// Semantic Domain
		if (isset($sxeNode->trait)) {
			foreach ($sxeNode->trait as $traitNode) {
				$semanticDomainName = (string) $traitNode->attributes()->name;
				$semanticDomainValue = (string) $traitNode->attributes()->value;
				$sense->semanticDomain->value($semanticDomainValue);
			}
		}
	
		// Examples
		$examples = $sxeNode->example;
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
		$example = new Example($sxeNode['id']);
		
		// Sentence multitext
		$exampleXml = $sxeNode;
		$example->sentence = $this->readMultiText($exampleXml, $this->_projectModel->settings->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::EXAMPLES_LIST]->fields[LexiconConfigObj::EXAMPLE_SENTENCE]->inputSystems);
		// Translation multitext
		$translationXml = $sxeNode->translation;
		if (! empty($translationXml)) {
			$example->translation = $this->readMultiText($translationXml, $this->_projectModel->settings->entry->fields[LexiconConfigObj::SENSES_LIST]->fields[LexiconConfigObj::EXAMPLES_LIST]->fields[LexiconConfigObj::EXAMPLE_TRANSLATION]->inputSystems);
		}
		return $example;
	}
	
	/**
	 * Reads a MultiText from the XmlNode $sxeNode
	 * @param SimpleXMLElement $sxeNode
	 * @param ArrayOf $inputSystems
	 * @return MultiText
	 */
	public function readMultiText($sxeNode, $inputSystems = null) {
		$multiText = new MultiText();
		if (isset($sxeNode->form)) {
			foreach ($sxeNode->form as $form) {
				$inputSystemTag = (string) $form['lang'];
				$multiText->form($inputSystemTag, (string) $form->text);
				
				$this->_projectModel->addInputSystem($inputSystemTag);
				if (isset($inputSystems)) {
					$inputSystems->value($inputSystemTag);
				}
			}
		}
		return $multiText;
	}
		
}

?>
