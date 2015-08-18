<?php

require_once __DIR__ . '/../../../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';

class AllLexiconModelTests extends TestSuite
{
    public function __construct()
    {
        parent::__construct();
        $this->addFile(TestPath . 'languageforge/lexicon/models/LexEntryModel_Test.php');
        $this->addFile(TestPath . 'languageforge/lexicon/models/SenseModel_Test.php');
    }

}
