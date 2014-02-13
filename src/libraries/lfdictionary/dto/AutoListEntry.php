<?php
namespace libraries\lfdictionary\dto;

class AutoListEntry {

	/**
	 * Unique ID of this Lexical Entry
	 * @var string
	 */
	public $guid;
	
	/**
	 * The word
	 * @var string
	 */
	public $word;
	
	/**
	 * @param string $guid
	 * @param string $word
	 */
	public function __construct($guid, $word) {
		$this->guid = $guid;
		$this->word = $word;
	}
	
	public function encode() {
		return array(
			"Value" => $this->guid,
			"DisplayName" => $this->word,
		);
	}

}

?>