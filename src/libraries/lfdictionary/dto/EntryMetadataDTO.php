<?php
namespace libraries\lfdictionary\dto;

/**
 * This class contains metadata for entry element and it sub-elements
 */
class EntryMetadataDTO {

	/**
	 * user's UUID in string
	 * @var String
	 */
	var $_createdbyId;
	
	/**
	 * user's name in string
	 * @var String
	 */
	var $_createdby;
	
	/**
	 *	datetime in timestamp
	 * @var int
	 */
	var $_createdDate;
	
	/**
	 * user's UUID in string
	 * @var String
	 */
	var $_modifiedById;
	
	/**
	 * user's name in string
	 * @var String
	 */
	var $_modifiedBy;
	
	/**
	 * datetime in timestamp
	 * @var int
	 */
	var $_modifiedDate;
	
	public function __construct() {

		$this->_createdbyId = "";
		$this->_createdby = "";
		$this->_createdDate = 0;
		$this->_modifiedById = "";
		$this->_modifiedBy = "";
		$this->_modifiedDate = 0;
	}
	
	/**
	 * Encodes the object into a php array, suitable for use with json_encode
	 * @return mixed
	 */
	function encode() {
		return array(
			'crid' => $this->_createdbyId,
			'crname' => $this->_createdby,
			'modid' => $this->_modifiedById,
			'modname' => $this->_modifiedBy,
			'crdate' => $this->_createdDate,
			'moddate' => $this->_modifiedDate
		);
		
	}
	
	static function createFromArray($value) {
		$result = new EntryMetadataDTO();
		$result->decode($value);
		return $result;
	}
	
	public function decode($value) {

		$this->_createdbyId = $value['crid'];
		$this->_createdby = $value['crname'];
		$this->_createdDate = $value['crdate'];
		$this->_modifiedById = $value['modid'];
		$this->_modifiedBy = $value['modname'];
		$this->_modifiedDate = $value['moddate'];	
	}
}

?>