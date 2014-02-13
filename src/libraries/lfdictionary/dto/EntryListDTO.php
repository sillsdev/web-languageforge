<?php
namespace libraries\lfdictionary\dto;
class EntryListDTO {

	/**
	 * @var int
	 */
	var $entryCount;

	/**
	 *
	 * Enter description here ...
	 * @var array<EntryDTO>
	 */
	var $_entries;

	function __construct() {
		$this->entryCount = 0;
		$this->_entries = array();
	}


	function setEntry($entries) {
		$this->_entries = $entries;
	}

	function addEntry($entry) {
		$this->_entries[] = $entry;
	}

	function encode() {
		$entries = array();
		foreach ($this->_entries as $entry) {
			$entries[] = $entry->encode();
		}
		return array(
			'count' => $this->entryCount,
			'entries' => $entries
		);

	}
}

?>