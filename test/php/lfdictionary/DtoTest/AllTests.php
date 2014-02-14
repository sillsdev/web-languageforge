<?php
require_once(dirname(__FILE__) . '/../../TestConfig.php');
require_once(SIMPLETEST_PATH .  'autorun.php');

class AllModelTests extends TestSuite {
    function __construct() {
        parent::__construct();
        $this->addFile(TEST_PATH . 'DtoTest/MultiText_Test.php');
		$this->addFile(TEST_PATH . 'DtoTest/UserDTO_Test.php');
		$this->addFile(TEST_PATH . 'DtoTest/ProjectDTO_Test.php');
		$this->addFile(TEST_PATH . 'DtoTest/CommunityDTO_Test.php');
		$this->addFile(TEST_PATH . 'DtoTest/ConversationDTO_Test.php');
		$this->addFile(TEST_PATH . 'DtoTest/ClientEnvironmentDto_Test.php');
		$this->addFile(TEST_PATH . 'DtoTest/ResultDTO_Test.php');
		$this->addFile(TEST_PATH . 'DtoTest/ProjectAccessDTO_Test.php');
    }
}

?>