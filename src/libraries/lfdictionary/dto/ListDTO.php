<?php
namespace libraries\lfdictionary\dto;

class ListDTO {

	/**
	 * @var int
	 */
	public $entryCount;
	
	/**
	* @var int
	*/
	public $entryBeginIndex;
	
	/**
	* @var int
	*/
	public $entryEndIndex;
	
	/**
	 * @var array<ListEntry>
	 */
	public $entries;
	
	public function __construct() {
		$this->entryCount = 0;
		$this->entryBeginIndex = 0;
		$this->entryEndIndex = 0;
		$this->entries = array();
	}

	public function addListEntry($entry) {
		$this->entries[] = $entry;
	}
	
	public function mergeListDto($listDto)
	{
		foreach ($listDto->entries as $entry) {
			$this->entries[] = $entry;
		}
	}
	
	public function encode() {
		$entries = array();
		foreach ($this->entries as $entry) {
			$entries[] = $entry->encode();
		}
		$result = array(
			'count' => $this->entryCount,
			'beginindex' => $this->entryBeginIndex,
			'endindex' => $this->entryEndIndex,
			'entries' => $entries
		);
		return $result;
	}
	
}


?>