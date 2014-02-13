<?php
namespace libraries\lfdictionary\dto;

class EntryDTO {

	/**
	 *
	 * @var string
	 */
	var $_guid;

	/**
	 *
	 * @var string
	 */
	var $mercurialSHA;

	/**
	 * This is a single LF domain
	 * @var MultiText
	 */
	var $_entry;

	/**
	 * @var array<Sense>
	 */
	var $_senses;

	/**
	 *
	 * @var EntryMetadataDTO
	 */
	var $_metadata;

	private function __construct($guid=null) {
		$this->_guid = $guid;
		$this->_entry = new \libraries\lfdictionary\dto\MultiText();
		$this->_senses = array();
		$this->_metadata = new \libraries\lfdictionary\dto\EntryMetadataDTO();
	}

	/**
	 * @param string $guid
	 */
	function setGuid($guid) {
		$this->_guid = $guid;
	}

	/**
	 * @return string
	 */
	function getGuid() {
		return $this->_guid;
	}

	/**
	 * @param string $mercurialSHA
	 */
	function setMercurialSHA($mercurialSHA) {
		$this->mercurialSHA = $mercurialSHA;
	}

	/**
	 * @return string
	 */
	function getMercurialSHA() {
		return $this->mercurialSHA;
	}

	/**
	 * @param MultiText $multitext
	 */
	function setEntry($multitext) {
		$this->_entry = $multitext;
	}

	/**
	 * @return MultiText
	 */
	function getEntry() {
		return $this->_entry;
	}

	/**
	 * @param Sense $sense
	 */
	function addSense($sense) {
		$this->_senses[] = $sense;
	}

	/**
	 * @return int
	 */
	function senseCount() {
		return count($this->_senses);
	}

	/**
	 * @param int $index
	 * @return Sense
	 */
	function getSense($index) {
		return $this->_senses[$index];
	}

	/**
	 * Encodes the object into a php array, suitable for use with json_encode
	 * @return mixed
	 */
	function encode() {
		$senses = array();
		foreach ($this->_senses as $sense) {
			$senses[] = $sense->encode();
		}
		return array(
				"guid" => $this->_guid,
				"mercurialSHA" => $this->mercurialSHA,
				"entry" => $this->_entry->encode(),
				"senses" => $senses,
				"metadata" => $this->_metadata->encode()
		);

	}

	/**
	 * Decodes the given mixed object into a new EntryDTO
	 * @param mixed $value
	 * @return EntryDTO
	 */
	function decode($value) {
		if ($value == null) {
			return;
		}
		$this->_metadata = new \libraries\lfdictionary\dto\EntryMetadataDTO();
		$this->_guid = $value['guid'];
		$this->mercurialSHA = $value['mercurialSHA'];
		$this->_entry = \libraries\lfdictionary\dto\MultiText::createFromArray($value['entry']);
		if (isset($value['metadata'])){
			$this->_metadata = \libraries\lfdictionary\dto\EntryMetadataDTO::createFromArray($value['metadata']);
		}

		foreach ($value['senses'] as $senseValue) {
			$sense = Sense::createFromArray($senseValue);
			$this->addSense($sense);
		}
	}

	/**
	 * @return EntryDTO
	 */
	static function create($guid) {
		return new EntryDTO($guid);
	}

	/**
	 * @return EntryDTO
	 */
	static function createFromArray($value) {
		$result = new EntryDTO();
		$result->decode($value);
		return $result;
	}

}

?>