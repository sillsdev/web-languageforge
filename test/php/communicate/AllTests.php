<?php
require_once __DIR__ . '/../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';

class AllCommunicateTests extends TestSuite
{
    public function __construct()
    {
        parent::__construct();
        $this->addFile(TestPhpPath . 'communicate/Communicate_Test.php');
    }

}
