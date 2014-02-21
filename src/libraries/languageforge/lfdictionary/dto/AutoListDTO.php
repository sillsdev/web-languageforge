<?php
namespace libraries\lfdictionary\dto;

/**
 * AutoSuggest / Typeahead Dto.
 */ 
// TODO Refactor. This is really a model that can get data from the mongo db, preferably to a LV dist or similar on the preferred lexeme / gloss form. CP 2013-12
class AutoListDTO {

	/**
	 * @var int
	 */
	public $entryCount;
	
	/**
	 * @var array<ListEntry>
	 */
	var $_entries;
	
	function __construct() {
		$this->entryCount = 0;
		$this->_entries = array();
	}

	function addListEntry($entry) {
		$this->entryCount++;
		$this->_entries[] = $entry;
	}
	
	function encode() {
		$entries = array();
		foreach ($this->_entries as $entry) {
			$entries[] = $entry->encode();
		}
		$result = array(			
			'TotalSize' => $this->entryCount,
			'Options' => $entries
		);
		return $result;
	}
	
}

?>