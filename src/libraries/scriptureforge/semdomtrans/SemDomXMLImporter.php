<?php

namespace libraries\scriptureforge\semdomtrans;

use models\languageforge\semdomtrans\SemDomTransTranslatedForm;
use models\languageforge\SemDomTransProjectModel;

use models\languageforge\semdomtrans\SemDomTransItemModel;

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

	private function _processDomainNode($domainNode) {
		$guid = (string)$domainNode['guid'];
		$xpathResult = $domainNode->xpath("Name/AUni[@ws='{$this->_lang}']");
		if ($xpathResult) {
			$name = (string)$xpathResult[0];
		} else {
			$name = "";
			print_r($xpathResult);
		}
		$abbreviation = (string)$domainNode->xpath("Abbreviation/AUni[@ws='{$this->_lang}']")[0];

		// assume that we are not matching up with guids
		$itemModel = new SemDomTransItemModel($this->_projectModel);
		$itemModel->readByProperty('xmlGuid', $guid);
		
		$itemModel->name = new SemDomTransTranslatedForm($name);
		$itemModel->key = new SemDomTransTranslatedForm($abbreviation);
		
		if ($this->_runForReal) {
			$itemModel->write();
		}
		print "Processed $abbreviation $name\n";
		
		if (property_exists($domainNode, 'SubPossibilities')) {
			foreach ($domainNode->SubPossibilities->children() as $subDomainNode) {
				$this->_processDomainNode($subDomainNode);
			}
		}
	}
	
}
?>