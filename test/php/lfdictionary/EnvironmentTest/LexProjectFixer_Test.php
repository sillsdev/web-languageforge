<?php
use \libraries\lfdictionary\common\HgWrapper;
use libraries\lfdictionary\environment\LexProject;
use libraries\lfdictionary\environment\LexProjectFixer;

require_once(dirname(__FILE__) . '/../../TestConfig.php');
require_once(SIMPLETEST_PATH . 'autorun.php');
require_once 'LexProjectTestEnvironment.php';


class TestOfLexProjectFixer extends UnitTestCase {
	
	function testCheckTemplatesExists_doesNotThrow() {
		// this is not really a test, but more of a warning in case the templates are not yet installed on the system
		LexProjectFixer::checkTemplatesExist();
	}
	
	function testFixProjectVLatest_noProject_defaultProjectCreated() {
		$e = new LexProjectTestEnvironment();
		$lexProject = $e->lexProject;
		$this->assertFileNotExist($e->getProjectPath());
		$this->assertFileNotExist($e->getProjectPath() . $e->projectCode . ".lift");
		LexProjectFixer::fixProjectVLatest($lexProject);
		$this->assertFileExists($e->getProjectPath());
		$this->assertFileExists($e->getProjectPath() . $e->projectCode . ".lift");
	}
	
	function testFixProjectVLatest_projectButNoConfig_configCopied() {
		$e = new LexProjectTestEnvironment();
		$lexProject = $e->lexProject;
		$lexProject->createNewProject();
		$configFile = $e->lexProject->projectDefaultSettingsFilePath();
		unlink($configFile);
		$this->assertFileNotExist($configFile);
		LexProjectFixer::fixProjectVLatest($lexProject);
		$this->assertFileExists($configFile);
	}
	
	function testFixProjectVLatest_projectButNoLift_liftCreated() {
		$e = new LexProjectTestEnvironment();
		$lexProject = $e->lexProject;
		$lexProject->createNewProject();
		$liftFile = $e->lexProject->projectPath . $e->projectCode . ".lift";
		unlink($liftFile);
		$this->assertFileNotExist($liftFile);
		LexProjectFixer::fixProjectVLatest($lexProject);
		$this->assertFileExists($liftFile);
	}
	
	function testFixProjectVLatest_projectButNoWS_wsCreated() {
		$e = new LexProjectTestEnvironment();
		$lexProject = $e->lexProject;
		$lexProject->createNewProject();
		$writingSystemFile = $lexProject->writingSystemsFolderPath() . "en.ldml";
		LexProjectTestEnvironment::recursiveDelete($lexProject->writingSystemsFolderPath());
		$this->assertFileNotExist($writingSystemFile);
		LexProjectFixer::fixProjectVLatest($lexProject);
		$this->assertFileExists($writingSystemFile);
	}
	
	private function assertFileExists($filePath) {
		$this->assertTrue(file_exists($filePath), sprintf("Expected file not found '%s'", $filePath));
	}

	private function assertFileNotExist($filePath) {
		$this->assertFalse(file_exists($filePath), sprintf("Unexpected file found '%s'", $filePath));
	}
	
}

?>