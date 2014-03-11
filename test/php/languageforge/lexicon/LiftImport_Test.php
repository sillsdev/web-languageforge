<?php

use models\languageforge\lexicon\LexiconProjectModel;
use models\languageforge\lexicon\commands\LexProjectCommands;
use models\languageforge\lexicon\LiftMergeRule;
use models\languageforge\lexicon\LiftImport;

require_once(dirname(__FILE__) . '/../../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');
require_once(TestPath . 'common/MongoTestEnvironment.php');
require_once(dirname(__FILE__) . '/LexTestData.php');

class TestLiftImport extends UnitTestCase {

	function testLiftImport_ValidXml_NoException() {
		$e = new LexiconMongoTestEnvironment();
		$e->clean();
		
		$project = $e->createProject(SF_TESTPROJECT);
		$liftXml = LexTestData::liftTwoEntriesV0_13;
		
		LiftImport::merge($liftXml, $project);
	}

	function testLiftImport_OldVer_Exception() {
		$e = new LexiconMongoTestEnvironment();
		$e->clean();
		
		$project = $e->createProject(SF_TESTPROJECT);
		$liftXml = LexTestData::liftOneEntryV0_12;
		
		$e->inhibitErrorDisplay();
		$this->expectError(new PatternExpectation("/Element lift failed to validate content/i"));
		LiftImport::merge($liftXml, $project);
		$e->restoreErrorDisplay();
	}

	function testLiftImport_InvalidAttribute_Exception() {
		$e = new LexiconMongoTestEnvironment();
		$e->clean();
		
		$project = $e->createProject(SF_TESTPROJECT);
		$liftXml = LexTestData::liftInvalidAttribute;
		
		$e->inhibitErrorDisplay();
		$this->expectError(new PatternExpectation("/Expecting an element pronunciation, got nothing/i"));
		$this->expectError(new PatternExpectation("/Invalid attribute xXxXx for element entry/i"));
		$this->expectError(new PatternExpectation("/Element lift has extra content: entry/i"));
		LiftImport::merge($liftXml, $project);
		$e->restoreErrorDisplay();
	}

}

?>
