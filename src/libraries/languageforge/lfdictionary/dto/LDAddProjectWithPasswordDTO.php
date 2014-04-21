<?php
namespace libraries\lfdictionary\dto;

/**
 * Add Project With Password DTO for use with Language Depot API method
 */
// TODO Unused? CP 2013-12
class LDAddProjectWithPasswordDTO {
	
	/*
	 * @var string
	 */
	private $_status;
	
	/*
	 * @var string
	 */
	private $_message;
	
	/*
	 * @var string
	 */
	private $_id;

	
	/**
	 * @param string $statusCode
	 */
	function __construct($statusCode) {
		$this->_status = $statusCode;
	}
	
	/*
	 * Sets the project ID or SLUG to be returned
	 * 
	 * @param string $identifier
	 * 
	 */
	public function projectIdentifier($identifier) {
		$this->_id = $identifier;
	}
	
	/*
	 * Send an Error message to describe the error state
	 * @param string $errorMessage
	 */
	public function message($errorMessage) {
		$this->_message = $errorMessage;
	}

	
	/**
	 * Encodes the object into a php array, suitable for use with json_encode
	 * @return array
	 */
	function encode() {
		return array(
 			'identifier' => $this->_id,
 			'message' => $this->_message,
			'status' => $this->_status
		);

	}
}
?>