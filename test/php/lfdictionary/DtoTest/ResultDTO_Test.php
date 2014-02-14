<?php
use \libraries\lfdictionary\dto\ResultDTO;
require_once(dirname(__FILE__) . '/../../TestConfig.php');
require_once(SIMPLETEST_PATH . 'autorun.php');
require_once(LF_BASE_PATH . "Loader.php");

class TestOfResultDTO extends UnitTestCase {
	
	function testResultDTOEncode_ReturnsCorrectJson() {
		$dtoTrue = new ResultDTO(true);
		$resultTrue = json_encode($dtoTrue->encode());
		$this->assertEqual('{"succeed":true}', $resultTrue);
		
		$dtoFalse = new ResultDTO(false);
		$resultFalse = json_encode($dtoFalse->encode());
		$this->assertEqual('{"succeed":false}', $resultFalse);
	}

}

?>