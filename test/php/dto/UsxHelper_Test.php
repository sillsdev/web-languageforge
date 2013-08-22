<?php

use models\dto\UsxHelper;

require_once(dirname(__FILE__) . '/../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');

require_once(TestPath . 'common/MongoTestEnvironment.php');

class TestUsxHelper extends UnitTestCase {

	function __construct() {
	}

	function testAsHtml_works() {
		global $rootPath;
		$testFilePath = $rootPath . 'docs/usx/043JHN.usx';
		$usx = file_get_contents($testFilePath);
		$usxHelper = new UsxHelper($usx);
		$usxHelper->toHtml();
	}
	
}

?>
