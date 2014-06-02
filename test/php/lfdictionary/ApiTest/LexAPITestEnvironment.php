<?php

define('LEXAPI_TEST_PROJECT_ID', 26);
define('LEXAPI_TEST_USER_ID', 8);

class LexAPITestEnvironment {
	
	/**
	 * @var int
	 */
	public $ProjectNodeId;

	/**
	 * @var int
	 */
	public $UserId;
	
	public function __construct($projectNodeId = LEXAPI_TEST_PROJECT_ID, $userId = LEXAPI_TEST_USER_ID) {
		$this->ProjectNodeId = $projectNodeId;
		$this->UserId = $userId;
	}
	
}

class LexAPITestCase extends UnitTestCase {
	/**
	 *
	 * @var LexAPITestEnvironment
	 */
	var $_e;
	
	function __construct() {
		$this->_e = new LexAPITestEnvironment();
	}
	
}

?>