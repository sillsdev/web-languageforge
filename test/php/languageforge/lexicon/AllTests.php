<?php

require_once __DIR__ . '/../../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';

class AllLexiconAppTests extends TestSuite
{
    public function __construct()
    {
        parent::__construct();
        $this->addFile(TestPhpPath . 'languageforge/lexicon/LexProjectModel_Test.php');
        $this->addFile(TestPhpPath . 'languageforge/lexicon/LexMultiParagraph_Test.php');
        $this->addFile(TestPhpPath . 'languageforge/lexicon/LiftImport_Test.php');
        $this->addFile(TestPhpPath . 'languageforge/lexicon/LiftImportFlex_Test.php');
        $this->addFile(TestPhpPath . 'languageforge/lexicon/LiftImportZip_Test.php');

        $this->addFile(TestPhpPath . 'languageforge/lexicon/commands/AllTests.php');
        $this->addFile(TestPhpPath . 'languageforge/lexicon/dto/AllTests.php');
        $this->addFile(TestPhpPath . 'languageforge/lexicon/models/AllTests.php');
    }

}
