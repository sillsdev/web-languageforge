<?php
require_once(dirname(__FILE__) . '/../../TestConfig.php');
require_once(SIMPLETEST_PATH .  'autorun.php');

class AllStoreTests extends TestSuite {
    function __construct() {
        parent::__construct();
        $this->addFile(TEST_PATH . 'store/LexStoreMongo_Tests.php');
        $this->addFile(TEST_PATH . 'store/LexStore_Tests.php');
        $this->addFile(TEST_PATH . 'store/LiftScanner_Tests.php');
        $this->addFile(TEST_PATH . 'store/LiftMongoImporter_Tests.php');
    }
}

?>