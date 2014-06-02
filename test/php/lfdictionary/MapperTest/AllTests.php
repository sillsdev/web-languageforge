<?php
require_once(dirname(__FILE__) . '/../../TestConfig.php');
require_once(SIMPLETEST_PATH . 'autorun.php');
require_once(LF_BASE_PATH . "Loader.php");

class AllMapperTests extends TestSuite {
    function __construct() {
        parent::__construct();
        $this->addFile(TEST_PATH . 'MapperTest/InputSystemXmlJsonMapper_Test.php');
    }
}

?>