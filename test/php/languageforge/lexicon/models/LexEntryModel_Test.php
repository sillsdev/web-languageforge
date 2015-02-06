<?php
use models\languageforge\lexicon\LexEntryModel;

require_once dirname(__FILE__) . '/../../../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';
require_once TestPath . 'common/MongoTestEnvironment.php';

class TestLexEntryModel extends UnitTestCase
{

    public function testGetProperties_ConstructsCorrectTypes()
    {
        $e = new MongoTestEnvironment();
        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $entry = new LexEntryModel($project);

        $this->assertIsA($entry->senses, 'models\mapper\ArrayOf');
        $this->assertIsA($entry->customFields, 'models\mapper\ArrayOf');
        $this->assertIsA($entry->authorInfo, 'models\languageforge\lexicon\AuthorInfo');
        $this->assertIsA($entry->lexeme, 'models\languageforge\lexicon\MultiText');
        $this->assertIsA($entry->pronunciation, 'models\languageforge\lexicon\MultiText');
        $this->assertIsA($entry->cvPattern, 'models\languageforge\lexicon\MultiText');
        $this->assertIsA($entry->citationForm, 'models\languageforge\lexicon\MultiText');
        $this->assertIsA($entry->etymology, 'models\languageforge\lexicon\MultiText');
        $this->assertIsA($entry->etymologyGloss, 'models\languageforge\lexicon\MultiText');
        $this->assertIsA($entry->etymologyComment, 'models\languageforge\lexicon\MultiText');
        $this->assertIsA($entry->etymologySource, 'models\languageforge\lexicon\MultiText');
        $this->assertIsA($entry->note, 'models\languageforge\lexicon\MultiText');
        $this->assertIsA($entry->literalMeaning, 'models\languageforge\lexicon\MultiText');
        $this->assertIsA($entry->entryBibliography, 'models\languageforge\lexicon\MultiText');
        $this->assertIsA($entry->entryRestrictions, 'models\languageforge\lexicon\MultiText');
        $this->assertIsA($entry->summaryDefinition, 'models\languageforge\lexicon\MultiText');
        // Removed import residue. Its no longer a field we import CP 2014-10
        // $this->assertIsA($entry->entryImportResidue, 'models\languageforge\lexicon\MultiText');
        $this->assertIsA($entry->tone, 'models\languageforge\lexicon\MultiText');
        $this->assertIsA($entry->environments, 'models\languageforge\lexicon\LexiconMultiValueField');
        $this->assertIsA($entry->location, 'models\languageforge\lexicon\LexiconField');
    }
}
