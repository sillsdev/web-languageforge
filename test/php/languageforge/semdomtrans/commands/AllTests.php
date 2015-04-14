<?php

require_once dirname(__FILE__) . '/../../../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';

class AllSemDomTransCommandsTests extends TestSuite
{
    public function __construct()
    {
        parent::__construct();
        $this->addFile(TestPath . 'languageforge/semdomtrans/commands/SemDomTransItemCommands_Test.php');
        $this->addFile(TestPath . 'languageforge/semdomtrans/commands/SemDomTransProjectCommands_Test.php');
    }
}
