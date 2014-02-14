<?php

use libraries\lfdictionary\environment\ProjectRole;
use libraries\lfdictionary\environment\ProjectPermission;
use libraries\lfdictionary\environment\LFProjectAccess;
use libraries\lfdictionary\environment\EnvironmentMapper;
use \libraries\lfdictionary\dto\ProjectAccessDTO;

require_once(dirname(__FILE__) . '/../../TestConfig.php');
require_once(SIMPLETEST_PATH . 'autorun.php');
require_once(LF_BASE_PATH . "Loader.php");
require_once(dirname(__FILE__) . '/../MockObject/AllMockObjects.php');


class TestOfProjectAccessDTO extends UnitTestCase {


	function __construct() {
		EnvironmentMapper::connect(new ProjectAccessMockEnvironment());
	}

	function testProjectAccessDTOEncode_ReturnsCorrectJson() {
		$p = new LFProjectAccess(TestEnvironment::PROJECT_ID, TestEnvironment::USER_ID);
		$dto = new ProjectAccessDTO($p);
		$result = json_encode($dto->encode());
		$this->assertEqual('{"grants":[1],"activerole":"admin","availableroles":{"admin":"admin","user":"user"}}', $result);
	}

}

?>