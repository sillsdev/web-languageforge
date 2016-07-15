<?php

require_once __DIR__ . '/../../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';

class AllSfchecksTests extends TestSuite
{
    public function __construct()
    {
        parent::__construct();
        $this->addFile(TestPhpPath . 'scriptureforge/Sfchecks/SfchecksProjectModel_Test.php');
    }

}
