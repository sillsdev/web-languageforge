<?php

use \libraries\lfdictionary\dto\CommunityDTO;
use \libraries\lfdictionary\dto\CommunityListDTO;

require_once(dirname(__FILE__) . '/../../TestConfig.php');
require_once(SIMPLETEST_PATH . 'autorun.php');
require_once(LF_BASE_PATH . "Loader.php");

class TestOfCommunityDTO extends UnitTestCase {

	function testEncode_ListAddCommunity_JsonCorrect() {
	
		$community = new CommunityDTO();
		$community->addCommunityId(86);
		$community->addCommunityName('Telugu');
		
		$result = json_encode($community->encode());
		$this->assertEqual('{"CommunityId":86,"CommunityName":"Telugu"}', $result);
		
		$CommunityListDTO = new CommunityListDTO();
		$CommunityListDTO->addListCommunity($community);
		$result = json_encode($CommunityListDTO->encode());
		
		$this->assertEqual('{"List":[{"CommunityId":86,"CommunityName":"Telugu"}]}', $result);
	}
}

?>