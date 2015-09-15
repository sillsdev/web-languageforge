<?php

require_once __DIR__ . '/../../../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';

class AllLibrariesScriptureForgeSfchecksTests extends TestSuite
{
    public function __construct()
    {
        parent::__construct();
        $this->addFile(TestPath . 'libraries/scriptureforge/sfchecks/SfchecksReports_Test.php');
    }

}
