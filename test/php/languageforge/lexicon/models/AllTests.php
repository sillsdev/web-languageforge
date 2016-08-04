<?php

require_once __DIR__ . '/../../../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';

class AllLexiconModelTests extends TestSuite
{
    public function __construct()
    {
        parent::__construct();
        $this->addFile(TestPhpPath . 'languageforge/lexicon/models/LexEntryModel_Test.php');
        $this->addFile(TestPhpPath . 'languageforge/lexicon/models/LexSenseModel_Test.php');
    }

}
