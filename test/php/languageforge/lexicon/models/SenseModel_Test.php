<?php


use models\languageforge\lexicon\Sense;

require_once dirname(__FILE__) . '/../../../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';
require_once TestPath . 'common/MongoTestEnvironment.php';

class TestSenseModel extends UnitTestCase
{
    public function testGetProperties_ConstructsCorrectTypes()
    {
        $model = new Sense();

        $this->assertIsA($model->partOfSpeech, 'models\languageforge\lexicon\LexiconField');
        $this->assertIsA($model->semanticDomain, 'models\languageforge\lexicon\LexiconMultiValueField');
        $this->assertIsA($model->examples, 'models\mapper\ArrayOf');
        $this->assertIsA($model->customFields, 'models\mapper\MapOf');
        $this->assertIsA($model->authorInfo, 'models\languageforge\lexicon\AuthorInfo');
        $this->assertIsA($model->definition, 'models\languageforge\lexicon\MultiText');
        $this->assertIsA($model->gloss, 'models\languageforge\lexicon\MultiText');
        $this->assertIsA($model->scientificName, 'models\languageforge\lexicon\MultiText');
        $this->assertIsA($model->anthropologyNote, 'models\languageforge\lexicon\MultiText');
        $this->assertIsA($model->senseBibliography, 'models\languageforge\lexicon\MultiText');
        $this->assertIsA($model->discourseNote, 'models\languageforge\lexicon\MultiText');
        $this->assertIsA($model->encyclopedicNote, 'models\languageforge\lexicon\MultiText');
        $this->assertIsA($model->generalNote, 'models\languageforge\lexicon\MultiText');
        $this->assertIsA($model->grammarNote, 'models\languageforge\lexicon\MultiText');
        $this->assertIsA($model->phonologyNote, 'models\languageforge\lexicon\MultiText');
        $this->assertIsA($model->senseRestrictions, 'models\languageforge\lexicon\MultiText');
        $this->assertIsA($model->semanticsNote, 'models\languageforge\lexicon\MultiText');
        $this->assertIsA($model->sociolinguisticsNote, 'models\languageforge\lexicon\MultiText');
        $this->assertIsA($model->source, 'models\languageforge\lexicon\MultiText');
        $this->assertIsA($model->senseImportResidue, 'models\languageforge\lexicon\MultiText');
        $this->assertIsA($model->usages, 'models\languageforge\lexicon\LexiconMultiValueField');
        $this->assertIsA($model->reversalEntries, 'models\languageforge\lexicon\LexiconMultiValueField');
        $this->assertIsA($model->senseType, 'models\languageforge\lexicon\LexiconField');
        $this->assertIsA($model->academicDomains, 'models\languageforge\lexicon\LexiconMultiValueField');
        $this->assertIsA($model->sensePublishIn, 'models\languageforge\lexicon\LexiconMultiValueField');
        $this->assertIsA($model->anthropologyCategories, 'models\languageforge\lexicon\LexiconMultiValueField');
        $this->assertIsA($model->status, 'models\languageforge\lexicon\LexiconMultiValueField');
    }

}
