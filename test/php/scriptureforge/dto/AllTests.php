<?php

require_once(dirname(__FILE__) . '/../../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');

class AllScriptureforgeDtoTests extends TestSuite {
	
    function __construct() {
        parent::__construct();
        $this->addFile(TestPath . 'scriptureforge/dto/ProjectSettingsDto_Test.php');
    }

}

?>
