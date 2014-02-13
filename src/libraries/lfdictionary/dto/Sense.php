<?php
namespace libraries\lfdictionary\dto;

class Sense {

	/**
	 * @var MultiText
	 */
	var $_definition;

	/**
	 * @var string
	 */
	var $_partOfSpeech;

	/**
	 * @var string
	 */
	var $_semanticDomainName;

	/**
	 * @var string
	 */
	var $_semanticDomainValue;

	/**
	 * @var array<Example>
	 */
	var $_examples;

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
		$this->_examples = array();
		$this->_definition = \libraries\lfdictionary\dto\MultiText::create();
		$this->_partOfSpeech = '';
		$this->_metadata = new \libraries\lfdictionary\dto\EntryMetadataDTO();
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
	function getDefinition() {
		return $this->_definition;
	}

	/**
	 * @param MultiText $multitext
	 */
	function setDefinition($multiText) {
		$this->_definition = $multiText;
	}

	/**
	 * @return string
	 */
	function getPartOfSpeech() {
		return $this->_partOfSpeech;
	}

	/**
	 * @param string $partOfSpeech
	 */
	function setPartOfSpeech($partOfSpeech) {
		$this->_partOfSpeech = $partOfSpeech;
	}

	/**
	 * @return string
	 */
	function getSemanticDomainName() {
		return $this->_semanticDomainName;
	}

	/**
	 * @param string $semanticDomainName
	 */
	function setSemanticDomainName($semanticDomainName) {
		$this->_semanticDomainName = $semanticDomainName;
	}

	/**
	 * @return string
	 */
	function getSemanticDomainValue() {
		return $this->_semanticDomainValue;
	}

	/**
	 * @param string $semanticDomainValue
	 */
	function setSemanticDomainValue($semanticDomainValue) {
		$this->_semanticDomainValue = $semanticDomainValue;
	}


	/**
	 * @param Example $example
	 */
	function addExample($example) {
		$this->_examples[] = $example;
	}

	/**
	 * @return int
	 */
	function exampleCount() {
		return count($this->_examples);
	}

	/**
	 * @param int $index
	 * @return Example
	 */
	function getExample($index) {
		return $this->_examples[$index];
	}

	function encode() {
		$examples = array();

		foreach ($this->_examples as $example) {
			$examples[] = $example->encode();
		}

		$definition = $this->_definition->encode();

		return array(
				"id" => $this->_id,
				"definition" => $definition,
				"POS" => $this->_partOfSpeech,
				"examples" => $examples,
				"SemDomValue"  => $this->_semanticDomainValue,
				"SemDomName"  => $this->_semanticDomainName,
				"metadata" =>  $this->_metadata->encode()
		);
	}

	function decode($value) {
		$this->_metadata = new \libraries\lfdictionary\dto\EntryMetadataDTO();
		if (isset( $value['id'])){
			$this->_id = $value['id'];
		}
		$this->_definition = \libraries\lfdictionary\dto\MultiText::createFromArray($value['definition']);
		$this->_partOfSpeech = $value['POS'];

		if (isset( $value['SemDomValue'])){
			$this->_semanticDomainValue = $value['SemDomValue'];
		}
		
		if (isset( $value['SemDomName'])){
			$this->_semanticDomainName = $value['SemDomName'];
		}
		
		if (isset($value['metadata'])){
			$this->_metadata = \libraries\lfdictionary\dto\EntryMetadataDTO::createFromArray($value['metadata']);
		}
		
		foreach ($value['examples'] as $exampleValue) {
			$example = Example::createFromArray($exampleValue);
			$this->addExample($example);
		}
	}

	/**
	 * @return Sense
	 */
	static function create() {
		return new Sense(); // Kind of pointless, but it fits the pattern we are using for other model classes. CP 2011-06
	}

	/**
	 * @return Sense
	 */
	static function createFromArray($value) {
		$result = new Sense();
		$result->decode($value);
		return $result;
	}

}

?>