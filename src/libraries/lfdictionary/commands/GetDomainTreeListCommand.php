<?php
namespace libraries\lfdictionary\commands;

require_once(dirname(__FILE__) . '/../Config.php');
use libraries\lfdictionary\common\LoggerFactory;
class GetDomainTreeListCommand {
	
	/**
	 * @var DomainTreeDTO
	 */
	private $_dto;

	/**
	 * Full path to the semantic domain file.
	 * @var string
	 */
	private $_filePath;

	/**
	 * The iso-639 language code, which selects the language to pull from the semantic domain file.
	 * @var string
	 */
	private $_languageCode;

	/**
	 * @param string $filePath
	 * @param string $languageCode
	 */
	function __construct($filePath, $languageCode) {
		
		if (!file_exists($filePath)) {
			throw new \Exception(sprintf("GetDomainTreeList: Domain file not found '%s'", $filePath));
		}

		$this->_filePath = $filePath;
		$this->_languageCode = $languageCode;
		$this->_dto = new \libraries\lfdictionary\dto\DomainTreeDTO();
	}

	function execute(){
		$this->processFile();
		return $this->_dto;
	}

	function processFile() {
		LoggerFactory::getLogger()->logInfoMessage(sprintf("Semantic Domain: Loading data for %s from '%s'", $this->_languageCode, $this->_filePath));
		$doc = new \DOMDocument;
		$doc->preserveWhiteSpace = false;
		$doc->Load($this->_filePath);

		$this->_dto = new \libraries\lfdictionary\dto\DomainTreeDTO();
		$xpath = new \DOMXPath($doc);
		$entries = $xpath->query('//Lists/List/Possibilities/CmSemanticDomain/Name/AUni[@ws="' . $this->_languageCode . '"]');
		$this->processChildren($xpath,$entries,$this->_dto);
	}


	private function processChildren($xpath, $entries, $parentDto) {
		foreach ($entries as $entry) {
			$cmSemanticDomainNode=$entry->parentNode->parentNode;
			$innerEntry = $xpath->query('Abbreviation/AUni[@ws="' . $this->_languageCode . '"]', $cmSemanticDomainNode);
			$indexNr = "";
			if ($innerEntry->length == 1) {
				$indexNr=$innerEntry->item(0)->nodeValue;
			}
				
			$guid = $this->getAttribute("guid", $cmSemanticDomainNode->attributes);
				
			$key = $indexNr . " " . $entry->nodeValue;
				
			$childDto = new \libraries\lfdictionary\dto\DomainTreeDTO();
			$childDto->setParent($parentDto);
			$parentDto->add($childDto);
			$childDto->setGuid($guid);
			$childDto->setKey($key);
				
			$subEntries = $xpath->query('SubPossibilities/CmSemanticDomain/Name/AUni[@ws="' . $this->_languageCode . '"]', $cmSemanticDomainNode);
			if ($subEntries->length > 0) {
				$this->processChildren($xpath, $subEntries, $childDto);
			}
		}
	}

	private function getAttribute($name, $att) {
		foreach($att as $i) {
			if($i->name == $name)
				return $i->value;
		}
	}
}

?>