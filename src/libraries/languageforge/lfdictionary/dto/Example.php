<?php
namespace libraries\languageforge\lfdictionary\dto;

class Example {

	/**
	 *
	 * Enter description here ...
	 * @var MultiText
	 */
	var $_example;

	/**
	 *
	 * Enter description here ...
	 * @var MultiText
	 */
	var $_translation;

	/**
	 *
	 * @var EntryMetadataDTO
	 */
	var $_metadata;

	/**
	 *
	 * @var String
	 */
	var $_id;

	function __construct() {
		$this->_id = "";
		$this->_example = new \libraries\languageforge\lfdictionary\dto\MultiText();
		$this->_translation = new \libraries\languageforge\lfdictionary\dto\MultiText();
		$this->_metadata = new \libraries\languageforge\lfdictionary\dto\EntryMetadataDTO();
	}

	/**
	 * @return String
	 */
	function getId() {
		return $this->_id;
	}

	/**
	 * @param String $id
	 */
	function setId($id) {
		$this->_id = $id;
	}

	/**
	 * @return MultiText
	 */
	function getExample() {
		return $this->_example;
	}

	/**
	 * @param MultiText $multitext
	 */
	function setExample($multitext) {
		$this->_example = $multitext;
	}

	/**
	 * @return MultiText
	 */
	function getTranslation() {
		return $this->_translation;
	}

	/**
	 * @param MultiText $multitext
	 */
	function setTranslation($multitext) {
		$this->_translation = $multitext;
	}

	function encode() {
		$translation = $this->_translation->encode();

		return array("id" => $this->_id, "example" => $this->_example->encode(), "translation" => $translation, "metadata" => $this->_metadata->encode());
	}

	function decode($value) {
		$this->_metadata = new \libraries\languageforge\lfdictionary\dto\EntryMetadataDTO();
		if (isset( $value['id'])){
			$this->_id = $value['id'];
		}
		$this->_example = \libraries\languageforge\lfdictionary\dto\MultiText::createFromArray($value['example']);
		$this->_translation = \libraries\languageforge\lfdictionary\dto\MultiText::createFromArray($value['translation']);
		if (isset($value['metadata'])){
			$this->_metadata = \libraries\languageforge\lfdictionary\dto\EntryMetadataDTO::createFromArray($value['metadata']);
		}
	}

	/**
	 *
	 * Create a new Example with the given example and translation.
	 * @param MultiText $example
	 * @param MultiText $translation
	 */
	static function create($example, $translation) {
		$result = new Example();
		$result->setExample($example);
		$result->setTranslation($translation);
		return $result;
	}

	static function createFromArray($value) {
		$result = new Example();
		$result->decode($value);
		return $result;
	}

}

?>