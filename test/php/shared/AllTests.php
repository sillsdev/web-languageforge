<?php

require_once __DIR__ . '/../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';

class AllSharedTests extends TestSuite
{
    public function __construct()
    {
        parent::__construct();
        $this->addFile(TestPhpPath . 'shared/commands/AllTests.php');
        $this->addFile(TestPhpPath . 'shared/dto/AllTests.php');
    }

}
