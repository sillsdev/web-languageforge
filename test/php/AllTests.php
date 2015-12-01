<?php
require_once __DIR__ . '/TestConfig.php';
require_once SimpleTestPath . 'autorun.php';

class AllTests extends TestSuite
{
    public function __construct()
    {
        parent::__construct();
        $this->addFile(TestPhpPath . 'api/AllTests.php');
        $this->addFile(TestPhpPath . 'model/AllTests.php');
        $this->addFile(TestPhpPath . 'mapper/AllTests.php');
        $this->addFile(TestPhpPath . 'communicate/AllTests.php');
        $this->addFile(TestPhpPath . 'libraries/AllTests.php');
        $this->addFile(TestPhpPath . 'languageforge/AllTests.php');
        $this->addFile(TestPhpPath . 'scriptureforge/AllTests.php');
        $this->addFile(TestPhpPath . 'shared/AllTests.php');
    }
}
