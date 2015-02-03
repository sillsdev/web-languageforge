<?php
require_once dirname(__FILE__) . '/TestConfig.php';
require_once SimpleTestPath . 'autorun.php';

class AllTests extends TestSuite
{
    public function __construct()
    {
        parent::__construct();
        $this->addFile(TestPath . 'api/AllTests.php');
        $this->addFile(TestPath . 'model/AllTests.php');
        $this->addFile(TestPath . 'mapper/AllTests.php');
        $this->addFile(TestPath . 'communicate/AllTests.php');
        $this->addFile(TestPath . 'libraries/AllTests.php');
        $this->addFile(TestPath . 'languageforge/AllTests.php');
        $this->addFile(TestPath . 'scriptureforge/AllTests.php');
        $this->addFile(TestPath . 'shared/AllTests.php');
    }
}
