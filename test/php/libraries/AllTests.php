<?php

require_once dirname(__FILE__) . '/../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';

class AllLibrariesTests extends TestSuite
{
    public function __construct()
    {
        parent::__construct();
        $this->addFile(TestPath . 'libraries/scriptureforge/AllTests.php');
        $this->addFile(TestPath . 'libraries/AuthHelper_Test.php');
        $this->addFile(TestPath . 'libraries/LanguageData_Test.php');
        $this->addFile(TestPath . 'libraries/ParatextExport_Test.php');
        $this->addFile(TestPath . 'libraries/Website_Test.php');
    }

}
