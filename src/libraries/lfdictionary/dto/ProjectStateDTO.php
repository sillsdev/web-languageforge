<?php
namespace libraries\lfdictionary\dto;

class ProjectStateDTO
{
	/**
	 * @var string
	 */
	public $Result;
	
	/**
	 * @var string
	 */
	public $Message;

	/**
	 * @var int
	 */
	public $Progress;
	
	
	public function __construct($result, $message = '') {
		$this->Result = $result;
		$this->Message = $message;
	}
	
	/**
	 * Encodes the object into a php array, suitable for use with json_encode
	 * @return mixed
	 */
	public function encode() {
		return array(
			'result' => $this->Result, 
			'message' => $this->Message,
			'progress' => $this->Progress
		);
	}
	
}

?>