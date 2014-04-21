<?php
require_once(dirname(__FILE__) . '/../../TestConfig.php');
require_once(SIMPLETEST_PATH . 'autorun.php');
require_once(LF_BASE_PATH . "Loader.php");
require_once(TEST_PATH . '/../CommandTest/LiftTestEnvironment.php');
use dashboardtool\DashboardCounterExtracter;

class DashboardCounterExtracter_Test extends UnitTestCase {
	
	function testInsertCounters() {
		$e = new LiftTestEnvironment();
		//2 entry, 2 word, 2sense, 1definition, 1 partofspeech, 2examples, 1exampleform
		$e->createLiftWith(2, 2, 2, 1, 1, 2, 1);
	
		$timestamp = mktime(0, 0, 0, date("m"), date("d"), date("y"));
	
		
		$dashboardCounterExtracter = new DashboardCounterExtracter(array("pid" => 284));
		
		$result = $dashboardCounterExtracter->readAndInsertCounters($e->getLiftFilePath(), $timestamp, 20, "123456");
	
		$this->assertTrue($result);

	}	
}
?>