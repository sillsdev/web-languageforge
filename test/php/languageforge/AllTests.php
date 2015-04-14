<?php
require_once dirname(__FILE__) . '/../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';

class AllLanguageForgeTests extends TestSuite
{
    public function __construct()
    {
        parent::__construct();
        $this->addFile(TestPath . 'languageforge/lexicon/AllTests.php');
        $this->addFile(TestPath . 'languageforge/semdomtrans/AllTests.php');
    }

}
