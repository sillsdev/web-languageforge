<?php
require_once(dirname(__FILE__) . '/../../TestConfig.php');
require_once(SIMPLETEST_PATH . 'autorun.php');

require_once(SOURCE_PATH . 'environment/LanguageDepotImporter.php');

// The define below determines whether the test should use test the language depot database features of the importer.
define('LANGUAGEDEPOT_IMPORT_USEDB', false);

if (LANGUAGEDEPOT_IMPORT_USEDB == true) {
	// TODO More environment required for test here. CP 2012-08
	
}

class TestOfLanguageDepotProjectDatabase extends UnitTestCase {

	function testLangDepotProjectRepo() {
		if (LANGUAGEDEPOT_IMPORT_USEDB == true) {
		
		$db = new DrupalTestEnvironment();
		$db->import();

		$projectId = 96;
		$userId = 3;

		$projectcode = 'tha-food';
		$username = 'arivu';
		$password = 'uvira23';
		$projectModel = new ProjectModel($projectId);
		$destination = TEST_PATH . "data/" . $projectModel->getName();
		$source = "http://$username:$password@hg-public.languagedepot.org/$projectcode";
		$LangDepotProjectRepo = new LangDepotProjectRepo($projectcode);
		$LangDepotProjectRepo->makeReady($projectId, $source, $destination);
		 
		//Test destination folder exist
		$this->assertTrue(is_dir($destination));
		
		$UserModel = new UserModel($userId);
		$output = $UserModel->listUsersInProject($projectId);
		$listoutput = json_encode($output->encode());
		
		$this->assertEqual('{"List":[{"uid":"62","name":"tarmstrong","mail":"tim_armstrong@sil.org"},{"uid":"63","name":"chirt","mail":"chris_hirt@sil.org"},{"uid":"64","name":"guest-palaso","mail":"noone@palaso.org"},{"uid":"65","name":"wdg","mail":"daniel_glassey@sil.org"}]}', $listoutput);
		
		if (is_dir($destination)) {			
			$db->rrmdir($destination);
		}
		
		$db->dispose();
		} // endif LANGUAGEDEPOT_IMPORT_USEDB
	}
	
	function testIsProjectManager() {
		if (LANGUAGEDEPOT_IMPORT_USEDB == true) {
		
		$db = new DrupalTestEnvironment();
		$db->import();		
		
		$projectId = 96;
		
		$projectcode = 'tha-food';
		$userMail = 'cambell.prince@gmail.com';
		$LangDepotProjectRepo = new LangDepotProjectRepo($projectcode);
		$output = $LangDepotProjectRepo->IsProjectManager($userMail);
		 
		//Test destination folder exist
		$this->assertTrue($output);		
		
		$db->dispose();
		} // endif LANGUAGEDEPOT_IMPORT_USEDB
	}
}

?>