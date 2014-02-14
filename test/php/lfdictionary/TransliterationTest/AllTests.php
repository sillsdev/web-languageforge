<?php
require_once(dirname(__FILE__) . '/../../TestConfig.php');
require_once(SIMPLETEST_PATH .  'autorun.php');

class AllTransliterationTests extends TestSuite {
    function __construct() {
        parent::__construct();
        $this->addFile(TEST_PATH . 'TransliterationTest/TransliterationBasicFunctions_Test.php');
    }
}

?>