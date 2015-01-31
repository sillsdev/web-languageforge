<?php

namespace libraries\languageforge\semdomtrans;

use models\languageforge\semdomtrans\SemDomTransTranslatedForm;
use models\languageforge\SemDomTransProjectModel;

use models\languageforge\semdomtrans\SemDomTransItemModel;
use models\languageforge\semdomtrans\SemDomTransQuestion;

class SemDomXMLImporter {
	
	private $_projectModel;
	
	private $_xml;
	
	private $_runForReal;
	
	private $_lang;
	
	/**
	 * 
	 * @param string $xmlfilepath
	 * @param SemDomTransProjectModel $projectModel
	 * @param bool $testMode
	 */
	public function __construct($xmlfilepath, $projectModel, $testMode = true) {

		$this->_xml = simplexml_load_file($xmlfilepath);
		$this->_projectModel = $projectModel;
		$this->_runForReal = ! $testMode;
		$this->_lang = $projectModel->languageIsoCode;
	}
	
	public function run() {
		foreach($this->_xml->SemanticDomainList->CmPossibilityList->Possibilities->children() as $domainNode) {
			$this->_processDomainNode($domainNode);
		}
	}

	public function _getPathVal($xmlPath) {
		if ($xmlPath) {
			$val = (string)$xmlPath[0];
		} else {
			$val= "";
		}
		return $val;
	}
	
	private function _processDomainNode($domainNode) {
		$guid = (string)$domainNode['guid'];
		$name = $this->_getPathVal($domainNode->xpath("Name/AUni[@ws='{$this->_lang}']"));
		
		$abbreviation = (string)$domainNode->xpath("Abbreviation/AUni[@ws='{$this->_lang}']")[0];

		$description = (string) $domainNode->xpath("Description/AStr[@ws='{$this->_lang}']")[0]->xpath("Run[@ws='{$this->_lang}']")[0];
		
		$questionsXML = $domainNode->Questions->children();
		
		$questions = [];
		$searchKeys = [];
	
		// parse nested questions
		foreach($questionsXML as $questionXML) {
			$question = $this->_getPathVal($questionXML->xpath("Question/AUni[@ws='{$this->_lang}']"));
			$terms = $this->_getPathVal($questionXML->xpath("ExampleWords/AUni[@ws='{$this->_lang}']"));
			array_push($questions, new SemDomTransQuestion($question, $terms));
			array_push($searchKeys, new SemDomTransTranslatedForm($terms));
		}				
		
		// assume that we are not matching up with guids
		$itemModel = new SemDomTransItemModel($this->_projectModel);
		$itemModel->readByProperty('xmlGuid', $guid);
		
		$itemModel->name = new SemDomTransTranslatedForm($name);
		$itemModel->key = new SemDomTransTranslatedForm($abbreviation);
		$itemModel->description = new SemDomTransTranslatedForm($description);
		$itemModel->questions = $questions;
		$itemModel->searchKeys = $searchKeys;
		
		if ($this->_runForReal) {
			$itemModel->write();
		}
		print "Processed $abbreviation $name\n";
		
		// recurse on sub-domains
		if (property_exists($domainNode, 'SubPossibilities')) {
			foreach ($domainNode->SubPossibilities->children() as $subDomainNode) {
				$this->_processDomainNode($subDomainNode);
			}
		}
	}
	
}
?>