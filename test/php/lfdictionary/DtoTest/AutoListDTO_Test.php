<?php
use libraries\lfdictionary\dto\AutoListDTO;
use libraries\lfdictionary\dto\AutoListEntry;

require_once(dirname(__FILE__) . '/../../TestConfig.php');
require_once(SIMPLETEST_PATH . 'autorun.php');
require_once(LF_BASE_PATH . "Loader.php");

class TestOfAutoListDTO extends UnitTestCase {

	function testAutoListDTO_Encode_JsonCorrect() {
		$dtoList = new AutoListDTO();

		$dtoA = new AutoListEntry("guid1", "word1");
		$dtoList->addListEntry($dtoA);

		$dtoB = new AutoListEntry("guid2", "word2");
		$dtoList->addListEntry($dtoB);

		$result = json_encode($dtoList->encode());
		$this->assertEqual(2,$dtoList->entryCount);
		$this->assertEqual($result, '{"TotalSize":2,"Options":[{"Value":"guid1","DisplayName":"word1"},{"Value":"guid2","DisplayName":"word2"}]}');
	}

}

?>