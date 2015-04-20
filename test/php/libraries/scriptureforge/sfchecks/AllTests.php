<?php

require_once dirname(__FILE__) . '/../../../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';

class AllLibrariesScriptureForgeSfchecksTests extends TestSuite
{
    public function __construct()
    {
        parent::__construct();
        $this->addFile(TestPath . 'libraries/scriptureforge/sfchecks/SfchecksReports_Test.php');
    }

}
