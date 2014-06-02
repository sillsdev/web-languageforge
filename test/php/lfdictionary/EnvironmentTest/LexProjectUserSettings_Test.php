<?php
require_once(dirname(__FILE__) . '/../../TestConfig.php');
require_once(SIMPLETEST_PATH . 'autorun.php');

require_once(SOURCE_PATH . 'environment/LexProjectUserSettings.php');
require_once(TEST_PATH . 'EnvironmentTest/DrupalTestEnvironment.php');
DrupalTestEnvironment::setDrupalTestDataConnection();
require_once(SOURCE_PATH . "common/LFDrupal.php");
LFDrupal::loadDrupal();

class LexProjectUserSettings extends UnitTestCase {

	function testgetVernacularAnalysisLang() {
		
		$db = new DrupalTestEnvironment();
		$db->import();
		
	/* 	$projectId = 87;
		$FieldSettingsModel = new FieldSettingsModel($projectId);		
		
		$FieldSettingsModel->getVernacularAnalysisLang();		
		$result = json_encode($FieldSettingsModel->encode());
		
		$this->assertEqual('{"Word":{"Label":"Word","Languages":["IPA","te"]},"POS":{"Label":"Part Of Speech","Languages":["en"]},"Definition":{"Label":"Meaning","Languages":["en"]},"Example":{"Label":"Example","Languages":["IPA","te"]},"Translation":{"Label":"Translation","Languages":["en"]}}', $result);
		
		//Analysis code has been updated to "th"
		$sql = "UPDATE content_field_analysislang SET field_analysislang_value = 'th' WHERE nid = $projectId";
		$query = mysql_query($sql);
		
		//After update Project Analysis Code
		$FieldSettingsModel->getVernacularAnalysisLang();
		$result = json_encode($FieldSettingsModel->encode());
		
		$this->assertEqual('{"Word":{"Label":"Word","Languages":["IPA","te"]},"POS":{"Label":"Part Of Speech","Languages":["th"]},"Definition":{"Label":"Meaning","Languages":["th"]},"Example":{"Label":"Example","Languages":["IPA","te"]},"Translation":{"Label":"Translation","Languages":["th"]}}', $result); */
		
		$db->dispose();
	}
}
DrupalTestEnvironment::revertBackTestDataConnection();

?>