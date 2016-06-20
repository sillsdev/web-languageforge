<?php
require_once __DIR__ . '/../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';

class AllLanguageForgeTests extends TestSuite
{
    public function __construct()
    {
        parent::__construct();
        $this->addFile(TestPhpPath . 'languageforge/lexicon/AllTests.php');
        $this->addFile(TestPhpPath . 'languageforge/semdomtrans/AllTests.php');
    }

}
