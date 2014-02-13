<?php
namespace libraries\lfdictionary\commands;
require_once(dirname(__FILE__) . '/../Config.php');
class GetDomainQuestionCommand {
	/**
	 * @var DomainQuestionDTO
	 */
	var $_dto;

	var $_langKey;

	var $_domainGuid;

	function __construct($fileName,$langKey, $domainGuid) {
		if (!file_exists($fileName))
		{
			throw new \Exception('Domain file is missing on server: ' . $fileName);
		
		}
		$this->_fileName = $fileName;
		$this->_langKey = $langKey;
		$this->_domainGuid = $domainGuid;
		$this->_dto = new \libraries\lfdictionary\dto\DomainQuestionDTO();
	}

	function execute(){
		$this->processFile();
		return $this->_dto;
	}

	function processFile() {
		$doc = new \DOMDocument;
		$doc->preserveWhiteSpace = false;
		$doc->Load($this->_fileName);

		$this->_dto = new \libraries\lfdictionary\dto\DomainQuestionDTO();
		$xpath = new \DOMXPath($doc);
		$entries = $xpath->query('//CmSemanticDomain[@guid="' . $this->_domainGuid . '"]');

		if ($entries->length==1)
		{
			$this->processSemanticDomain($xpath, $entries->item(0));
		}
	}


	private function processSemanticDomain($xpath,$entry) {
		$this->_dto->setGuid( $this->getAttribute("guid", $entry->attributes));
		$innerEntries = $xpath->query('Description/AStr[@ws="' . $this->_langKey . '"]', $entry);

		if ($innerEntries->length==1)
		{
			$innerEntry = $xpath->query('Run[@ws="' . $this->_langKey . '"]', $innerEntries->item(0));
			if ($innerEntry->length==1)
			{
				$this->_dto->setDescription($innerEntry->item(0)->nodeValue);
			}
		}

		$innerEntries = $xpath->query('Questions/CmDomainQ/Question/AUni[@ws="' . $this->_langKey . '"]', $entry);
		if ($innerEntries->length>0)
		{
			foreach($innerEntries as $questionEntry)
			{
				$this->_dto->addQuestions($questionEntry->nodeValue);

				//get related example word
				$innerEntry = $xpath->query('ExampleWords/AUni[@ws="' . $this->_langKey . '"]', $questionEntry->parentNode->parentNode);
				if ($innerEntry->length==1)
				{
					$this->_dto->addExampleWords($innerEntry->item(0)->nodeValue);
				}else
				{
					$this->_dto->addExampleWords("");
				}

				//get related example sentence
				$innerEntry = $xpath->query('ExampleSentences/AStr[@ws="' . $this->_langKey . '"]', $questionEntry->parentNode->parentNode);
				if ($innerEntry->length==1)
				{
					$this->_dto->addExampleSentences($innerEntry->item(0)->nodeValue);
				}else
				{
					$this->_dto->addExampleSentences("");
				}
			}
		}

		// 		$innerEntries = $xpath->query('Questions/CmDomainQ/ExampleWords/AUni[@ws="' . $this->_langKey . '"]', $entry);
		// 		if ($innerEntries->length==1)
		// 		{
		// 			$this->_dto->setExampleWord($innerEntries->item(0)->nodeValue);
		// 		}
	}

	private function getAttribute($name, $att)
	{
		foreach($att as $i)
		{
			if($i->name==$name)
			return $i->value;
		}
	}
}
?>