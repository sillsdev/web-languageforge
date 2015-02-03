<?php


use models\languageforge\lexicon\LexEntryModel;

require_once dirname(__FILE__) . '/../../../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';
require_once TestPath . 'common/MongoTestEnvironment.php';

class TestLexEntryModel extends UnitTestCase
{
    public function testGetProperties_ConstructsCorrectTypes()
    {
        $model = new LexEntryModel(new MockProjectModel());

        $this->assertIsA($model->senses, 'models\mapper\ArrayOf');
        $this->assertIsA($model->customFields, 'models\mapper\ArrayOf');
        $this->assertIsA($model->authorInfo, 'models\languageforge\lexicon\AuthorInfo');
        $this->assertIsA($model->lexeme, 'models\languageforge\lexicon\MultiText');
        $this->assertIsA($model->pronunciation, 'models\languageforge\lexicon\MultiText');
        $this->assertIsA($model->cvPattern, 'models\languageforge\lexicon\MultiText');
        $this->assertIsA($model->citationForm, 'models\languageforge\lexicon\MultiText');
        $this->assertIsA($model->etymology, 'models\languageforge\lexicon\MultiText');
        $this->assertIsA($model->etymologyGloss, 'models\languageforge\lexicon\MultiText');
        $this->assertIsA($model->etymologyComment, 'models\languageforge\lexicon\MultiText');
        $this->assertIsA($model->etymologySource, 'models\languageforge\lexicon\MultiText');
        $this->assertIsA($model->note, 'models\languageforge\lexicon\MultiText');
        $this->assertIsA($model->literalMeaning, 'models\languageforge\lexicon\MultiText');
        $this->assertIsA($model->entryBibliography, 'models\languageforge\lexicon\MultiText');
        $this->assertIsA($model->entryRestrictions, 'models\languageforge\lexicon\MultiText');
        $this->assertIsA($model->summaryDefinition, 'models\languageforge\lexicon\MultiText');
        // Removed import residue. Its no longer a field we import CP 2014-10
        // $this->assertIsA($model->entryImportResidue, 'models\languageforge\lexicon\MultiText');
        $this->assertIsA($model->tone, 'models\languageforge\lexicon\MultiText');
        $this->assertIsA($model->environments, 'models\languageforge\lexicon\LexiconMultiValueField');
        $this->assertIsA($model->location, 'models\languageforge\lexicon\LexiconField');
    }

}
