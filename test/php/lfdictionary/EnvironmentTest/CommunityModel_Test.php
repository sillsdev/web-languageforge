<?php
require_once(dirname(__FILE__) . '/../../TestConfig.php');
require_once(SIMPLETEST_PATH . 'autorun.php');
require_once(LF_BASE_PATH . "Loader.php");

//require_once(SOURCE_PATH . 'environment/CommunityModel.php');
require_once(TEST_PATH . 'EnvironmentTest/DrupalTestEnvironment.php');
DrupalTestEnvironment::setDrupalTestDataConnection();
\libraries\lfdictionary\common\LFDrupal::loadDrupal();

class TestOfCommunityModule extends UnitTestCase {
	
	function __destruct() {
		DrupalTestEnvironment::revertBackTestDataConnection();
	}
	
	function testsearchCommunity() {
		
		$db = new DrupalTestEnvironment();
		$db->import();
		
		$projectId = 87;		
		$communityModel = new \libraries\lfdictionary\environment\CommunityModel($projectId);		
		
		//SearchUser
		$string = 'tel';
		$result = $communityModel->searchCommunity($string, 10);
		$output = json_encode($result->encode());
		
		$this->assertEqual('{"List":[{"CommunityId":"86","CommunityName":"Telugu"}]}', $output);
		
		$db->dispose();
	}
	
	function testaddProject() {
		
		$db = new DrupalTestEnvironment();
		$db->import();
		
		$projectId = 87;
		$communityModel = new \libraries\lfdictionary\environment\CommunityModel($projectId);		
		
		$db->setDrupalConnection(); //Drupal Database connection
		
		//Add Community
		$newCommunity = array('title'=>"malayalam", 'uid'=>'3', 'code'=>'ma');		
		$result = $communityModel->addCommunity($newCommunity);
		$this->assertTrue($result);
		
		$result = $communityModel->listCommunities(0, 2);
		$output = json_encode($result->encode());
		$this->assertEqual('{"List":[{"CommunityId":"86","CommunityName":"Telugu"},{"CommunityId":"90","CommunityName":"Thai"}]}', $output);
		
		$db->closeDrupalConnection(); // set back to original
		
		$db->dispose();
	}
}

?>