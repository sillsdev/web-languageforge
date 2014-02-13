<?php

namespace libraries\lfdictionary\mapper;
require_once(dirname(__FILE__) . '/../Config.php');

class LiftUpdater {
	
	/**
	 * @param string $name
	 * @param SimpleXmlElement $parent
	 * @return SimpleXMLElement
	 */
	static function getOrCreateNode($name, $parent) {
		$resultXml = $parent->{$name};
		if ($resultXml->getName() == null) {
			$resultXml = $parent->addChild($name);
		}
		return $resultXml;
	}
	
	/**
	 * @param SimpleXmlElement $entryXml
	 * @param EntryDTO $entryDto
	 */
	static function mergeEntry($entryXml, $entryDto) {
		// Paranoid check that the xml guid == dto guid
		if ($entryDto->getEntry() != null) {
			$lexicalFormsXml = LiftUpdater::getOrCreateNode('lexical-unit', $entryXml);
			LiftUpdater::mergeMultiText($lexicalFormsXml, $entryDto->getEntry());
		}
		//Merge Senses - The number of examples in the dto must be >= the number of examples in the xml.
		// TODO if the senses have guids then we can match those in a ToAdd or ToDelete list like we do with multitext CP 2011-06
		$senseIndex = 0;
		foreach ($entryXml->{'sense'} as $senseXml) {
			$senseDto = $entryDto->getSense($senseIndex);
			LiftUpdater::mergeSense($senseXml, $senseDto);
			$senseIndex++;
		}
		// Add remaining examples in dto if some have been added
		$senseCount = $entryDto->senseCount();
		for (; $senseIndex < $senseCount; $senseIndex++) {
			$senseDto = $entryDto->getSense($senseIndex);
			LiftUpdater::addSenseToEntry($entryXml, $senseDto);
		}
	}
	
	/**
	 * @param SimpleXmlElement $entryXml
	 * @param Sense $senseDto
	 */
	static function addSenseToEntry($entryXml, $senseDto) {
		$senseXml = $entryXml->addChild('sense');
		$definitionXml = $senseXml->addChild('definition');
		LiftUpdater::addMultiText($definitionXml, $senseDto->getDefinition());
		$partOfSpeech = $senseDto->getPartOfSpeech();
		
		if ($partOfSpeech != null) {
			$grammaticalInfo = $senseXml->addChild('grammatical-info');
			$grammaticalInfo->addAttribute('value', $partOfSpeech);
		}
		
		$semanticDomainName = $senseDto->getSemanticDomainName();
		
		if ($semanticDomainName != null) {
			$trait = $senseXml->addChild('trait');
			$trait->addAttribute('name', $semanticDomainName);
			$trait->addAttribute('value', $senseDto->getSemanticDomainValue());
		}
		
		
		foreach ($senseDto->_examples as $exampleDto) {
			LiftUpdater::addExampleToSense($senseXml, $exampleDto);
		}
	}
	
	/**
	 * Merges the data in the $senseDto with the existing xml
	 * @param SimpleXmlElement $senseXml
	 * @param Sense $senseDto
	 */
	static function mergeSense($senseXml, $senseDto) {
		//Definition
		$definitionDto = $senseDto->getDefinition();
		if ($definitionDto != null) {
			$definitionXml = LiftUpdater::getOrCreateNode('definition', $senseXml);
			LiftUpdater::mergeMultiText($definitionXml, $definitionDto);
		}
		//Part Of Speech
		$grammaticalInfoXml = $senseXml->{'grammatical-info'};
		$grammaticalInfoXml['value'] = $senseDto->getPartOfSpeech();
		//Merge Examples - The number of examples in the dto must be >= the number of examples in the xml.
		// TODO if the examples have guids then we can match those in a ToAdd or ToDelete list like we do with multitext CP 2011-06
		$exampleIndex = 0;
		foreach ($senseXml->{'example'} as $exampleXml) {
			$exampleDto = $senseDto->getExample($exampleIndex);
			LiftUpdater::mergeExample($exampleXml, $exampleDto);
			$exampleIndex++;
		}
		// Add remaining examples in dto if some have been added
		$exampleCount = $senseDto->exampleCount();
		for (; $exampleIndex < $exampleCount; $exampleIndex++) {
			$exampleDto = $senseDto->getExample($exampleIndex);
			LiftUpdater::addExampleToSense($senseXml, $exampleDto);
		}
	}
	
	/**
	 * @param SimpleXmlElement $senseXml
	 * @param Example $exampleDto
	 */
	static function addExampleToSense($senseXml, $exampleDto) {

		$exampleXml = $senseXml->addChild('example');
		LiftUpdater::addMultiText($exampleXml, $exampleDto->getExample());
		
		//TODO: Translation could not be adding from UI(GWT)
		$translationXml = $exampleXml->addChild('translation');
		LiftUpdater::addMultiText($translationXml, $exampleDto->getTranslation());
	}
		
	/**
	 * Merges the data in the $exampleDto with the existing xml
	 * @param SimpleXmlElement $exampleXml
	 * @param Example $exampleDto
	 */
	static function mergeExample($exampleXml, $exampleDto) {
		// Example multitext
		LiftUpdater::mergeMultiText($exampleXml, $exampleDto->getExample());
		// Translation multitext
		$translationXml = $exampleXml->{'translation'};
		LiftUpdater::mergeMultiText($translationXml, $exampleDto->getTranslation());
	}
	
	/**
	 * @param SimpleXmlElement $xml
	 * @param MultiText $multitext
	 */
	static function addMultiText($xml, $multitext) {
		LiftUpdater::addFormToMultiText($xml, $multitext->getAll());
	}
	
	/**
	* @param SimpleXmlElement $xml
	* @param Array $multitextArray
	*/
	static function addFormToMultiText($xml, $multitextArray)
	{
		foreach ($multitextArray as $language => $text) {
			$form = $xml->addChild('form');
			$form->addAttribute('lang', $language);
			$form->addChild('text', $text);
		}
	}
	
	/**
	 * Merges the data in the $multiTextDto with the existing xml
	 * @param SimpleXmlElement $multiTextXml
	 * @param MultiText $multiTextDto
	 */
	static function mergeMultiText($multiTextXml, $multiTextDto) {
		$toAdd = $multiTextDto->getAll();
		foreach ($multiTextXml->{'form'} as $form) {
			$language = (string)$form['lang'];
			if ($multiTextDto->hasForm($language)) {
				unset($toAdd[$language]); // Remove from the toAdd list as it already exists in the xml.
				// TODO Could check for change here
				$form->text = $multiTextDto->getForm($language);
			}
		}		
		LiftUpdater::addFormToMultiText($multiTextXml, $toAdd);
	}
	
	/**
	 * @return string
	 */
	static function now() {
		return gmdate("Y-m-d\TH-i-s\Z");
	}

	/**
	 * @param string $filePath
	 * @param string $timeStamp
	 * @param string $mercurialSHA
	 * @return string
	 */
	static function updateFilePath($filePath, $timeStamp, $mercurialSHA="") {
		if ($mercurialSHA==""){
			return $filePath . '-' . $timeStamp . '.liftupdate';
		}else{
			return $filePath . '-' . $timeStamp . '-' . $mercurialSHA . '.liftupdate';
		}
	}
}

?>