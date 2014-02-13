<?php
namespace libraries\lfdictionary\dto;

class ListEntry {

	/**
	 * 
	 * Enter description here ...
	 * @var string
	 */
	public $guid;
	
	/**
	 * 
	 * Enter description here ...
	 * @var MultiText
	 */
	public $entry;
	
	/**
	 * 
	 * Enter description here ...
	 * @var array<MultiText>
	 */
	public $meanings;
	
	public function __construct($guid = null) {
		$this->guid = $guid;
		$this->entry = \libraries\lfdictionary\dto\MultiText::create();
		$this->meanings = array();
	}
	
	public function setGuid($guid) {
		$this->guid = $guid;
	}
	
	public function setEntry($multiText) {
		$this->entry = $multiText;
	}
	
	public function addEntry($language, $text) {
		$this->entry->addForm($language, $text);
	}
	
	public function addMeaning($multiText) {
		$this->meanings[] = $multiText;
	}
	
	public function encode() {
		$meanings = array();
		foreach ($this->meanings as $meaning) {
			$meanings[] = $meaning->encode();
		}
		return array(
			"guid" => $this->guid,
			"entry" => $this->entry->encode(),
			"meanings" => $meanings
		);
	}
	
	/**
	 * 
	 * @param string $guid
	 * @param array $word
	 * @param array $definitions
	 */
	static public function createFromParts($guid, $word, $definitions) {
		$entry = new ListEntry();
		$entry->setGuid($guid);
		$entry->setEntry(\libraries\lfdictionary\dto\MultiText::createFromArray($word));
		foreach ($definitions as $definition) {
			$multiText = \libraries\lfdictionary\dto\MultiText::createFromArray($definition['definition']);
			$entry->addMeaning($multiText);
		}
		return $entry;
	}
	
}

?>