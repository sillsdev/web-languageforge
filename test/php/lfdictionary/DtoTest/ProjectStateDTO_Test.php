<?php

use \libraries\lfdictionary\dto\ProjectStateDTO;

require_once(dirname(__FILE__) . '/../../TestConfig.php');
require_once(SIMPLETEST_PATH . 'autorun.php');
require_once(LF_BASE_PATH . "Loader.php");

class TestOfProjectStateDTO extends UnitTestCase {

	function testProjectStateDTO_Encode_JsonCorrect() {
		$dto = new ProjectStateDTO("Result", "Message");
		$dto->Progress=10;
		$result = json_encode($dto->encode());
		
		$this->assertEqual($result, '{"result":"Result","message":"Message","progress":10}');
	}

}

?>