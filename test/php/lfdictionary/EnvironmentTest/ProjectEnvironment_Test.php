<?php
use libraries\lfdictionary\environment\LexiconProjectEnvironment;
require_once(dirname(__FILE__) . '/../../TestConfig.php');
require_once(SIMPLETEST_PATH . 'autorun.php');
require_once(LF_BASE_PATH . "Loader.php");
require_once(dirname(__FILE__) . '/../MockObject/AllMockObjects.php');
// require_once(TEST_PATH . 'EnvironmentTest/DrupalTestEnvironment.php');

// DrupalTestEnvironment::setDrupalTestDataConnection();
// \libraries\lfdictionary\common\LFDrupal::loadDrupal();

// Test project
define('PROJECT_NID', 284);
define('PROJECT_TITLE', "Thai Food");
define('PROJECT_LANGUAGE_CODE', "th");
define('PROJECT_NAME', "th-thai_food-dictionary");
define('PROJECT_TYPE', 'Translation');

define('UID', 4);

class TestLexiconProjectEnvironment extends UnitTestCase {

	function __construct() {
	}

	function __destruct() {
// 		DrupalTestEnvironment::revertBackTestDataConnection();
	}
	
	function testProjectPath_correct() {
		$result = LexiconProjectEnvironment::projectPath(new ProjectModelMockObject());
		$this->assertEqual('/var/lib/languageforge/work/someproject', $result);
	}
	
	function testTemplatePath_correct() {
		$result = LexiconProjectEnvironment::templatePath();
		$this->assertEqual('/var/lib/languageforge/lexicon/template/', $result);
	}
	
	function testProjectDefaultSettingsFilePath_correct() {
		$projectPath = LexiconProjectEnvironment::projectPath(new ProjectModelMockObject());
		$result = LexiconProjectEnvironment::projectDefaultSettingsFilePath($projectPath);
		$this->assertEqual('/var/lib/languageforge/work/someproject/LanguageForgeSettings/default.WeSayConfig', $result);
	}
}

?>