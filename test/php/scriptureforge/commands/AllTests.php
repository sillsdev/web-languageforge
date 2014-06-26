<?php

require_once(dirname(__FILE__) . '/../../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');

class AllScriptureforgeCommandsTests extends TestSuite {
	
    function __construct() {
        parent::__construct();
        $this->addFile(TestPath . 'scriptureforge/commands/TextCommands_Test.php');
        $this->addFile(TestPath . 'scriptureforge/commands/SessionCommands_Test.php');
        $this->addFile(TestPath . 'scriptureforge/commands/QuestionCommands_Test.php');
    }

}

?>
