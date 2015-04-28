<?php

require_once dirname(__FILE__) . '/../../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';

class AllSemDomTransAppTests extends TestSuite
{
    public function __construct()
    {
        parent::__construct();
        $this->addFile(TestPath . 'languageforge/semdomtrans/commands/AllTests.php');
        $this->addFile(TestPath . 'languageforge/semdomtrans/dto/AllTests.php');
        $this->addFile(TestPath . 'languageforge/semdomtrans/models/AllTests.php');
    }

}
