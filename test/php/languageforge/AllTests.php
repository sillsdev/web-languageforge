<?php
require_once __DIR__ . '/../TestConfig.php';
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
