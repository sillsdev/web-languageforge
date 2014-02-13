<?php
namespace libraries\lfdictionary\dto;

class MultiText {

	/**
	 * Array of language => text key value pairs
	 * @var array
	 */
	private  $_multitext;
	
	public function __construct() {
		$this->_multitext = array();
	}

	public function addForm($language, $text) {
		$this->_multitext[$language] = $text;
	}
	
	public function hasForm($language) {
		return key_exists($language, $this->_multitext);
	}
	
	public function getForm($language) {
		return $this->_multitext[$language];
	}
	
	public function getAllLanguages() {
		return array_keys($this->_multitext);
	}
	
	public function getAll() {
		return $this->_multitext;
	}
	
	public function encode() {
		return $this->_multitext;
	}
	
	public function decode($value) {
		foreach ($value as $language => $text) {
			if ($text) {
				$this->addForm($language, $text);
			}
		}
	}
	
	public static function create($language = '', $text = '') {
		$multitext = new MultiText();
		if ($language) {
			$multitext->addForm($language, $text);
		}
		return $multitext;
	}
	
	public static function createFromArray($value) {
		$result = new MultiText();
		$result->decode($value);
		return $result;
	}
	
}

?>