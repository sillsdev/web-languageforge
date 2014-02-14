<?php
use \libraries\lfdictionary\dto\DomainTreeDTO;

require_once(dirname(__FILE__) . '/../../TestConfig.php');
require_once(SIMPLETEST_PATH . 'autorun.php');
require_once(LF_BASE_PATH . "Loader.php");

class TestOfDomainTreeDTO extends UnitTestCase {

	function testDomainTreeDTO_Encode_JsonCorrect() {
		$dtoParent = new DomainTreeDTO();
		$dtoChildA = new DomainTreeDTO();
		$dtoChildB = new DomainTreeDTO();
		
		$dtoChildA->setKey("ChildKeyA");
		$dtoChildA->setGuid("ChildGuidB");
		
		$dtoChildB->setKey("ChildKeyA");
		$dtoChildB->setGuid("ChildGuidB");
		
		$dtoParent->add($dtoChildA);
		$dtoParent->add($dtoChildB);
		$dtoParent->setKey("ParentKey");
		$dtoParent->setGuid("ParentGuid");
		
		$result = json_encode($dtoParent->encode());
		
		$this->assertEqual($result, '{"key":"ParentKey","guid":"ParentGuid","children":[{"key":"ChildKeyA","guid":"ChildGuidB","children":[]},{"key":"ChildKeyA","guid":"ChildGuidB","children":[]}]}');
	}

}

?>