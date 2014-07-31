<?php

use models\languageforge\lexicon\LexiconProjectModel;
use models\languageforge\lexicon\LexEntryListModel;
use models\languageforge\lexicon\LiftImport;
use models\languageforge\lexicon\LiftMergeRule;
use models\languageforge\lexicon\LexEntryModel;

require_once(dirname(__FILE__) . '/../../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');
require_once(TestPath . 'common/MongoTestEnvironment.php');
require_once(dirname(__FILE__) . '/LexTestData.php');

class TestLiftImportInfo {
	
	public $points;
	
	function __construct() {
		$this->points = array();
		$this->add('base');
	}
	
	function add($name) {
		$mem = memory_get_peak_usage(true);
		$current = memory_get_usage();
		$point = array('name' => $name, 'mem' => $mem, 'current' => $current);
		$this->points[] = $point;
 		$this->displayPoint($point);
	}
	
	function display() {
		foreach($this->points as $point) {
			$this->displayPoint($point);
		}
	}
	
	function displayPoint($point) {
		echo $point['name'] . ' pk '. $point['mem'] / 1024 . 'K cur '  . $point['current'] / 1024 . 'K<br/>';
	}
	
}

class TestLiftImport extends UnitTestCase {

	function testLiftImportMerge_LargeFile_NoException() {
		global $testInfo;
		$testInfo = new TestLiftImportInfo();
		
		$e = new LexiconMongoTestEnvironment();
		$e->clean();
		
		$project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
		$liftTestFilePath = '/var/www/host/forge/TestData/Gilaki/Gilaki.lift';
// 		$liftTestFilePath = '/var/www/host/forge/TestData/Webster/Webster.lift';
		$mergeRule =  LiftMergeRule::IMPORT_WINS;
		$skipSameModTime = false;

		$liftXml = file_get_contents($liftTestFilePath);
		$testInfo->add('file');
		
		LiftImport::merge($liftXml, $project, $mergeRule, $skipSameModTime);
		
		$testInfo->display();
		

	}

}

?>
