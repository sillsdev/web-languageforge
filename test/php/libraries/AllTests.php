<?php

require_once __DIR__ . '/../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';

class AllLibrariesTests extends TestSuite
{
    public function __construct()
    {
        parent::__construct();
        $this->addFile(TestPhpPath . 'libraries/scriptureforge/AllTests.php');
        $this->addFile(TestPhpPath . 'libraries/LanguageData_Test.php');
        $this->addFile(TestPhpPath . 'libraries/ParatextExport_Test.php');
        $this->addFile(TestPhpPath . 'libraries/Website_Test.php');
    }

}
