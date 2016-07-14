<?php
require_once __DIR__ . '/../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';

class AllScriptureForgeTests extends TestSuite
{
    public function __construct()
    {
        parent::__construct();
        $this->addFile(TestPhpPath . 'scriptureforge/commands/AllTests.php');
        $this->addFile(TestPhpPath . 'scriptureforge/dto/AllTests.php');
        $this->addFile(TestPhpPath . 'scriptureforge/Sfchecks/AllTests.php');
    }

}
