<?php

require_once __DIR__ . '/../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';

class AllSharedTests extends TestSuite
{
    public function __construct()
    {
        parent::__construct();
        $this->addFile(TestPath . 'shared/commands/AllTests.php');
        $this->addFile(TestPath . 'shared/dto/AllTests.php');
    }

}
