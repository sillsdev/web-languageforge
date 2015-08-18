<?php
require_once __DIR__ . '/../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';

class AllMapperTests extends TestSuite
{
    public function __construct()
    {
        parent::__construct();
        $this->addFile(TestPath . 'mapper/json/AllTests.php');
        $this->addFile(TestPath . 'mapper/mongo/AllTests.php');
    }

}
