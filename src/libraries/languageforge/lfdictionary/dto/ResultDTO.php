<?php
namespace libraries\lfdictionary\dto;

/**
 * This class contains RPC API call simple result
 */
class ResultDTO {
	
	/**
	 * @var boolean
	 */
	private $_succeed;
	
	/**
	 * @var boolean
	 */
	private $_haserror;
	
	/**
	* @var string
	*/
	private $_code;
	
	/**
	 * @param Boolean $succeed
	 */
	public function __construct($succeed, $code = "", $haserror = false) {
		$this->_succeed = $succeed;
		$this->_code = $code;
		$this->_haserror = $haserror;
	}
	
	/**
	 * Encodes the object into a php array, suitable for use with json_encode
	 * @return mixed
	 */
	public function encode() {
		return array(
			'succeed' => $this->_succeed,
		 	'code' => $this->_code,
			'haserror'  => $this->_haserror,
		);
		
	}
}

?>