<?php
require_once(dirname(__FILE__) . '/../../TestConfig.php');
require_once(SIMPLETEST_PATH . 'autorun.php');
require_once(LF_BASE_PATH . "Loader.php");

use models\ProjectModel;
use models\UserModel;

// require_once(TEST_PATH . 'EnvironmentTest/DrupalTestEnvironment.php');

class Drupal7TestEnvironment {
	
	const USER_ID = 7;
	const PROJECT_ID = 26;
	
}

class TestDrupal7EnivronmentMapper extends UnitTestCase {
	
	function testReadUser_Reads() {
		$model = new UserModel(Drupal7TestEnvironment::USER_ID);
		$this->assertEqual('sampleuser', $model->getUserName());
	}

	function testReadProject_Reads() {
		$model = new ProjectModel(Drupal7TestEnvironment::PROJECT_ID);
		$this->assertEqual('Test4', $model->getTitle());
		$this->assertEqual('mi-test4-dictionary', $model->getName());
	}
	
	function testWriteProject_ReadsBack() {
	}
	
	function testReadLFProjectAccess_Reads() {
	}
	
	function testWriteLFProjectAccess_ReadsBack() {
	}
	
	
}

?>