<?php
namespace libraries\lfdictionary\dto;

/**
 * EntryListDto holds the list of entries used on the LHS of the Dictionary Browse Edit page.
 * TODO Refactor. Add other elements of the dto, like rights and breadcrumbs.  Use the RightsHelper
 */
class EntryListDTO {

	/**
	 * @var int
	 */
	var $entryCount;

	/**
	 *
	 * Enter description here ...
	 * @var array<LexEntryModel>
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