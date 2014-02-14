<?php

use models\scriptureforge\dto\UsxHelper;

require_once(dirname(__FILE__) . '/../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');

require_once(TestPath . 'common/MongoTestEnvironment.php');

class TestUsxHelper extends UnitTestCase {

	function __construct() {
	}

	function testAsHtml_works() {
		$usx = MongoTestEnvironment::usxSample();

		$usxHelper = new UsxHelper($usx);
		$result = $usxHelper->toHtml();
		echo $result;
	}
	
}

?>
