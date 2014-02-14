<?php

use libraries\lfdictionary\dto\AutoListEntry;

require_once(dirname(__FILE__) . '/../../TestConfig.php');
require_once(SIMPLETEST_PATH . 'autorun.php');
require_once(LF_BASE_PATH . "Loader.php");

class TestOfAutoListEntry extends UnitTestCase {

	function testAutoListEntry_Encode_JsonCorrect() {
		$dto = new AutoListEntry("guid", "word");
		$result = json_encode($dto->encode());
		$this->assertEqual($result, '{"Value":"guid","DisplayName":"word"}');
	}

}

?>