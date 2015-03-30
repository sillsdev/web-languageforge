<?php

require_once dirname(__FILE__) . '/../../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';

class AllLexiconAppTests extends TestSuite
{
    public function __construct()
    {
        parent::__construct();
        $this->addFile(TestPath . 'languageforge/lexicon/LexiconProjectModel_Test.php');
        $this->addFile(TestPath . 'languageforge/lexicon/LiftImport_Test.php');
        $this->addFile(TestPath . 'languageforge/lexicon/LiftImportFlex_Test.php');
        $this->addFile(TestPath . 'languageforge/lexicon/LiftImportZip_Test.php');

        $this->addFile(TestPath . 'languageforge/lexicon/commands/AllTests.php');
        $this->addFile(TestPath . 'languageforge/lexicon/dto/AllTests.php');
        $this->addFile(TestPath . 'languageforge/lexicon/models/AllTests.php');
    }

}
