<?php
require_once dirname(__FILE__) . '/../../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';

class AllCommandsTests extends TestSuite
{
    public function __construct()
    {
        parent::__construct();
        $this->addFile(TestPath . 'shared/commands/ProjectCommands_Test.php');
        $this->addFile(TestPath . 'shared/commands/UserCommands_Test.php');
    }

}
