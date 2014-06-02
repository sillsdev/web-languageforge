<?php
namespace libraries\lfdictionary\dto;

/**
 * A single entry in the AutoSuggest / Typeahead Dto.
 */
class AutoListEntry {

	/**
	 * Unique ID of this Lexical Entry
	 * @var string
	 */
	public $guid; // TODO Rename. This should now be an id IdReference, as the AutoSuggestItem is stored in the mongo db. CP 2013-12 
	
	/**
	 * The word
	 * @var string
	 */
	public $word; // TODO Later. This should probably be a MultiText. Might as well return all forms allowing the user to switch forms in the client. CP 2013-12
	
	/**
	 * @param string $guid
	 * @param string $word
	 */
	public function __construct($guid, $word) {
		$this->guid = $guid;
		$this->word = $word;
	}
	
	public function encode() {
		// TODO Refactor. JsonEncoder will take care of this. CP 2013-12
		return array(
			"Value" => $this->guid,
			"DisplayName" => $this->word,
		);
	}

}

?>