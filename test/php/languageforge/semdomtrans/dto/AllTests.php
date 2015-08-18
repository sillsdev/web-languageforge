<?php

require_once __DIR__ . '/../../../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';

class AllSemDomTransDtoTests extends TestSuite
{
    public function __construct()
    {
        parent::__construct();
        $this->addFile(TestPath . 'languageforge/semdomtrans/dto/SemDomTransEditDto_Test.php');
    }

}
