<?php
use libraries\lfdictionary\commands\GetDashboardDataCommand;

require_once(dirname(__FILE__) . '/../../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');

require_once(DicTestPath . 'CommandTest/LiftTestEnvironment.php');

use \libraries\lfdictionary\common\DataConnector;
use \libraries\lfdictionary\common\DataConnection;

class TestOfGetDashboardDataCommand extends UnitTestCase {

	function testGetDashboardCommand_30days() {

		$e = new LiftTestEnvironment();
		//2 entry, 2 word, 2sense, 1definition, 1 partofspeech, 2examples, 1exampleform
		$e->createLiftWith(2, 2, 2, 1, 1, 2, 1);
		
		$command = new GetDashboardDataCommand(null,284, $e->getLiftFilePath(),30);
		$result = $command->execute();
		//$this->assertEqual(30,count($result->_entryActivities));
		$this->assertEqual(count($result->_entryActivities),count($result->_activityDate));
		$this->assertEqual(8,$result->_statsExamples);
		$this->assertEqual(4,$result->_statsMeanings);
		$this->assertEqual(4,$result->_statsPOS);
		$this->assertEqual(2,$result->_statsWordCount);
	}

	function testGetDashboardCommand_365days() {

		$e = new LiftTestEnvironment();
		//2 entry, 2 word, 2sense, 1definition, 1 partofspeech, 2examples, 1exampleform
		$e->createLiftWith(2, 2, 2, 1, 1, 2, 1);

		$command = new GetDashboardDataCommand(null,284,$e->getLiftFilePath(),365);
		$result = $command->execute();
		//$this->assertEqual(365,count($result->_entryActivities));
		$this->assertEqual(count($result->_entryActivities),count($result->_activityDate));
		$this->assertEqual(8,$result->_statsExamples);
		$this->assertEqual(4,$result->_statsMeanings);
		$this->assertEqual(4,$result->_statsPOS);
		$this->assertEqual(2,$result->_statsWordCount);

	}

	function testGetDashboardCommand_All() {

		$e = new LiftTestEnvironment();
		//2 entry, 2 word, 2sense, 1definition, 1 partofspeech, 2examples, 1exampleform
		$e->createLiftWith(2, 2, 2, 1, 1, 2, 1);

		$command = new GetDashboardDataCommand(null,284,$e->getLiftFilePath(),0);
		$result = $command->execute();
		//$this->assertEqual(365,count($result->_activities));
		$this->assertEqual(count($result->_entryActivities),count($result->_activityDate));
		$this->assertEqual(8,$result->_statsExamples);
		$this->assertEqual(4,$result->_statsMeanings);
		$this->assertEqual(4,$result->_statsPOS);
		$this->assertEqual(2,$result->_statsWordCount);

	}
}

?>